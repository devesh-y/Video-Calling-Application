import { createContext } from "react";
import { io } from "socket.io-client";
const socket = io("https://crowdconnect-eibo.onrender.com");
// https://crowdconnect-eibo.onrender.com
//http://localhost:5000


export const SocketContext = createContext(socket);

function SocketProvider(props: any) {
    return <>
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>

    </>
}

export default SocketProvider;