import express from "express"
import http from "http"
import { config } from "dotenv";
import { Server } from "socket.io";
import crypto from "crypto";
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
    socket.on("create-room",()=>{
        const es = crypto.randomBytes(128).toString('base64').slice(0,20);
        var code:string="";
        var x:number=0;
        for(var i=0;i<20 && code.length<=11;i++){
            if((es[i]>='a' && es[i]<='z') || (es[i]>='A' && es[i]<='Z')|| (es[i]>='0' && es[i]<'9')){
                code+=es[i];
                x++;
            }
            if(x===3){
                code+='-';
                x=0;
            }
        }
        code=code.slice(0,-1);
        socket.join(code);
        socket.emit("room-created",code);
    });

    socket.on("join-meet",(code)=>{
        if(socketio.sockets.adapter.rooms.has(code)){
            socket.emit("meet-info","found");
        }
        else{
            socket.emit("meet-info","notfound");
        }
    })

});



httpserver.listen(process.env.PORT,()=>{
    console.log(`server is listening to ${process.env.PORT} `);
})
