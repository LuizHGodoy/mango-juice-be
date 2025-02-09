const Room = require('../../models/Room');

describe('Room Model', () => {
  let room;

  beforeEach(() => {
    room = new Room('Test Room');
  });

  test('deve criar uma sala com propriedades corretas', () => {
    expect(room.name).toBe('Test Room');
    expect(room.participants.size).toBe(0);
    expect(room.votes.size).toBe(0);
    expect(room.revealed).toBe(false);
    expect(room.currentTask).toBeNull();
  });

  test('deve adicionar participante corretamente', () => {
    room.addParticipant('123', 'João');
    expect(room.participants.get('123')).toBe('João');
  });

  test('deve remover participante corretamente', () => {
    room.addParticipant('123', 'João');
    room.removeParticipant('123');
    expect(room.participants.size).toBe(0);
    expect(room.votes.size).toBe(0);
  });

  test('deve adicionar voto corretamente', () => {
    room.addParticipant('123', 'João');
    room.addVote('123', '5');
    expect(room.votes.get('123')).toBe('5');
  });

  test('deve resetar votos corretamente', () => {
    room.addParticipant('123', 'João');
    room.addVote('123', '5');
    room.resetVotes();
    expect(room.votes.size).toBe(0);
    expect(room.revealed).toBe(false);
  });

  test('deve adicionar mensagem corretamente', () => {
    room.addMessage('123', 'João', 'Olá!');
    expect(room.messages.length).toBe(1);
    expect(room.messages[0].content).toBe('Olá!');
    expect(room.messages[0].senderName).toBe('João');
  });

  test('deve retornar estado correto quando não revelado', () => {
    room.addParticipant('123', 'João');
    room.addVote('123', '5');
    const state = room.getState();
    expect(state.votes['João']).toBe('?');
  });

  test('deve retornar estado correto quando revelado', () => {
    room.addParticipant('123', 'João');
    room.addVote('123', '5');
    room.revealed = true;
    const state = room.getState();
    expect(state.votes['João']).toBe('5');
  });

  test('deve calcular média corretamente', () => {
    room.addParticipant('123', 'João');
    room.addParticipant('456', 'Maria');
    room.addVote('123', '3');
    room.addVote('456', '5');
    expect(room.calculateAverage()).toBe(4);
  });

  test('deve calcular média corretamente com votos inválidos', () => {
    room.addParticipant('123', 'João');
    room.addParticipant('456', 'Maria');
    room.addVote('123', '?');
    room.addVote('456', 'café');
    expect(room.calculateAverage()).toBe(0);
  });
});
