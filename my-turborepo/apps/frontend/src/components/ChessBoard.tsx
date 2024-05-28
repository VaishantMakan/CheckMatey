/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import React, { useState } from "react";
import { MOVE } from "../../../../../common/messages";

export const ChessBoard = ({chess, setBoard ,socket, board} : {
    chess: Chess,
    setBoard: React.Dispatch<React.SetStateAction<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>>,

    socket: WebSocket,

    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]

}) => {

    const [from, setFrom] = useState<Square | null>(null);
    
    //Adding Drag-And-Drop Functionality for moving chess pieces

    const handleDragStart = (e: React.DragEvent, square: Square) => {
        e.dataTransfer.setData("text/plain", square);
        setFrom(square);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, to: Square) => {
        e.preventDefault();

        if(from) {
            socket.send(JSON.stringify({ //This will call => socket.on('message', (data) => {} method defined on the server side
                type: MOVE,
                payload: {
                    move: {
                        from: from,
                        to: to,
                    },
                },
            }));

            chess.move({ // updates the board for the current player's frontend
                from,
                to,
            });

            setBoard(chess.board());
            setFrom(null);
            setValidSquares([]);
        }
    }

    // VALID MOVES LOGIC HERE : 
    const [validSquares, setValidSquares] = useState<[number, number][]>([]) //array of tuples 

    const validMoves = (square: Square | null) => {
        const moves = chess.moves({ square: square! }) //fetch all possible moves from this square

        //convert move like 'e4' (e = file i.e column, 4 = rank i.e row) etc to indices of the board
        const algebricToIndices = (square: string): [number, number] => {
            let file: number, rank: number;

            if(square.length === 2) { //if move is like 'e4', 'h4' etc
                file = square.charCodeAt(0) - 'a'.charCodeAt(0);
                rank = 8 - parseInt(square.substring(1));
            } else if(square.length === 3) { // if move is three characters long (e.g., for pawn promotions like 'e8Q')
                //TODO: Check if logic works, maybe move string is in different format
                file = square.charCodeAt(1) - 'a'.charCodeAt(0);
                rank = 8 - parseInt(square.substring(2));
            } else {
                throw new Error("Invalid square notation / move");
            }

            return [rank, file];
        };

        //put the indices of all the possible moves 
        const moveIndices = moves.map(move => algebricToIndices(move));
        setValidSquares(moveIndices);
    }

    return <div className="text-black ">
        {board.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {

                    const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8-i) as Square

                    return <div 
                        key={j} 
                        className={`w-20 h-20 ${(i+j)%2 === 0 ? 'bg-blue-777' : 'bg-blue-778'}`} 
                        onDragOver={handleDragOver} //This event is triggered when a draggable element is being dragged over a valid drop target. 
                        onDrop={(e) => handleDrop(e, squareRepresentation)} //This event is triggered when the dragged element is dropped onto a valid drop target. Since this div represents this drop square hence onDrop and onDragOver defined here. 
                        >
                        <div className="flex justify-center w-full h-full">
                            {validSquares.length > 0 ? <div className={`${validSquares.some(square => square[0] === i && square[1] === j) ? "bg-yellow-200 absolute p-2 flex justify-center items-center  h-2 w-2 rounded-[50%]" : ""}`}></div> : null}
                            <div onClick={() => validMoves(square && square.square)} className="flex flex-col justify-center">
                                {square ? <img className="w-13" 
                                src={`/${square?.color === "b" ? "b" + square?.type : "w" + square?.type}.png`}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, squareRepresentation)} //The drag operation is initiated on the piece itself, not the square. Hence defined in this img.
                                /> : null
                                }
                            </div>
                        </div>
                    </div>
                })}

            </div>
        })}
    </div>
}
