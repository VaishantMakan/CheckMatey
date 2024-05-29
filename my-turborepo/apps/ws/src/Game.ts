import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { db } from "./db";
import { randomUUID } from "crypto";


export class Game {

    public gameId: string;
    public player1: WebSocket | null;
    public player2: WebSocket | null;
    public board: Chess;
    private startTime: Date;
    private moveCount: number = 0;

    constructor(player1: WebSocket, player2: WebSocket | null) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        // this.moveCount = 0;
        this.gameId = randomUUID();
    }

    async createGameHandler() {
        try {
            await this.createGameInDB();
        } catch (err) {
            console.log(err);
            return;
        }

        //let the players know that the game has started
        if(this.player1) {
            this.player1.send(JSON.stringify({ //this will call => socket.onmessage = (event) => { } method defined on the client side
                type: INIT_GAME,
                payload: {
                    color: "white",
                    gameId: this.gameId
                }
            }));
        }

        if(this.player2) {
            this.player2.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "black"
                }
            }));
        }

    }

    async createGameInDB() {
        const game = await db.game.create({
            //TODO: Add user details when auth is complete

            data: {
                id: this.gameId,
                timeControl: "CLASSICAL",
                status: "IN_PROGRESS",
                currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                whitePlayer: {
                    create: {},
                },
                blackPlayer: {
                    create: {},
                },
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            }
        })

        this.gameId = game.id;
    }

    async addMoveToDB(move: {
        from: string,
        to: string
    }) {
        await db.$transaction([
            db.move.create({
                data: {
                    gameId: this.gameId,
                    moveNumber: this.moveCount + 1,
                    startFen: move.from,
                    endFen: move.to,
                    createdAt: new Date(Date.now()),
                    notation: this.board.fen()
                }
            }),

            db.game.update({
                data: {
                    currentFen: this.board.fen()
                },
                where: {
                    id: this.gameId
                } 
            })
        ])
    }
    

    async makeMove(player: WebSocket, move: {from: string, to: string}) {

        //validate the type of move using zod

        //validate if it is the user's move or not
        if (this.moveCount % 2 === 0 && player !== this.player1) {
            return;
        }

        if (this.moveCount % 2 === 1 && player !== this.player2) {
            return;
        }

        console.log("Before");
        console.log(this.moveCount);
        console.log(this.board.ascii());
        
        //make the move
        try {
            this.board.move(move); //pushes the move and updates the board
        } catch(e) {
            console.log(e);
            return;
        }

        await this.addMoveToDB(move);
        
        //check if the game is over
        if(this.board.isGameOver()) {
            //send the game over message to both the players
            
            if(this.player1) {
                this.player1.send(JSON.stringify({ //this will call => socket.onmessage = (event) => { } method defined on the client side
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }));
            }

            if(this.player2) {
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }));
            }

            return;
        }
        console.log("After");
        console.log(this.moveCount);
        console.log(this.board.ascii());
        //If game not over then send the updated board to both the players

        //since here for one player, the board has been updated, but this player's move will not be visible to 
        //other player yet, so we send the current player's move to the other player also to update their board.
        if(this.moveCount % 2 === 0) {
            if(this.player2) {
                this.player2.send(JSON.stringify({ 
                    type: MOVE,
                    payload: move
                }));
            }
        } else {
            if(this.player1) {
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }));
            }
        }

        this.moveCount++;
            
    }
}