import {useContext, useState, useEffect, useCallback, memo} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient.ts";
import { useSelector, useDispatch } from "react-redux"
import { peerservice } from "../WebRTC/p2p.ts";
import {setscreen, setvideo, setaudio, sethands, setpinvideo, setpinname} from "../../ReduxStore/slice1.ts";
import { BsMic, BsMicMute, BsPeople, BsChatLeftText } from "react-icons/bs";
import { BiVideoOff, BiVideo } from "react-icons/bi";
import { TbScreenShare, TbScreenShareOff } from "react-icons/tb";
import { FaRegHandPaper } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import "./toolbar.css"
import {StoreType} from "../../ReduxStore/store.ts";

const Toolbars=memo(()=> {
    const {code}=useParams();
    const [micstate, setmic] = useState("off");
    const [videostate, setvideostate] = useState("off")
    const [raisehand, sethand] = useState("off");
    const [screenshare, setscreenshare] = useState("off");
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const screen=useSelector((state:StoreType)=>state.slice1.screen);
    const remotestream = useSelector((state: StoreType) => state.slice1.remotestream);
    const video=useSelector((state:StoreType)=>state.slice1.video);
    const audio = useSelector((state: StoreType) => state.slice1.audio);
    const mapping = useSelector((state: StoreType) => state.slice1.mapping);
    const hands= useSelector((state: StoreType) => state.slice1.hands);
    const dispatch = useDispatch();

    const screenOffFunc=useCallback((id:string)=>{
        setscreenshare("off");
        const array = Array.from(remotestream);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            const videosenders = peer.peer.getSenders().filter((sender) => {
                return sender.track && (sender.track.kind === "video") && sender.track.id === id;
            });
            try {
                videosenders.forEach((videosender) => {
                    console.log("sender found");
                    peer.peer.removeTrack(videosender)
                })
            }
            catch (err) {
                console.log(err);
            }
        })
        dispatch(setscreen(null));
        dispatch(setpinvideo(null))
        dispatch(setpinname("You"));
        socket.emit("stopscreen", code);
    },[code, dispatch, remotestream, socket])

    const sendTrackFunc=useCallback(({id,from}:{id:string,from:string})=>{
        if (screen && screen.getVideoTracks()[0].id === id){
            console.log("sending screen of id ",id);
            const peer = mapping.get(from);
            if (peer) {
                console.log("screen track added");
                peer.peer.addTrack(screen.getVideoTracks()[0], screen);
            }
        }
    },[mapping, screen])
    useEffect(()=>{
        socket.on("sendtrack",sendTrackFunc)
        return ()=>{
            socket.off("sendtrack",sendTrackFunc)
        }
    },[sendTrackFunc, socket])
    const openclosepanel=useCallback((option: string)=> {
        if ((document.getElementById(option) as HTMLElement).style.right == "" || (document.getElementById(option) as HTMLElement).style.right == "-400px"){
            if(option==="panelchat"){
                (document.getElementById("panelpeople") as HTMLElement).style.right = "-400px";
            }else{
                (document.getElementById("panelchat") as HTMLElement).style.right = "-400px";
            }
        }
        const value:string = (document.getElementById(option) as HTMLElement).style.right;
        if (value ==="0px"){
            (document.getElementById(option) as HTMLElement).style.right = "-400px";
        }
        else{
            (document.getElementById(option) as HTMLElement).style.right = "0px";
        }

    },[])
    return <div id="toolbar">
        <div title="mic" style={{ backgroundColor: micstate==="off"?"red":"rgb(92, 87, 87)" }} onClick={async() => {
            if (micstate === "on") {
                setmic("off");

                const array = Array.from(remotestream);
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
                audio?.getAudioTracks().forEach((track) => track.stop());
                dispatch(setaudio(null));


            }
            else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: false, audio: true
                    });
                    console.log("sending audio");
                    const audiotrack = stream.getAudioTracks()[0];
                    const array = Array.from(remotestream);
                    array.forEach((data) => {
                        const peer: peerservice = data[0];
                        console.log("track added");
                        peer.peer.addTrack(audiotrack, stream);
                    })
                    dispatch(setaudio(stream));
                    setmic("on");
                }
                catch (error) {
                    console.log(error);
                }
            }
        }} className="toolicons">
            {micstate === "on" ? <BsMic size='20' />:  <BsMicMute size='20' />}
        </div>
        <div title="camera" style={{ backgroundColor:videostate==="off"?"red":"rgb(92, 87, 87)" }} onClick={async() => {
            if (videostate === "on") {
                const id =(screen!=null)? screen.getVideoTracks()[0].id : "abc";
                setvideostate("off");

                const array = Array.from(remotestream);
                array.forEach((data) => {
                    const peer: peerservice = data[0];
                    const videosenders = peer.peer.getSenders().filter((sender) => {
                        return sender.track && sender.track.kind === "video" && (sender.track.id!=id);
                    });
                    try {
                        videosenders.forEach((videosender) => {
                            console.log("sender found");
                            peer.peer.removeTrack(videosender)
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }
                })

                video?.getVideoTracks().forEach((track) => track.stop());
                dispatch(setvideo(null));
                dispatch(setpinvideo(null));
                socket.emit("stopvideo", code);

            }
            else {
                const stream= await navigator.mediaDevices.getUserMedia({
                    video:true,audio:false
                });
                dispatch(setvideo(stream));
                setvideostate("on")
                try {
                    console.log("sending video");
                    const videotrack = stream.getVideoTracks()[0];
                    const array = Array.from(remotestream);
                    array.forEach((data) => {
                        const peer: peerservice = data[0];
                        console.log("track added");
                        peer.peer.addTrack(videotrack, stream);
                    })
                }
                catch (error) {
                    console.log(error);
                }

            }
        }} className="toolicons">
            {videostate === "on" ? <BiVideo size='20' /> : <BiVideoOff size='20' />
       }
        </div>
        <div id="screensharebtn" title="Share Screen" style={{backgroundColor:screenshare==="off"?"red":"rgb(92, 87, 87)"}} className="toolicons" onClick={async () =>
        {
            if (screenshare === "off") {

                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true
                    })
                    const id = stream.getVideoTracks()[0].id;
                    stream.getVideoTracks()[0].onended = ()=>{
                        screenOffFunc(id);
                    };
                    dispatch(setscreen(stream));
                    setscreenshare("on");
                    const videotrack = stream.getVideoTracks()[0];
                    socket.emit("trackinfo",{id:videotrack.id,code});


                } catch (error) {

                    console.log("user rejects");
                }
            }
            else {
                if(screen) {
                    const id = screen.getVideoTracks()[0].id;
                    screenOffFunc(id);
                    screen.getVideoTracks().forEach((track) => track.stop());
                }

            }
        }}>
            {screenshare === "on" ? <TbScreenShare size='20' /> : <TbScreenShareOff size='20' /> }
        </div>
        <div title="Raise Hand" style={{backgroundColor:raisehand==="off"?"rgb(92, 87, 87)":"#407fbf"}}  onClick={() => {
            if (raisehand === "off") {
                sethand("on")
                socket.emit("handonoff",{type:"raise",code});
                const thands=new Map(hands);
                thands.set(socket.id,"You");
                dispatch(sethands(thands));
            }
            else {
                sethand("off");
                socket.emit("handonoff", { type: "lower", code });
                const thands = new Map(hands);
                thands.delete(socket.id);
                dispatch(sethands(thands));

            }
        }} className="toolicons">

            <FaRegHandPaper size='20' />


        </div>
        {/* <div className="toolicons">
            <BsThreeDotsVertical size='20' />
        </div> */}
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
        {/* <div title="Admin Controls" className="othertools">
            <MdOutlineAdminPanelSettings size='20'  />
        </div> */}
    </div>
})
export default Toolbars;