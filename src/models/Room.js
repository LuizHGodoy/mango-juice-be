const { v4: uuidv4 } = require("uuid");

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
			(v) => !isNaN(Number(v)) && v !== "?" && v !== "café"
		);
		if (validVotes.length === 0) return 0;
		return validVotes.reduce((sum, curr) => sum + Number(curr), 0) / validVotes.length;
	}
}

module.exports = Room;
