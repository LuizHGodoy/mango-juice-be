const express = require("express");
const http = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
	}),
);
app.use(express.json());

const rooms = new Map();

class Room {
	constructor(name) {
		this.id = uuidv4();
		this.name = name;
		this.participants = new Map();
		this.votes = new Map();
		this.currentTask = null;
		this.revealed = false;
		this.history = [];
		this.messages = [];
	}

	addParticipant(id, name) {
		this.participants.set(id, name);
	}

	removeParticipant(id) {
		this.votes.delete(id);
		this.participants.delete(id);
	}

	addVote(id, value) {
		this.votes.set(id, value);
	}

	resetVotes() {
		this.votes.clear();
		this.revealed = false;
	}

	addMessage(senderId, senderName, content) {
		this.messages.push({
			id: uuidv4(),
			senderId,
			senderName,
			content,
			timestamp: new Date().toISOString(),
		});
	}

	getState() {
		return {
			participants: Array.from(this.participants.values()),
			votes: this.revealed
				? Object.fromEntries(
						Array.from(this.votes.entries()).map(([id, vote]) => [
							this.participants.get(id),
							vote,
						]),
					)
				: Object.fromEntries(
						Array.from(this.votes.keys()).map((id) => [
							this.participants.get(id),
							"?",
						]),
					),
			revealed: this.revealed,
			currentTask: this.currentTask,
			messages: this.messages.slice(-50),
			name: this.name,
		};
	}

	calculateAverage() {
		const validVotes = Array.from(this.votes.values()).filter(
			(v) => v !== "?" && !Number.isNaN(v),
		);
		if (validVotes.length === 0) return 0;
		return (
			validVotes.reduce((sum, curr) => sum + Number(curr), 0) /
			validVotes.length
		);
	}
}

app.post("/api/rooms", (req, res) => {
	const { name } = req.body;
	const room = new Room(name);
	rooms.set(room.id, room);
	res.json({ room_id: room.id });
});

io.on("connection", (socket) => {
	let currentRoom = null;
	let participantName = null;

	socket.on("join_room", ({ roomId, username }) => {
		const room = rooms.get(roomId);
		if (!room) {
			socket.emit("error", "Sala não encontrada");
			return;
		}

		currentRoom = room;
		participantName = username;

		room.addParticipant(socket.id, username);
		socket.join(roomId);

		io.to(roomId).emit("room_state", room.getState());
		io.to(roomId).emit("message", `${username} entrou na sala`);
	});

	socket.on("vote", ({ value }) => {
		if (!currentRoom) return;

		currentRoom.addVote(socket.id, value);
		io.to(currentRoom.id).emit("room_state", currentRoom.getState());

		if (currentRoom.votes.size === currentRoom.participants.size) {
			currentRoom.revealed = true;
			io.to(currentRoom.id).emit("room_state", currentRoom.getState());
		}
	});

	socket.on("new_task", ({ task }) => {
		if (!currentRoom) return;

		currentRoom.currentTask = task;
		currentRoom.resetVotes();

		io.to(currentRoom.id).emit("votes_reset");

		io.to(currentRoom.id).emit("room_state", currentRoom.getState());
	});

	socket.on("reveal", () => {
		if (!currentRoom) return;

		currentRoom.revealed = true;
		if (currentRoom.currentTask && currentRoom.votes.size > 0) {
			currentRoom.history.push({
				task: currentRoom.currentTask,
				votes: currentRoom.getState().votes,
				average: currentRoom.calculateAverage(),
				timestamp: new Date().toISOString(),
			});
		}
		io.to(currentRoom.id).emit("room_state", currentRoom.getState());
	});

	socket.on("reset", () => {
		if (!currentRoom) return;

		currentRoom.resetVotes();

		io.to(currentRoom.id).emit("votes_reset");

		io.to(currentRoom.id).emit("room_state", currentRoom.getState());
	});

	socket.on("start_reveal", () => {
		if (!currentRoom) return;

		io.to(currentRoom.id).emit("start_countdown");

		setTimeout(() => {
			currentRoom.revealed = true;
			if (currentRoom.currentTask && currentRoom.votes.size > 0) {
				currentRoom.history.push({
					task: currentRoom.currentTask,
					votes: currentRoom.getState().votes,
					average: currentRoom.calculateAverage(),
					timestamp: new Date().toISOString(),
				});
			}
			io.to(currentRoom.id).emit("room_state", currentRoom.getState());
		}, 3000);
	});

	socket.on("send_message", ({ message }) => {
		if (!currentRoom || !participantName) return;

		currentRoom.addMessage(socket.id, participantName, message);
		io.to(currentRoom.id).emit("room_state", currentRoom.getState());
	});

	socket.on("disconnect", () => {
		if (currentRoom) {
			currentRoom.removeParticipant(socket.id);
			io.to(currentRoom.id).emit("room_state", currentRoom.getState());
			io.to(currentRoom.id).emit("message", `${participantName} saiu da sala`);
		}
	});
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
