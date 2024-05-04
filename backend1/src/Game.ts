import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {

    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    private startTime: Date;
    private moveCount: number;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.moveCount = 0;

        //let the players know that the game has started

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            }
        }));

        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }

    makeMove(player: WebSocket, move: {from: string, to: string}) {

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
        
        //check if the game is over
        if(this.board.isGameOver()) {
            //send the game over message to both the players
            
            this.player1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));

            this.player2.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));

            return;
        }
        console.log("After");
        console.log(this.moveCount);
        console.log(this.board.ascii());
        //If game not over then send the updated board to both the players

        if(this.moveCount % 2 === 0) {
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        } else {
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        }

        this.moveCount++;
            
    }
}