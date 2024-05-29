import { WebSocket } from "ws";
import { INIT_GAME, JOIN_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import {db} from "./db";

export class GameManager {

    private games: Game[];
    private pendingUser: WebSocket | null; //not a list/queue bcuz at any given point there can be only one pending user since 2 player game
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
        this.users = this.users.filter(user => user !== socket);

        //stop the game here because the user left the game || reconnect logic 
        const gameIndex = this.games.findIndex(game => game.player1 === socket || game.player2 === socket);

        if(gameIndex !== -1) {
            const game = this.games[gameIndex];

            //if the socket being removed is of player one and player2 is still there then disconnection message case else game end
            //vice-versa
            if(game.player1 === socket) {
                game.player1 = null;

                if(game.player2) {
                    game.player2.send(JSON.stringify({type: "OPPONENT_DISCONNECTED"}));
                } else {
                    this.games.splice(gameIndex, 1);
                }
            }
            else if(game.player2 === socket) {
                game.player2 = null;

                if(game.player1) {
                    game.player1.send(JSON.stringify({type: "OPPONENT_DISCONNECTED"}));
                } else {
                    this.games.splice(gameIndex, 1);
                }
            }
        }

    }

    private addHandler(socket: WebSocket) {
        socket.on('message', async (data) => {
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

            //join some particular game
            if(message.type === JOIN_GAME) {
                if(message.payload?.gameId) {
                    const {payload : { gameId } } = message; // it extracts gameId from payload and stores it in constant named gameId
                
                    const availableGame = this.games.find(game => game.gameId === gameId);

                    if(availableGame) {

                        //fetch details of the available game
                        const { player1, player2, gameId, board } = availableGame;

                        //if already 2 players present in the game then cannot join 
                        if(player1 && player2) {
                            socket.send(JSON.stringify({
                                type: "GAME_FULL"
                            }));

                            return;
                        }

                        if(!player1) {
                            availableGame.player1 = socket;
                            player2?.send(JSON.stringify({type: "OPPONENT_JOINED"}))
                        } 
                        else if(!player2) {
                            availableGame.player2 = socket;
                            player1?.send(JSON.stringify({type: "OPPONENT_JOINED"}))
                        }
                        
                        socket.send(JSON.stringify({
                            type: "GAME_JOINED",
                            payload: {
                                gameId,
                                board
                            }
                        }));

                        return;
                    } else {
                        //check DB if not able to find in cache

                        //If a game with that gameId is found, it also fetches all the moves associated with the game,
                        //ordered by moveNumber in ascending order.
                        const gameFromDB = await db.game.findUnique({
                            where: {
                                id: gameId,
                            },
                            include: {
                                moves: {
                                    orderBy: {
                                        moveNumber: "asc"
                                    }
                                },
                            }
                        })

                        //create a new instance of the game in the cache
                        const game = new Game(socket, null);

                        //replay all the moves from db to get the current state of the game and store in cache
                        gameFromDB?.moves.forEach((move) => {
                            game.board.move(move);
                        })
                        
                        this.games.push(game); //cached in local memory

                        //Notify the client
                        socket.send(JSON.stringify({
                            type: "GAME_JOINED",
                            payload: {
                                gameId: gameId,
                                board: game.board
                            }
                        }))
                    }
                }
            }
        })
    }
}