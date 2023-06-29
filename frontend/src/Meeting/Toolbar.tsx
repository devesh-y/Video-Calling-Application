import {  useContext, useRef, useState,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import { useSelector, useDispatch } from "react-redux"
import { peerservice } from "../WebRTC/p2p";
import { setscreen ,setvideo,setaudio} from "../ReduxStore/slice1";
import { BsMic, BsMicMute, BsThreeDotsVertical, BsPeople, BsChatLeftText } from "react-icons/bs";
import { BiVideoOff, BiVideo } from "react-icons/bi";
import { TbScreenShare, TbScreenShareOff } from "react-icons/tb";
import { FaRegHandPaper } from "react-icons/fa";
import { MdCallEnd, MdOutlineAdminPanelSettings } from "react-icons/md";
import "./toolbar.css"
import { Socket } from "socket.io-client";
function Toolbars(props: any) {
    const {code}=useParams();
    const { myscreen} = props;
    const videoref=useRef<HTMLDivElement| null>(null);
    const audioref=useRef<HTMLDivElement| null>(null);
    const screenref = useRef<HTMLDivElement | null>(null);
    const [micstate, setmic] = useState("off");
    const [videostate, setvideostate] = useState("off")
    const [raisehand, sethand] = useState("off");
    const [screenshare, setscreenshare] = useState("off");
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const screen:MediaStream=useSelector((state:any)=>state.slice1.screen);
    const remotestream = useSelector((state: any) => state.slice1.remotestream);
    const video=useSelector((state:any)=>state.slice1.video);
    const audio = useSelector((state: any) => state.slice1.audio);
    const mapping:Map<Socket,peerservice> = useSelector((state: any) => state.slice1.mapping);
    const dispatch = useDispatch();
    useEffect(()=>{
        socket.on("sendtrack",(data:any)=>{
            const { id,from}=data; 
            if (screen && screen.getVideoTracks()[0].id === id){
                console.log("sending screen of id ",id);
                let peer = mapping.get(from);
                if (peer) {
                    console.log("screen track added");
                    
                    peer.peer.addTrack(screen.getVideoTracks()[0], screen);
                }
                
            }
            
        })

        return ()=>{
            socket.off("sendtrack")
        }
    },[mapping,screen])
    function openclosepanel(option: string) {   
        if ((document.getElementById(option) as HTMLElement).style.right == "" || (document.getElementById(option) as HTMLElement).style.right == "-400px"){
            if(option==="panelchat"){
                (document.getElementById("panelpeople") as HTMLElement).style.right = "-400px"; 
            }else{
                (document.getElementById("panelchat") as HTMLElement).style.right = "-400px"; 
            }
        }
        let value:string = (document.getElementById(option) as HTMLElement).style.right;
        if (value ==="0px"){
            (document.getElementById(option) as HTMLElement).style.right = "-400px"; 
        }
        else{
            (document.getElementById(option) as HTMLElement).style.right = "0px";
        }
           
    }
    return <div id="toolbar">
        <div title="mic" ref={audioref} style={{ backgroundColor: "red" }} onClick={async() => {
            if (micstate === "on") {
                setmic("off");
                
                const array = Array.from(remotestream as Map<peerservice, Array<MediaStream | string | null>>);
                array.forEach((data) => {
                    const peer: peerservice = data[0];
                    const audiosenders = peer.peer.getSenders().filter((sender) => {
                        return sender.track && sender.track.kind === "audio";
                    });

                    try { 
                        audiosenders.forEach((audiosender) => {
                            console.log("sender found");
                            peer.peer.removeTrack(audiosender as RTCRtpSender)
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }

                })
                socket.emit("stopaudio", code);
                audio.getAudioTracks().forEach((track: MediaStreamTrack) => track.stop());
                dispatch(setaudio(null));
                if (audioref.current) {
                    audioref.current.style.backgroundColor = "red";
                }
            }
            else {
                try {
                    let stream = await navigator.mediaDevices.getUserMedia({
                        video: false, audio: true
                    });
                    console.log("sending audio");
                    let audiotrack = stream.getAudioTracks()[0];
                    const array = Array.from(remotestream as Map<peerservice, Array<MediaStream | string | null>>);
                    array.forEach((data) => {
                        const peer: peerservice = data[0];
                        console.log("track added");
                        peer.peer.addTrack(audiotrack, stream);
                    })
                    dispatch(setaudio(stream));
                    setmic("on");
                    if (audioref.current) {
                        audioref.current.style.backgroundColor = "rgb(92, 87, 87)";
                    }

                }
                catch (error) {
                    console.log(error);
                }
            }
        }} className="toolicons">
            {micstate === "on" ? <BsMic size='20' />:  <BsMicMute size='20' />}
        </div>
        <div title="camera" ref={videoref} style={{ backgroundColor: "red" }} onClick={async() => {
            if (videostate === "on") {
                const id =(screen!=null)? screen.getVideoTracks()[0].id : "abc";                
                setvideostate("off");
                
                const array = Array.from(remotestream as Map<peerservice, Array<MediaStream | string|null>>);
                array.forEach((data) => {
                    const peer: peerservice = data[0];
                    const videosenders = peer.peer.getSenders().filter((sender) => {
                        return sender.track && sender.track.kind === "video" && (sender.track.id!=id);
                    });
                    try {
                        videosenders.forEach((videosender) => {
                            console.log("sender found");
                            peer.peer.removeTrack(videosender as RTCRtpSender)
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }
                })
                
                video.getVideoTracks().forEach((track: MediaStreamTrack) => track.stop());
                dispatch(setvideo(null));
                if (videoref.current){
                    videoref.current.style.backgroundColor = "red";
                }
                socket.emit("stopvideo", code);
                
            }
            else {
                let stream= await navigator.mediaDevices.getUserMedia({
                    video:true,audio:false
                });
                dispatch(setvideo(stream));
                setvideostate("on")
                try {
                    console.log("sending video");
                    let videotrack = stream.getVideoTracks()[0];
                    const array = Array.from(remotestream as Map<peerservice, Array<MediaStream | string|null>>);
                    array.forEach((data) => {
                        const peer: peerservice = data[0];
                        console.log("track added");
                        peer.peer.addTrack(videotrack, stream);
                    })
                }
                catch (error) {
                    console.log(error);
                }
                if (videoref.current) {
                    videoref.current.style.backgroundColor = "rgb(92, 87, 87)";
                }    
            }
        }} className="toolicons">
            {videostate === "on" ? <BiVideo size='20' /> : <BiVideoOff size='20' />
       }
        </div>
        <div title="Share Screen" ref={screenref} className="toolicons" onClick={async () => 
        {
            if (screenshare === "off") {
                
                try {
                    let stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true
                    })
                    const id = stream.getVideoTracks()[0].id;
                    stream.getVideoTracks()[0].onended = ()=>{
                        myscreen.current.querySelector('.userview').querySelector("video").srcObject = null;
                        myscreen.current.style.display = "none";

                        if (screenref.current) {
                            screenref.current.style.backgroundColor = "rgb(92, 87, 87)";
                        }
                        setscreenshare("off");
                        const array = Array.from(remotestream as Map<peerservice, Array<MediaStream | string | null>>);
                        array.forEach((data) => {
                            const peer: peerservice = data[0];
                            const videosenders = peer.peer.getSenders().filter((sender) => {
                                return sender.track && (sender.track.kind === "video") && sender.track.id === id;
                            });
                            try {
                                videosenders.forEach((videosender) => {
                                    console.log("sender found");
                                    peer.peer.removeTrack(videosender as RTCRtpSender)
                                })
                            }
                            catch (err) {
                                console.log(err);
                            }
                        })
                        dispatch(setscreen(null));
                        socket.emit("stopscreen", code);
                    }; 
                    dispatch(setscreen(stream));
                    setscreenshare("on");
                    myscreen.current.style.display="block";
                    myscreen.current.querySelector('.userview').querySelector("video").srcObject=stream;   
                    let videotrack = stream.getVideoTracks()[0];
                    if (screenref.current) {
                        screenref.current.style.backgroundColor = "#407fbf";
                    }     
                    socket.emit("trackinfo",{id:videotrack.id,code});

                    
                } catch (error) {

                    console.log("user rejects");
                }
            }
            else {
                const id = screen.getVideoTracks()[0].id;
            
                myscreen.current.querySelector('.userview').querySelector("video").srcObject=null;
                myscreen.current.style.display="none";
                
                if(screenref.current){
                    screenref.current.style.backgroundColor = "rgb(92, 87, 87)";
                }
                setscreenshare("off");
                const array = Array.from(remotestream as Map<peerservice, Array<MediaStream | string | null>>);
                array.forEach((data) => {
                    const peer: peerservice = data[0];
                    const videosenders = peer.peer.getSenders().filter((sender) => {
                        return sender.track && (sender.track.kind ==="video") && sender.track.id===id;
                    });
                    try {
                        videosenders.forEach((videosender) => {
                            console.log("sender found");
                            peer.peer.removeTrack(videosender as RTCRtpSender)
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }
                })
                screen.getVideoTracks().forEach((track: MediaStreamTrack) => track.stop());
                dispatch(setscreen(null));
                socket.emit("stopscreen",code);
            }
        }}>
            {screenshare === "on" ? <TbScreenShare size='20' /> : <TbScreenShareOff size='20' /> }
        </div>
        <div title="Raise Hand" onClick={(e: any) => {
            if (raisehand === "off") {
                sethand("on")
                e.currentTarget.style.backgroundColor = "#407fbf"
            }
            else {
                sethand("off")
                e.currentTarget.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="toolicons">
        
            <FaRegHandPaper size='20' />
 

        </div>
        <div className="toolicons">
            <BsThreeDotsVertical size='20' />
        </div>
        <div title="End Call" onClick={() => {
            socket.disconnect();
            navigate(`/end`, { replace: true });

        }} className="toolicons" style={{ borderRadius: "30px", width: "70px", backgroundColor: "red" }}>
            <MdCallEnd size='20'  />
        </div>
        <div title="Participants" className="othertools" onClick={() => openclosepanel("panelpeople")}>
            <BsPeople size='20'  />

        </div>
        <div title="Chat" className="othertools" onClick={() => openclosepanel("panelchat")} >
            <BsChatLeftText size='20'  />

        </div>
        <div title="Admin Controls" className="othertools">
            <MdOutlineAdminPanelSettings size='20'  />
        </div>
    </div>
}
export default Toolbars;