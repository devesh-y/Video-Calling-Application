import http from "http"
import { config } from "dotenv";
import { Server } from "socket.io";
import crypto from "crypto";
config();


const httpserver=http.createServer();

const socketio = new Server(httpserver,{
    cors: {
        origin: [`${process.env.WEBSITE}`]
    }
});
const socketroom=new Map();
const socketusername=new Map();
const roomhost=new Map();
socketio.on("connection", (socket) => {
    console.log(`connected to client of id ${socket.id}`);
    console.log(`Total connected sockets: ${socketio.sockets.sockets.size}`);
    socket.on("create-room",()=>{
        const es = crypto.randomBytes(128).toString('base64').slice(0,20);
        let code: string = "";
        let x: number = 0;
        for(let i=0; i<20 && code.length<=11; i++){
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
        socket.emit("create-room",code);
        console.log("room created");
        
    });
    socket.on("check-meet",(code:string)=>{
        if (socketio.sockets.adapter.rooms.has(code)) {
            socket.emit("check-meet", true);
        }
        else {
            socket.emit("check-meet", false);
        }
    })
    socket.on("join-meet",({code,type,name}:{code:string,type:string,name:string})=>{
        socket.join(code);
        socketroom.set(socket.id,code);
        socketusername.set(socket.id,name);
        if(type==="host"){
            roomhost.set(code,socket.id);
        }
        socket.emit("join-meet");
    })

    //sending offer to new user from existing
    socket.on("redirectoffers",({to,offer,selfname}:{to:string,offer:RTCSessionDescriptionInit ,selfname:string})=>{
        socket.to(to).emit("offerscame",{offer,from:socket.id,remotename:selfname});
    })

    //triggering existing users to send offers to new user
    socket.on("sendoffers",({code,selfname}:{code:string,selfname:string})=>{
        socket.to(code).emit("sendoffers",{to:socket.id,remotename:selfname});
    })
    

    //sending answers - both
    socket.on("sendAnswer",({to,myanswer }:{to:string,myanswer:RTCSessionDescriptionInit})=>{
        socket.to(to).emit("sendAnswer",{answer:myanswer,from:socket.id});
    })


    //handling negotiation
    socket.on("peer:negoNeeded",({offer,to}:{offer:RTCSessionDescriptionInit,to:string})=>{
        socket.to(to).emit("peer:negoNeeded",{from:socket.id,offer});
    })

    socket.on("peer:negodone",({to,answer}:{to:string,answer:RTCSessionDescriptionInit})=>{
        socket.to(to).emit("peer:negofinal",{from:socket.id,answer})
    })

    socket.on("stopvideo",(code:string)=>{
        socket.to(code).emit("stopvideo",socket.id);
    })
    socket.on("stopaudio",(code:string)=>{
        socket.to(code).emit("stopaudio",socket.id);
    })
    socket.on("stopscreen",(code:string)=>{
        socket.to(code).emit("stopscreen", socket.id);
    })
    socket.on("trackinfo",({id,code}:{id:string,code:string})=>{
        socket.to(code).emit("trackinfo",{id,from:socket.id});
    })
    socket.on("sendtrack",({id,from}:{id:string,from:string})=>{
        socket.to(from).emit("sendtrack",{id,from:socket.id});
    })
    //asking permission of host to enter
    socket.on("askhost",({code,name}:{code:string,name:string})=>{
        let temphost=roomhost.get(code);
        socket.to(temphost).emit("askhost",{name,to:socket.id});
        console.log("asking to ",temphost)
    })
    socket.on("hostdecision",({answer,to}:{answer:boolean,to:string})=>{
        socket.to(to).emit("hostdecision",answer);
    })
    //sending chat messages
    socket.on("chatmessage",({uName,message}:{uName:string,message:string})=>{
        let room=socketroom.get(socket.id);
        socket.to(room).emit("chatmessage", { uName, message });
    })
    socket.on("handonoff",({type,code}:{type:string,code:string})=>{
        socket.to(code).emit("handonoff",{type,from:socket.id});
    })
    socket.on("disconnect",()=>{
        console.log("socket disconnected");
        if(socketroom.get(socket.id)){
            socket.to(socketroom.get(socket.id)).emit("disconnectuser", socket.id);
            socketroom.delete(socket.id)
            socketusername.delete(socket.id);
            let temproom = socketroom.get(socket.id);
            if (roomhost.get(temproom) === socket.id) {
                roomhost.delete(temproom);
            }
        }
        
        
        
    })
});



httpserver.listen(process.env.PORT,()=>{
    console.log(`server is listening to ${process.env.PORT} `);
})
