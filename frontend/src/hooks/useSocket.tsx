import { useEffect, useState } from "react"

const WS_URL = "ws://localhost:8080";

export const useSocket = () => {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL); //the browser immediately attempts to establish a connection to the WebSocket server

        //defining the handlers
        ws.onopen = () => {
            console.log("connected");
            setSocket(ws);
        }

        ws.onclose = () => {
            console.log("disconnected");
            setSocket(null);
        }

        //cleanup process (called whenever the comp is unmounted)
        return () => {
            ws.close();
        }
    }, [])

    return socket;
}