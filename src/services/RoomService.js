const Room = require("../models/Room");

class RoomService {
	constructor() {
		this.rooms = new Map();
	}

	createRoom(name) {
		const room = new Room(name);
		this.rooms.set(room.id, room);
		return room;
	}

	getRoom(roomId) {
		return this.rooms.get(roomId);
	}

	removeRoom(roomId) {
		return this.rooms.delete(roomId);
	}

	listRooms() {
		return Array.from(this.rooms.values());
	}
}

module.exports = new RoomService();
