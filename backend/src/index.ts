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
    console.log(`Total connected sockets: ${socketio.sockets.sockets.size}`);
    var socketroom:any;
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
        socket.emit("create-room",code);
        socketroom = code;
        console.log("room created");
        
    });

    socket.on("join-meet",(code)=>{
        if(socketio.sockets.adapter.rooms.has(code)){
            socket.join(code);
            socketroom=code;
            socket.emit("join-meet","found"); 
            console.log("meet joined");
            
        }
        else{
            socket.emit("join-meet","notfound");
        }
    })

    //sending offer to new user from existing
    socket.on("redirectoffers",({to,offer,selfname})=>{
        socket.to(to).emit("offerscame",{offer,from:socket.id,remotename:selfname});
    })

    //triggering existing users to send offers to new user
    socket.on("sendoffers",({code,selfname})=>{        
        socket.to(code).emit("sendoffers",{to:socket.id,remotename:selfname});
    })
    

    //sending answers - both
    socket.on("sendAnswer",({to,myanswer })=>{
        socket.to(to).emit("sendAnswer",{answer:myanswer,from:socket.id});
    })


    //handling negotiation
    socket.on("peer:negoNeeded",({offer,to})=>{
        console.log("nego needed comes");
        
        socket.to(to).emit("peer:negoNeeded",{from:socket.id,offer});
    })

    socket.on("peer:negodone",({to,answer})=>{
        socket.to(to).emit("peer:negofinal",{from:socket.id,answer})
    })

    socket.on("stopvideo",(code)=>{
        socket.to(code).emit("stopvideo",socket.id);
    })
    socket.on("disconnect",()=>{
        console.log("socket disconnected");
        socket.to(socketroom).emit("disconnectuser",socket.id);
        
    })
});



httpserver.listen(process.env.PORT,()=>{
    console.log(`server is listening to ${process.env.PORT} `);
})
