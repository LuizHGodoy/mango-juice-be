# Planning Poker - Backend

Servidor Node.js para o Planning Poker, fornecendo API REST e comunicação em tempo real via WebSocket.

## 🚀 Tecnologias

- Node.js
- Express
- Socket.IO
- UUID

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório
```bash
git clone <seu-repositorio>
cd backend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=8000
FRONTEND_URL=http://localhost:3000
```

## 🏃‍♂️ Rodando o projeto

### Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

### Produção
```bash
npm start
# ou
yarn start
```

## 📦 Deploy

Para fazer deploy no Render:

1. Conecte seu repositório ao Render
2. Selecione "Web Service"
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Configure as variáveis de ambiente:
   - `PORT`: Porta do servidor (opcional)
   - `FRONTEND_URL`: URL do frontend
5. Deploy!

## 🔌 API REST

### POST /api/rooms
Cria uma nova sala de Planning Poker.

**Request:**
```json
{
  "name": "Nome da Sala"
}
```

**Response:**
```json
{
  "room_id": "uuid-da-sala"
}
```

## 🎮 Eventos Socket.IO

### Cliente → Servidor

| Evento | Descrição | Payload |
|--------|-----------|---------|
| `join_room` | Entra em uma sala | `{ roomId: string, username: string }` |
| `vote` | Registra um voto | `{ value: string }` |
| `new_task` | Define nova tarefa | `{ task: string }` |
| `reveal` | Revela os votos | - |
| `reset` | Reinicia a votação | - |
| `start_reveal` | Inicia contagem regressiva | - |

### Servidor → Cliente

| Evento | Descrição | Payload |
|--------|-----------|---------|
| `room_state` | Estado atual da sala | `RoomState` |
| `message` | Mensagens do sistema | `string` |
| `error` | Mensagens de erro | `string` |
| `start_countdown` | Inicia contagem regressiva | - |
| `votes_reset` | Reinicia votos | - |

## 📊 Estrutura de Dados

### RoomState
```typescript
interface RoomState {
  participants: string[];
  votes: Record<string, string>;
  revealed: boolean;
  currentTask: string | null;
  name: string;
}
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
