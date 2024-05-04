import { WebSocket } from "ws";

export class Game {

    public player1: WebSocket;
    public player2: WebSocket;
    private board: string;
    private moves: string[];
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = "";
        this.moves = [];
        this.startTime = new Date();
    }

    makeMove(player: WebSocket, move: string) {

        //validate if it is the user's move or not
        //validate if the move is valid

        //update the boad
        // push the move

        //check if the game is over

        //Send the updated board to both the players
    }
}