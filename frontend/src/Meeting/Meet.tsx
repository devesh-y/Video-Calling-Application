import { useContext, useState, useEffect, memo, useRef, useCallback, MutableRefObject, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meet.css"
import { ColorRing } from "react-loader-spinner";
import { peerservice } from "../WebRTC/p2p";
import ReactPlayer from "react-player";
function Toolbars() {
    const [micstate, setmic] = useState("mic");
    const [videostate, setvideo] = useState("videocam")
    const [raisehand, sethand] = useState("off");
    return <>
        <span onClick={(e: any): void => {
            if (micstate === "mic") {
                setmic("mic_off");
                e.target.style.backgroundColor = "red";
            }
            else {
                setmic("mic")
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="material-symbols-outlined toolicons">
            {micstate}
        </span>
        <span onClick={(e: any) => {
            if (videostate === "videocam") {
                setvideo("videocam_off");
                e.target.style.backgroundColor = "red";
            }
            else {
                setvideo("videocam")
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="material-symbols-outlined toolicons">
            {videostate}
        </span>
        <span className="material-symbols-outlined toolicons">
            present_to_all
        </span>
        <span onClick={(e: any) => {

            if (raisehand === "off") {
                sethand("on")
                e.target.style.backgroundColor = "#407fbf"
            }
            else {
                sethand("off")
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="material-symbols-outlined toolicons">
            back_hand
        </span>
        <span className="material-symbols-outlined toolicons">
            more_vert
        </span>
        <span className="material-symbols-outlined toolicons" style={{ borderRadius: "30px", width: "70px", backgroundColor: "red" }}>
            call_end
        </span>
        <span className="material-symbols-outlined">
            group
        </span>
        <span className="material-symbols-outlined">
            chat
        </span>
        <span className="material-symbols-outlined">
            admin_panel_settings
        </span>
    </>
}

const Myvideo = () => {
    const [stream, setstream] = useState<MediaStream>();
    useEffect(()=>{
        async function func(){
            const s = await navigator.mediaDevices.getUserMedia({
                audio: false, video: true
            });
            setstream(s);
        }
        func();
        
    },[])
    return <>
        <p>user</p>
        {stream != undefined && stream != null && <ReactPlayer playing muted url={stream} width="130px" height="100px" />}
    </>
};
const Participants = (props: any) => {
    
    const { streams} = props;
    console.log("the size of map is ",streams.size);
    
    return <>
        {Array.from(streams as Map<peerservice, MediaStream>).map(([_peer, stream], index) => {
            return <ReactPlayer key={index} playing muted url={stream} width="130px" height="100px" />
        })}
    </>
}

const  Videos=()=> {
    const mapping = useRef(new Map());
    const peerstream = useRef(new Map());
    const [_peers,setpeers]=useState(0);
    const { code } = useParams();
    const socket = useContext(SocketContext);
    const sendmedia=async ()=>{
        const s = await navigator.mediaDevices.getUserMedia({
            audio: false, video: true
        });
        const peerarray=Array.from(mapping.current);
        for (const track of s.getTracks()) {
            console.log("track added");

            peerarray[0][1].peer.addTrack(track, s);
        }
    }
    useEffect(() => {
        
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", code);
        console.log("triggering to get offers from existing users");


        //new user get offers from existing
        socket.on("offerscame",async ({ offer, from }) => {
            console.log("offer coming from existing users");
            const peer = new peerservice();
            
            // peer.peer.addEventListener("negotiationneeded", async () => {
            //     console.log("nego needed");
            // })

            peer.peer.addEventListener("track", (ev) => {
                console.log("track listerner called");
                const stream:MediaStream = ev.streams[0];
                peerstream.current.set(peer, stream);
                setpeers(peerstream.current.size);
            })
            
            mapping.current.set(from,peer);

            
            //answer this offer 
            try{
                const myanswer = await peer.getanswer(offer);
                socket.emit("sendAnswer", { to: from, myanswer });
                console.log("offer answered");
            }
            catch(err){
                console.log("error occured in answering the offer");
                
            }
        })


        // existing user send offer to new user
        socket.on("sendoffers", async (to) => {
            console.log("sending offers to new user");
            
            const peer = new peerservice();
            
            peer.peer.addEventListener("negotiationneeded", async () => {
                console.log("nego needed");
                const offer = await peer.getoffer();
                socket.emit("peer:negoNeeded", { offer, to });
            })

            

            mapping.current.set(to,peer);

            try {
                const offer = await peer.getoffer();
                socket.emit("redirectoffers", { to, offer });
                console.log("offer sent to new users");
            } catch (error) {
                console.log("error on sending offer");
            }
            
            
        })

        //user getting answers
        socket.on("sendAnswer",async ({ answer, from }) => {
            console.log("answers coming");
            console.log(mapping.current);
            const peer: peerservice = mapping.current.get(from);
            try{
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
                
                
            }
            catch(error){
                console.log(error);
                
                console.log("error in setting local description of answer recieved");
                
            }
  
        })

        socket.on("peer:negoNeeded", async ({ from, offer }) => {
            console.log("nego offer comes");
            
            const peer: peerservice = mapping.current.get(from);
            try {
                const answer = await peer.getanswer(offer);
                socket.emit("peer:negodone", { to: from, answer });
                console.log("nego offer answered");
                
            } catch (error) {
                console.log("error in sending answer in negotiating");
                
            }
            
            
        })
        socket.on("peer:negofinal", async ({ from, answer }) => 
        {
            console.log("nego answer comes");
            
            const peer: peerservice = mapping.current.get(from);
            try {
                
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
                
            }
            catch (error) {
                console.log(error);
                
                console.log("error in setting local description of answer recieved in negotiating");

            }
            
        })


        // on disconnect other users
        socket.on("disconnectuser", (from) => {
            const peer: peerservice = mapping.current.get(from);
            const stream = peerstream.current.get(peer)
            for (const track of stream.getTracks()) {
                track.stop();  
            }
            peer.peer.close();
            mapping.current.delete(from);
            peerstream.current.delete(peer);
            

        })
    }, [])



    return <>
    <button onClick={sendmedia}>Send Media</button>
        <Myvideo/>
        <Participants streams={peerstream.current} />
    </>
}
const WrongPage = () => {

    return <>
        <p>This link is either invalid or expired</p>
    </>
}
const MeetUI=()=>{
    return <>
        <div id="meet-container">
            <div id="crowdmeet">
                <div id="videos">
                    <Videos />
                </div>
                <div id="sidepanel">

                </div>
            </div>

            <div id="toolbar">
                <Toolbars />
            </div>

        </div>
    </>
}
function Meet() {
    const socket = useContext(SocketContext);
    const { code } = useParams();
    const [checking, checkstatus] = useState(true);
    const [valid, validity] = useState(false);
    useEffect(() => {
        socket.emit("join-meet", code);
        socket.on("join-meet", (check) => {
            
            if (check === "found") {
                validity(true);
            }
            else {
                validity(false);
            }
            checkstatus(false);
            socket.off("join-meet");
        })
    },[])
    
    return <>
        {(checking === true) ?
            <ColorRing
                visible={true}
                height="80"
                width="80"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
            /> : <>
                {(valid === false) ? <WrongPage /> : <MeetUI/>}
            </>




        }
    </>

}

export default Meet;