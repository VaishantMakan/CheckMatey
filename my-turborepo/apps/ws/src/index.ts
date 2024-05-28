import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) { //this gets called when => const ws = new WebSocket(WS_URL); gets called on the client side

  gameManager.addUser(ws);

  ws.on('close', () => gameManager.removeUser(ws));
  
});