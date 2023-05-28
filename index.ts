import express from "express"
import http from "http"
import { config } from "dotenv";
import { Server } from "socket.io";
config();
const app=express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const httpserver=http.createServer(app);

const socketio = new Server(httpserver,{
    cors: {
        origin: "*"
    }
});
socketio.on("connection", (socket) => {
    console.log(`connected to client of id ${socket.id}`);
});

httpserver.listen(process.env.PORT,()=>{
    console.log(`server is listening to ${process.env.PORT} `);
})