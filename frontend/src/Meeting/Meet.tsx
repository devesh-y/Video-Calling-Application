import { useContext, useState, useEffect, memo, useRef } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meet.css"
import { peerservice } from "../WebRTC/p2p";
import ReactPlayer from "react-player";
import { Socket } from "socket.io-client";
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

const Myvideo = memo(() => {
    const [mystream, setmystream] = useState<MediaStream>();
    useEffect(() => {

        const getmedia = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true, video: true
            });
            setmystream(stream);
        }
        getmedia();

    }, [mystream]);
    return <>
        {mystream!=undefined && <ReactPlayer playing muted url={mystream} width="130px" height="100px" />}
    </>
});
const Participants = (props: any) => {
    
    const { mymap} = props;
    console.log(mymap.size);
    const [remotestream,setremotestream]=useState<MediaStream>();
    const marray=Array.from(mymap as Map<Socket,peerservice>).map(([_socket,peer])=>{
        peer.peer.addEventListener("track", (ev)=>{
            const stream= ev.streams[0] ;
            setremotestream(stream);
        })
    });
    return <>
        return <ReactPlayer playing url={remotestream} width="130px" height="100px" />
    </>
}

function Videos() {
    const mapping= useRef(new Map());
    const { code } = useParams();
    const [peernumber,setpeers]=useState(0);
    const socket = useContext(SocketContext);
    
    useEffect(()=>{
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", code);
        console.log("triggering to get offers from existing users");
        

        //new user get offers from existing
        socket.on("offerscame", ({ offer, from }) => {
            console.log("offer coming from existing users");

            
            const peer = new peerservice();
            const newmap = new Map(mapping.current);
            newmap.set(from, peer);
            mapping.current=newmap;
            setpeers(mapping.current.size);
            async function answerandcreate() {
                //answer this offer 
                var myanswer = await peer.getanswer(offer);
                socket.emit("sendAnswer", { to: from, myanswer });
                console.log("offer answered");

                //and create your offer && send yours
                try {
                    var myoffer = await peer.getoffer();
                    socket.emit("OfferNewToExist", { myoffer, to: from });
                    console.log("offer sent to existing users ");

                } catch (error) {
                    console.log(error);

                    console.log("error in sending offers ");

                } 
            }
            answerandcreate();
            
        })


        // existing user send offer to new user
        socket.on("sendoffers", (to) => 
        {
            console.log("sending offers to new user");
            async function createoffer() {
                const peer = new peerservice();
                const newmap = new Map(mapping.current);
                newmap.set(to, peer);
                mapping.current=newmap;
                setpeers(mapping.current.size);
                var offer = await peer.getoffer();
                socket.emit("redirectoffers", { to, offer });
                console.log("offer sent to new users");
            }
            createoffer();
            
            

        })

        //existing user getting offer from new user
        socket.on("OfferNewToExist", ({ offer, from }) => {
            console.log("getting offer from new user");
            const peer = mapping.current.get(from);
            async function answeroffer() {
                var myanswer = await peer.getanswer(offer);
                socket.emit("sendAnswer", { to: from, myanswer });
                console.log("offer answered");
            }
            answeroffer();
            
    
        })

        //user getting answers
        socket.on("sendAnswer", ({ answer, from }) => {
            console.log("answers coming");
            console.log(mapping.current);
            
            var peer: peerservice = mapping.current.get(from);
            peer.setLocalDescription(answer); 
            async function attachmedia(){
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true, video: true
                });
                for (const track of stream.getTracks()) {
                    peer.peer.addTrack(track, stream);
                }
            }
            attachmedia();
        })
    },[])
    

    
    return <>
        <Myvideo />
        <Participants mymap={mapping.current} /> 
    </>
}

function Meet() {

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

export default Meet;