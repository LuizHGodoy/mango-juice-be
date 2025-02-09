const { Server } = require("socket.io");
const setupRoomHandlers = require("../handlers/roomHandler");

function setupSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL || "http://localhost:3000",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		setupRoomHandlers(socket, io);
	});

	return io;
}

module.exports = setupSocket;
