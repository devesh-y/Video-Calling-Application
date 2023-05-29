import { createContext } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
socket.on("connection", () => {
    console.log("connected to server");    
});
export const SocketContext = createContext(socket);

function SocketProvider(props: any) {
    return <>
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>

    </>
}

export default SocketProvider;