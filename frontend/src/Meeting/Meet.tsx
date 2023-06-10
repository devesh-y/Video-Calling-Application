import { useContext, useState, useEffect, useRef  ,memo, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meet.css"
import { ColorRing } from "react-loader-spinner";
import { peerservice } from "../WebRTC/p2p";
import ReactPlayer from "react-player";
function Toolbars(props:any) {
    const {setcamera,setvoice}=props;
    const [micstate, setmic] = useState("mic_off");
    const [videostate, setvideo] = useState("videocam_off")
    const [raisehand, sethand] = useState("off");
    return <>
        <span style={{backgroundColor:"red"}} onClick={(e: any): void => {
            if (micstate === "mic") {
                setmic("mic_off");
                setvoice(false);
                e.target.style.backgroundColor = "red";
            }
            else {
                setmic("mic")
                setvoice(true);
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="material-symbols-outlined toolicons">
            {micstate}
        </span>
        <span style={{ backgroundColor: "red" }} onClick={(e: any) => {
            if (videostate === "videocam") {
                setvideo("videocam_off");
                setcamera(false);
                e.target.style.backgroundColor = "red";
            }
            else {
                setvideo("videocam")
                setcamera(true);
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

const Myvideo = memo((props:any) => {
    const {code}=useParams();
    const socket=useContext(SocketContext);
    const {selfname,camera,voice ,remotestream}=props;
    const [video,setvideo]=useState<MediaStream |null>(null);
    const [audio,setaudio]=useState<MediaStream |null>(null);
    const sendvideo= useCallback( async()=>{
        let myvideo = await navigator.mediaDevices.getUserMedia({
            audio: false, video: true
        });
        const array=Array.from(remotestream.current as Map<peerservice,Array<MediaStream|string>>);
        array.forEach((data)=>{
            const peer:peerservice=data[0];
            
            for (const track of myvideo.getTracks()) {
                console.log("track added");
                peer.peer.addTrack(track, myvideo);
            }
        })  
        myvideo = await navigator.mediaDevices.getUserMedia({
            audio: false, video: true
        });
        array.forEach((data)=>{
            const peer:peerservice=data[0];
            
            for (const track of myvideo.getTracks()) {
                console.log("track added");
                peer.peer.addTrack(track, myvideo);
            }
        })  
    },[camera])
    const stopsendvideo=useCallback( ()=>{
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            const sender=peer.peer.getSenders()[0];
            try{
                peer.peer.removeTrack(sender)
            }
            catch(err){
                console.log(err);
            }
            
        })
        
    },[camera])
    const sendaudio=useCallback( async ()=>{
        let myaudio = await navigator.mediaDevices.getUserMedia({
            audio: true, video: false
        });
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];

            for (const track of myaudio.getTracks()) {
                console.log("track added");
                peer.peer.addTrack(track, myaudio);
            }
        })
        myaudio = await navigator.mediaDevices.getUserMedia({
            audio: true, video: false
        });
        array.forEach((data) => {
            const peer: peerservice = data[0];

            for (const track of myaudio.getTracks()) {
                console.log("track added");
                peer.peer.addTrack(track, myaudio);
            }
        })  
    },[voice])
    const stopsendaudio = useCallback(() => {
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            const sender = peer.peer.getSenders()[0];
            try {
                peer.peer.removeTrack(sender)
            }
            catch (err) {
                console.log(err);
            }

        })

    }, [voice])
    useEffect(()=>{
        async function func(){
            if(camera===true){
                const myvideo = await navigator.mediaDevices.getUserMedia({
                    audio: false, video: true
                });
                setvideo(myvideo);
                sendvideo();
            }
            if(voice===true){
                const myaudio = await navigator.mediaDevices.getUserMedia({
                    audio: true, video: false
                });
                setaudio(myaudio);
                sendaudio();
            }
            if(camera===false){
                setvideo(null);
                stopsendvideo();
                if(video!=null){
                    socket.emit("stopvideo",code);
                }
                
            }
            if(voice===false){
                setaudio(null);
                stopsendaudio();
                
            }
        }
        func();
        
    },[camera,voice])
    return <div className="usergrid">
                <div className="userview">
                    {video === null ? <div className="avatar">{selfname[0]} </div> : <ReactPlayer playing muted url={video}  height="120px" />}
                    {audio != null && <ReactPlayer  playing muted url={audio} width="0px" height="0px" />}
                </div>
                <div className="usertitle" >{selfname}</div>
            </div>
        
});
const Participants = (props: any) => {
    
    const { streams} = props;
    console.log("the size of map is ",streams.size);
    
    return <>
        {Array.from(streams as Map<peerservice, Array<string|MediaStream>>).map(([_peer, data], index) => {
            return <div key={index} className="usergrid"> 
                <div className="userview">
                    {data[0] === null ? <div className="avatar">{(data[2] as string)[0]} </div> : <ReactPlayer playing muted url={data[0]} height="120px" />}
                    {data[1] != null && <ReactPlayer playing muted url={data[1]} width="0px" height="0px" />}
                </div>
                <div className="usertitle" >{data[2] as string}</div>
            </div>
             
        })}
    </>
}

const Videos=(props:any)=> {
    const {mapping, remotestream,selfname,camera,voice}=props;
    const [peers,setpeers]=useState<number>(0);
    const { code } = useParams();
    const socket = useContext(SocketContext);
   
    useEffect(() => {
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", { code, selfname });
        console.log("triggering to get offers from existing users");


        //new user get offers from existing
        socket.on("offerscame", async ({ offer, from,remotename }) => {
            console.log("offer coming from existing users");
            const peer = new peerservice();
            remotestream.current.set(peer, [null, null, remotename])
            setpeers(remotestream.current.size);
            peer.peer.addEventListener("negotiationneeded", async () => {
                console.log("nego needed");
                const offer = await peer.getoffer();
                socket.emit("peer:negoNeeded", { offer, to:from });
            })

            peer.peer.addEventListener("track", (ev) => {
                console.log("track listerner called");
                if(ev.track.kind==="video"){
                    console.log("video track comes");
                    remotestream.current.get(peer)[0]=ev.streams[0];
                }
                let x:number= Math.floor(Math.random()*1000);
                if(x===peers){
                    x = Math.floor(Math.random() * 1000);
                }
                setpeers(x);
            })
            mapping.current.set(from, [peer,remotename]);

            //answer this offer 
            try {
                const myanswer = await peer.getanswer(offer);
                socket.emit("sendAnswer", { to: from, myanswer });
                console.log("offer answered");
                
            }
            catch (err) {
                console.log("error occured in answering the offer");

            }

        });

        // existing user send offer to new user
        socket.on("sendoffers", async ({to,remotename}) => {
            console.log("sending offers to new user");

            const peer = new peerservice();
            remotestream.current.set(peer, [null, null, remotename])
            setpeers(remotestream.current.size);
            peer.peer.addEventListener("negotiationneeded", async () => {
                console.log("nego needed");
                const offer = await peer.getoffer();
                socket.emit("peer:negoNeeded", { offer, to });
            })
            peer.peer.addEventListener("track", (ev) => {
                console.log("track listerner called");
                if (ev.track.kind === "video") {
                    console.log("video track comes");
                    remotestream.current.get(peer)[0] = ev.streams[0];
                }
                let x: number = Math.floor(Math.random() * 1000);
                if (x === peers) {
                    x = Math.floor(Math.random() * 1000);
                }
                setpeers(x);
            })
            mapping.current.set(to, [peer,remotename]);
            
            try {
                const offer = await peer.getoffer();
                socket.emit("redirectoffers", { to, offer,selfname });
                console.log("offer sent to new users");
            } catch (error) {
                console.log("error on sending offer");
            }

        });
        socket.on("stopvideo",(from)=>{
            const peer:peerservice=mapping.current.get(from)[0];
            remotestream.current.get(peer)[0]=null;
            let x: number = Math.floor(Math.random() * 1000);
            if (x === peers) {
                x = Math.floor(Math.random() * 1000);
            }
            setpeers(x);
        })
       

        socket.on("peer:negoNeeded", async ({ from, offer }) => {
            console.log("nego offer comes");
            const peer: peerservice = mapping.current.get(from)[0];
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
            const peer: peerservice = mapping.current.get(from)[0];
            try {
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
            }
            catch (error) {
                console.log(error);
                console.log("error in setting local description of answer recieved in negotiating");
            }
        })

    }, [])
    useEffect(()=>{

        //getting answers
        socket.on("sendAnswer", async ({ answer, from }) => {
            console.log("answers coming");
            console.log(mapping.current);
            const peer: peerservice = mapping.current.get(from)[0];
            try {
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("the state of camera is ", camera);

                if (camera === true) {
                    let myvideo = await navigator.mediaDevices.getUserMedia({
                        audio: false, video: true
                    });
                    for (const track of myvideo.getTracks()) {
                        console.log("track added");
                        peer.peer.addTrack(track, myvideo);
                    }
                    myvideo = await navigator.mediaDevices.getUserMedia({
                        audio: false, video: true
                    });
                    for (const track of myvideo.getTracks()) {
                        console.log("track added");
                        peer.peer.addTrack(track, myvideo);
                    }
                }

            }
            catch (error) {
                console.log(error);
                console.log("error in setting local description of answer recieved");
            }
            
        })
        return () => {
            socket.off("sendAnswer")
        }
    },[camera,voice])



    return <>
        <Myvideo selfname={selfname} camera={camera} voice={voice} remotestream={remotestream} />
        <Participants streams={remotestream.current} />    
    </>
}
const WrongPage = () => {

    return <>
        <p>This link is either invalid or expired</p>
    </>
}
const MeetUI=(props:any)=>{
    const  {selfname}=props;
    const [camera,setcamera]=useState(false);
    const [voice,setvoice]=useState(false);
    const mapping = useRef(new Map());
    const remotestream = useRef<Map<peerservice,Array<MediaStream|string>>>(new Map());
    
    return <>
        <div id="meet-container">
            <div id="crowdmeet">
                <div id="videos">
                    <Videos selfname={selfname} mapping={mapping} remotestream={remotestream} camera={camera} voice={voice} />
                </div>
                <div id="sidepanel">

                </div>
            </div>

            <div id="toolbar">
                <Toolbars setcamera={setcamera} setvoice={setvoice} />
            </div>

        </div>
    </>
}
function Meet() {
    const location = useLocation();
    const [selfname, setselfname] = useState("")
    const socket = useContext(SocketContext);
    const { code } = useParams();
    const [checking, checkstatus] = useState(false);
    const [valid, validity] = useState(false);
    useEffect(() => {
        socket.emit("join-meet", code);
        socket.on("join-meet", (check) => {
            
            if (check === "found") {
                validity(true);
                setselfname(location.state.selfname);
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
                {(valid === false) ? <WrongPage /> : <MeetUI selfname={selfname} />}
            </>




        }
    </>

}

export default Meet;