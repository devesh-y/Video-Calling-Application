import { createContext } from "react";
import { io } from "socket.io-client";
const socketio = io("http://localhost:5000");
socketio.on("connection", (socket) => {
    console.log("connected to server");
    console.log(socket);
    
});
export const SocketContext = createContext(socketio);

function SocketProvider(props: any) {
    return <>
        <SocketContext.Provider value={socketio}>
            {props.children}
        </SocketContext.Provider>

    </>
}

export default SocketProvider;