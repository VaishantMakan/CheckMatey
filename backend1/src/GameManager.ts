import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {

    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users.splice(this.users.indexOf(socket), 1);
        //stop the game here because the user left the game || reconnect logic 

    }

    private addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            //TODO: use grpc server for this in future

            const message = JSON.parse(data.toString());

            if(message.type === INIT_GAME) {
                if(this.pendingUser) {
                    //start the game
                    const game = new Game(this.pendingUser, socket)
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE) {
                //TODO: use grpc server for this in future
                
                //find the game
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);

                if(game) {
                    game.makeMove(socket, message.payload.move);
                }
            }
        })
    }
}