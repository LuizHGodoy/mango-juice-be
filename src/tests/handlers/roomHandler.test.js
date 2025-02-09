const setupRoomHandlers = require('../../handlers/roomHandler');
const RoomService = require('../../services/RoomService');

describe('roomHandler', () => {
  let io;
  let socket;
  let room;

  beforeEach(() => {
    RoomService.rooms.clear();

    socket = {
      id: 'socket-id-123',
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
    };

    io = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    room = RoomService.createRoom('Test Room');
  });

  test('deve entrar em uma sala existente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];

    joinRoomHandler({ roomId: room.id, username: 'João' });

    expect(socket.join).toHaveBeenCalledWith(room.id);
    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve emitir erro ao tentar entrar em sala inexistente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];

    joinRoomHandler({ roomId: 'sala-inexistente', username: 'João' });

    expect(socket.emit).toHaveBeenCalledWith('error', 'Sala não encontrada');
  });

  test('deve registrar voto corretamente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve revelar votos corretamente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    const revealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'reveal'
    )[1];
    revealHandler();

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve resetar votos corretamente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    const resetHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'reset'
    )[1];
    resetHandler();

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('votes_reset');
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve iniciar contagem regressiva corretamente', () => {
    jest.useFakeTimers();
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const startRevealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'start_reveal'
    )[1];
    startRevealHandler();

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('start_countdown');

    jest.advanceTimersByTime(3000);

    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve definir nova tarefa corretamente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const newTaskHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'new_task'
    )[1];
    newTaskHandler({ task: 'Nova Tarefa' });

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('votes_reset');
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve enviar mensagem corretamente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const sendMessageHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'send_message'
    )[1];
    sendMessageHandler({ message: 'Olá!' });

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
  });

  test('deve lidar com desconexão corretamente', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const disconnectHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'disconnect'
    )[1];
    disconnectHandler();

    expect(io.to).toHaveBeenCalledWith(room.id);
    expect(io.emit).toHaveBeenCalledWith('room_state', expect.any(Object));
    expect(io.emit).toHaveBeenCalledWith('message', 'João saiu da sala');
  });

  test('deve ignorar voto quando usuário não está em uma sala', () => {
    setupRoomHandlers(socket, io);

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  test('deve revelar automaticamente quando todos votaram', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const socket2 = {
      id: 'socket-id-456',
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
    };
    setupRoomHandlers(socket2, io);
    const joinRoom2Handler = socket2.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoom2Handler({ roomId: room.id, username: 'Maria' });

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    const vote2Handler = socket2.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    vote2Handler({ value: '3' });

    expect(room.revealed).toBe(true);
    expect(io.to).toHaveBeenLastCalledWith(room.id);
    expect(io.emit).toHaveBeenLastCalledWith('room_state', expect.any(Object));
  });

  test('deve ignorar reveal quando não há votos', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const revealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'reveal'
    )[1];
    revealHandler();

    expect(room.history.length).toBe(0);
  });

  test('deve adicionar ao histórico quando revelar com tarefa e votos', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const newTaskHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'new_task'
    )[1];
    newTaskHandler({ task: 'Nova Tarefa' });

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    const revealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'reveal'
    )[1];
    revealHandler();

    expect(room.history.length).toBe(1);
    expect(room.history[0].task).toBe('Nova Tarefa');
    expect(room.history[0].votes).toEqual({ João: '5' });
  });

  test('deve ignorar mensagem quando participantName é null', () => {
    setupRoomHandlers(socket, io);

    const sendMessageHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'send_message'
    )[1];
    sendMessageHandler({ message: 'Olá!' });

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  test('deve ignorar start_reveal quando sala não existe', () => {
    setupRoomHandlers(socket, io);

    const startRevealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'start_reveal'
    )[1];
    startRevealHandler();

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  test('deve ignorar new_task quando sala não existe mais', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    RoomService.removeRoom(room.id);

    io.to.mockClear();
    io.emit.mockClear();

    const newTaskHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'new_task'
    )[1];
    newTaskHandler({ task: 'Nova Tarefa' });

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  test('deve adicionar ao histórico após contagem regressiva', () => {
    jest.useFakeTimers();
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    const newTaskHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'new_task'
    )[1];
    newTaskHandler({ task: 'Nova Tarefa' });

    const voteHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'vote'
    )[1];
    voteHandler({ value: '5' });

    const startRevealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'start_reveal'
    )[1];
    startRevealHandler();

    jest.advanceTimersByTime(3000);

    expect(room.history.length).toBe(1);
    expect(room.history[0].task).toBe('Nova Tarefa');
    expect(room.history[0].votes).toEqual({ João: '5' });
  });

  test('deve ignorar reveal quando sala não existe mais', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    RoomService.removeRoom(room.id);
    io.to.mockClear();
    io.emit.mockClear();

    const revealHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'reveal'
    )[1];
    revealHandler();

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  test('deve ignorar reset quando sala não existe mais', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    RoomService.removeRoom(room.id);
    io.to.mockClear();
    io.emit.mockClear();

    const resetHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'reset'
    )[1];
    resetHandler();

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  test('deve ignorar disconnect quando sala não existe mais', () => {
    setupRoomHandlers(socket, io);

    const joinRoomHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'join_room'
    )[1];
    joinRoomHandler({ roomId: room.id, username: 'João' });

    RoomService.removeRoom(room.id);

    io.to.mockClear();
    io.emit.mockClear();

    const disconnectHandler = socket.on.mock.calls.find(
      (call) => call[0] === 'disconnect'
    )[1];
    disconnectHandler();

    expect(io.to).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
