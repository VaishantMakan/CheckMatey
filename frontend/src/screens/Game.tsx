/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"

import { GAME_OVER, INIT_GAME, MOVE } from "../../../common/messages";
import { useEffect, useState } from "react";

import { Chess } from "chess.js";

export const Game = () => {

    const socket = useSocket();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if(!socket)
            return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data); //TODO: Check this
            console.log(message);
            console.log(message.type);
            switch (message.type) {
                case INIT_GAME:
                    // setChess(new Chess());
                    setBoard(chess.board());
                    setStarted(true);
                    console.log("Game initialized");
                    break;
                case MOVE: { // '{' added to avoid Unexpected lexical declaration in case block error 
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    console.log("Move made");
                    break;
                }
                case GAME_OVER:
                    console.log("Game over");
                    break;
                default:
                    console.log("default ??");
                    break;
            }
        }

    }, [socket]);

    if(!socket)
        return <div> Connecting.... </div>
            

    return <div className="flex justify-center">
        <div className="w-full max-w-screen-lg pt-8">
            <div className="grid w-full grid-cols-6 gap-4">
                <div className="flex justify-center w-full col-span-4">
                    <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board}/>
                </div>
                <div className="flex justify-center w-full col-span-2 bg-zinc-900">
                    <div className="flex flex-col justify-center">
                        {!started && <Button onClick={() => {
                                socket.send(JSON.stringify({
                                    type: INIT_GAME
                                }))
                            }} > Start Game </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}