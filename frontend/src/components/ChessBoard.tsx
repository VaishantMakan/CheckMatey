/* eslint-disable @typescript-eslint/no-explicit-any */
import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../../../common/messages";

export const ChessBoard = ({chess, setBoard ,socket, board} : {
    chess: any,
    setBoard: any,
    socket: WebSocket,

    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]

}) => {

    const [from, setFrom] = useState<Square | null>(null);
    // const [to, setTo] = useState<Square | null>(null);

    return <div className="text-black ">
        {board.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {

                    const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8-i) as Square

                    return <div onClick={() => {
                        if(from === null) {
                            setFrom(squareRepresentation);
                        } else {
                            // setTo(square?.square ?? null);
                            socket.send(JSON.stringify({ //This will call => socket.on('message', (data) => {} method defined on the server side
                                type: MOVE,
                                payload: {
                                    move: {
                                        from: from,
                                        to: squareRepresentation
                                    }
                                }
                            }))

                            setFrom(null);
                            chess.move({ // updates the board for the current player's frontend
                                from: from,
                                to: squareRepresentation
                            });
                            setBoard(chess.board());
                            
                            console.log({
                                from: from,
                                to: squareRepresentation
                            })
                        }
                        

                    }} key={j} className={`w-20 h-20 ${(i+j)%2 === 0 ? 'bg-blue-777' : 'bg-blue-778'}`}>
                        <div className="flex justify-center w-full h-full">
                            <div className="flex flex-col justify-center">
                                {square ? <img className="w-13" src={`/${square?.color === "b" ? "b" + square?.type : "w" + square?.type}.png`}/> : null}
                            </div>
                        </div>
                    </div>
                })}

            </div>
        })}
    </div>
}