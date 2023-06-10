import { createContext } from "react";
import { io } from "socket.io-client";
const socket = io("https://crowdconnect-eibo.onrender.com");

export const SocketContext = createContext(socket);

function SocketProvider(props: any) {
    return <>
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>

    </>
}

export default SocketProvider;