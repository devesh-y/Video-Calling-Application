import { useContext, useState, useEffect, memo } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meet.css"
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

const Myvideo = memo((props: any) => {
    const { mystream } = props;
    return <>
        <ReactPlayer playing muted url={mystream} width="130px" height="100px" />
    </>
});
const Participants = (props: any) => {
    
    return <>

    </>
}
function Videos() {
    const [mapping,setmap]=useState(new Map());
    const { code } = useParams();
    const [mystream, setmystream] = useState<MediaStream | undefined>();
    const socket = useContext(SocketContext);
    

    //first triggering to get offers from existing  --for new user
    socket.emit("sendoffers", code);


    //new user get offers from existing
    socket.on("offerscame", ({offer,from}) => {
        //answer this offer 
        const peer = new peerservice();
        const newmap=new Map();
        newmap.set(from,peer);
        setmap(newmap);
        async function answeroffer(){
            return await peer.getanswer(offer,mystream);
        }
        const myanswer=answeroffer();
        socket.emit("sendAnswer",{to:from,myanswer});
        //and create your offer && send yours

        async function createoffer() {
            return await peer.getoffer();
        }
        const myoffer = createoffer();
        socket.emit("")
    })
    


   //existing user send offer to new user
    socket.on("sendoffers", (to) => {
        async function createoffer() {
            const peer = new peerservice();
            const newmap=new Map(mapping);
            newmap.set(to,peer);
            setmap(newmap)
            return await peer.getoffer();
        }
        const offer = createoffer();
        socket.emit("redirectoffers", {to,offer }); 
    })


    //existing user getting answer from new user
    socket.on("sendAnswer",({myanswer,from})=>{
        
    })

    
    useEffect(() => {
        const getmedia = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true, video: true
            });
            setmystream(stream);
        }
        getmedia();

    }, []);
    return <>
        <Myvideo mystream={mystream} />
        <Participants  />
    </>
}

function Meet() {
    const socket = useContext(SocketContext);
    const { code } = useParams();
    socket.emit("offersrequest", code);
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