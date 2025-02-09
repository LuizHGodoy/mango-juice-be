const RoomService = require('../../services/RoomService');

describe('RoomService', () => {
  beforeEach(() => {
    RoomService.rooms.clear();
  });

  test('deve criar uma sala corretamente', () => {
    const room = RoomService.createRoom('Nova Sala');
    expect(room.name).toBe('Nova Sala');
    expect(RoomService.rooms.size).toBe(1);
    expect(RoomService.rooms.get(room.id)).toBe(room);
  });

  test('deve obter uma sala existente', () => {
    const room = RoomService.createRoom('Nova Sala');
    const foundRoom = RoomService.getRoom(room.id);
    expect(foundRoom).toBe(room);
  });

  test('deve retornar undefined para sala inexistente', () => {
    const room = RoomService.getRoom('id-inexistente');
    expect(room).toBeUndefined();
  });

  test('deve remover uma sala corretamente', () => {
    const room = RoomService.createRoom('Nova Sala');
    RoomService.removeRoom(room.id);
    expect(RoomService.rooms.size).toBe(0);
    expect(RoomService.getRoom(room.id)).toBeUndefined();
  });

  test('deve listar todas as salas', () => {
    RoomService.createRoom('Sala 1');
    RoomService.createRoom('Sala 2');
    const rooms = RoomService.listRooms();
    expect(rooms.length).toBe(2);
    expect(rooms[0].name).toBe('Sala 1');
    expect(rooms[1].name).toBe('Sala 2');
  });
});
