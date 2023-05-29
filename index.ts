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
        var newcode:string="";
        var x:number=0;
        for(var i=0;i<20 && newcode.length<=11;i++){
            if((es[i]>='a' && es[i]<='z') || (es[i]>='A' && es[i]<='Z')|| (es[i]>='0' && es[i]<'9')){
                newcode+=es[i];
                x++;
            }
            if(x===3){
                newcode+='-';
                x=0;
            }
        }
        newcode=newcode.slice(0,-1);
        socketio.to(socket.id).emit("room-created",newcode);
    })
});



httpserver.listen(process.env.PORT,()=>{
    console.log(`server is listening to ${process.env.PORT} `);
})
