const RoomService = require('../services/RoomService');

function setupRoomHandlers(socket, io) {
  let currentRoom = null;
  let participantName = null;

  socket.on('join_room', ({ roomId, username }) => {
    const room = RoomService.getRoom(roomId);
    if (!room) {
      socket.emit('error', 'Sala não encontrada');
      return;
    }

    currentRoom = room;
    participantName = username;

    room.addParticipant(socket.id, username);
    socket.join(roomId);

    io.to(roomId).emit('room_state', room.getState());
    io.to(roomId).emit('message', `${username} entrou na sala`);
  });

  socket.on('vote', ({ value }) => {
    if (!currentRoom || !RoomService.getRoom(currentRoom.id)) {
      currentRoom = null;
      return;
    }

    currentRoom.addVote(socket.id, value);
    io.to(currentRoom.id).emit('room_state', currentRoom.getState());

    if (currentRoom.votes.size === currentRoom.participants.size) {
      currentRoom.revealed = true;
      io.to(currentRoom.id).emit('room_state', currentRoom.getState());
    }
  });

  socket.on('new_task', ({ task }) => {
    if (!currentRoom || !RoomService.getRoom(currentRoom.id)) {
      currentRoom = null;
      return;
    }

    currentRoom.currentTask = task;
    currentRoom.resetVotes();

    io.to(currentRoom.id).emit('votes_reset');
    io.to(currentRoom.id).emit('room_state', currentRoom.getState());
  });

  socket.on('reveal', () => {
    if (!currentRoom || !RoomService.getRoom(currentRoom.id)) {
      currentRoom = null;
      return;
    }

    currentRoom.revealed = true;
    if (currentRoom.currentTask && currentRoom.votes.size > 0) {
      currentRoom.history.push({
        task: currentRoom.currentTask,
        votes: currentRoom.getState().votes,
        average: currentRoom.calculateAverage(),
        timestamp: new Date().toISOString(),
      });
    }
    io.to(currentRoom.id).emit('room_state', currentRoom.getState());
  });

  socket.on('reset', () => {
    if (!currentRoom || !RoomService.getRoom(currentRoom.id)) {
      currentRoom = null;
      return;
    }

    currentRoom.resetVotes();
    io.to(currentRoom.id).emit('votes_reset');
    io.to(currentRoom.id).emit('room_state', currentRoom.getState());
  });

  socket.on('start_reveal', () => {
    if (!currentRoom) return;

    io.to(currentRoom.id).emit('start_countdown');

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
      io.to(currentRoom.id).emit('room_state', currentRoom.getState());
    }, 3000);
  });

  socket.on('send_message', ({ message }) => {
    if (!currentRoom || !participantName) return;

    currentRoom.addMessage(socket.id, participantName, message);
    io.to(currentRoom.id).emit('room_state', currentRoom.getState());
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !RoomService.getRoom(currentRoom.id)) {
      currentRoom = null;
      return;
    }

    currentRoom.removeParticipant(socket.id);
    io.to(currentRoom.id).emit('room_state', currentRoom.getState());
    io.to(currentRoom.id).emit('message', `${participantName} saiu da sala`);
  });
}

module.exports = setupRoomHandlers;
