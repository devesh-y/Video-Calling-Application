import { useContext, useState, useEffect, useRef, memo, useCallback} from "react";
import { useNavigate, useParams  } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meetUI.css"
import { peerservice } from "../WebRTC/p2p";
import ReactPlayer from "react-player";
import { IconContext } from "react-icons";
import { BsMic, BsMicMute, BsThreeDotsVertical, BsPeople, BsChatLeftText } from "react-icons/bs";
import {BiVideoOff,BiVideo} from "react-icons/bi";
import {TbScreenShare,TbScreenShareOff} from "react-icons/tb";
import {FaRegHandPaper} from "react-icons/fa";
import { MdCallEnd, MdOutlineAdminPanelSettings } from "react-icons/md";
import "./toolbar.css"
function Toolbars(props: any) {
    const { setcamera, setvoice } = props;
    const [micstate, setmic] = useState("off");
    const [videostate, setvideo] = useState("off")
    const [raisehand, sethand] = useState("off");
    const [screenshare,setscreenshare]=useState("off");
    const navigate=useNavigate();
    const socket=useContext(SocketContext);
    return <>
        <div style={{ backgroundColor: "red" }} onClick={(e: any): void => {
            if (micstate === "on") {
                setmic("off");
                setvoice(false);
                e.currentTarget.style.backgroundColor = "red";
            }
            else {
                setmic("on")
                setvoice(true);
                e.currentTarget.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="toolicons">
            {micstate === "on" ? <IconContext.Provider value={{className: "react-icons" }}>
                <BsMic/>
            </IconContext.Provider> : <IconContext.Provider value={{className: "react-icons" }}>
                    <BsMicMute />
            </IconContext.Provider> }
        </div>
        <div style={{ backgroundColor: "red" }} onClick={(e: any) => {
            if (videostate === "on") {
                setvideo("off");
                setcamera(false);
                e.currentTarget.style.backgroundColor = "red";
            }
            else {
                setvideo("on")
                setcamera(true);
                e.currentTarget.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="toolicons">
            {videostate === "on" ? <IconContext.Provider value={{className: "react-icons" }}>
                <BiVideo />
            </IconContext.Provider> :<IconContext.Provider value={{className: "react-icons" }}>
                    <BiVideoOff /> 
            </IconContext.Provider>  }
        </div>
        <div className="toolicons" onClick={(e: any)=>{
            if(screenshare==="off"){
                setscreenshare("on");
                e.currentTarget.style.backgroundColor = "#407fbf"
            }
            else{
                setscreenshare("off");
                e.currentTarget.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }}>
            {screenshare === "on" ? <IconContext.Provider value={{className: "react-icons" }}>
                <TbScreenShare />
            </IconContext.Provider> : <IconContext.Provider value={{className: "react-icons" }}>
                    <TbScreenShareOff />
            </IconContext.Provider> }
        </div>
        <div onClick={(e: any) => {
            if (raisehand === "off") {
                sethand("on")
                e.currentTarget.style.backgroundColor = "#407fbf"
            }
            else {
                sethand("off")
                e.currentTarget.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="toolicons">
            <IconContext.Provider value={{ className: "react-icons" }}>
                <FaRegHandPaper />
            </IconContext.Provider> 
            
        </div>
        <div className="toolicons">
            <IconContext.Provider value={{ className: "react-icons" }}>
                <BsThreeDotsVertical />
            </IconContext.Provider> 
           
        </div>
        <div onClick={()=>{
            socket.disconnect();
            navigate(`/end`, { replace: true });
            
        }} className="toolicons" style={{ borderRadius: "30px", width: "70px", backgroundColor: "red" }}>
            <IconContext.Provider value={{ className: "react-icons" }}>
                <MdCallEnd />
            </IconContext.Provider> 
            
        </div>
        <div>
            <IconContext.Provider value={{ className: "react-icons" }}>
                <BsPeople />
            </IconContext.Provider> 
           
        </div>
        <div>
            <IconContext.Provider value={{ className: "react-icons" }}>
                <BsChatLeftText />
            </IconContext.Provider> 
          
        </div>
        <div>
            <IconContext.Provider value={{ className: "react-icons" }}>
                <MdOutlineAdminPanelSettings />
            </IconContext.Provider> 
        </div>
    </>
}

const Myvideo = memo((props: any) => {
    const { code } = useParams();
    const socket = useContext(SocketContext);
    const { selfname, camera, voice, remotestream } = props;
    const [video, setvideo] = useState<MediaStream | null>(null);
    const [audiostate, setaudiostate] = useState(false);
    const [mycolor,setcolor]=useState("green");
    useEffect(()=>{
        const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
        const randomNumber = (Math.floor(Math.random() * 10)) % 9 + 1;
        setcolor(colors[randomNumber]);
    },[])
    const sendvideo = useCallback(async () => {
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: false, video: true
        });
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            let videotrack = stream.getVideoTracks()[0];
            console.log("track added");
            peer.peer.addTrack(videotrack, stream);

        })
        stream = await navigator.mediaDevices.getUserMedia({
            audio: false, video: true
        });
        array.forEach((data) => {
            const peer: peerservice = data[0];
            let videotrack = stream.getVideoTracks()[0];
            console.log("track added");
            peer.peer.addTrack(videotrack, stream);
        })
    }, [])
    const stopsendvideo = useCallback(() => {
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            const videosender = peer.peer.getSenders().find((sender) => {
                return sender.track && sender.track.kind === "video";
            });

            try {
                console.log("sender found");
                peer.peer.removeTrack(videosender as RTCRtpSender)
            }
            catch (err) {
                console.log(err);
            }

        })

    }, [])
    const sendaudio = useCallback(async () => {
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: true, video: false
        });
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            let audiotrack = stream.getAudioTracks()[0];
            console.log("track added");
            peer.peer.addTrack(audiotrack, stream);

        })
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true, video: false
        });
        array.forEach((data) => {
            const peer: peerservice = data[0];
            let audiotrack = stream.getAudioTracks()[0];
            console.log("track added");
            peer.peer.addTrack(audiotrack, stream);
        })
    }, [])
    const stopsendaudio = useCallback(() => {
        const array = Array.from(remotestream.current as Map<peerservice, Array<MediaStream | string>>);
        array.forEach((data) => {
            const peer: peerservice = data[0];
            const audiosender = peer.peer.getSenders().find((sender) => {
                return sender.track && sender.track.kind === "audio";
            });

            try {
                console.log("sender found");
                peer.peer.removeTrack(audiosender as RTCRtpSender)
            }
            catch (err) {
                console.log(err);
            }

        })

    }, [])
    useEffect(() => {
        async function func() {
            if (camera === true) {
                if (video === null) {
                    const myvideo = await navigator.mediaDevices.getUserMedia({
                        audio: false, video: true
                    });
                    setvideo(myvideo);
                    sendvideo();
                }

            }
            if (camera === false) {
                if (video != null) {
                    setvideo(null);
                    stopsendvideo();
                    socket.emit("stopvideo", code);
                }

            }
            if (voice === true) {
                if (audiostate === false) {
                    setaudiostate(true);
                    sendaudio();
                }
            }

            if (voice === false) {
                if (audiostate === true) {
                    setaudiostate(false);
                    stopsendaudio();
                    socket.emit("stopaudio", code);
                }
            }
        }
        func();

    }, [camera, voice])
    
    return <div className="usergrid">
        <div className="userview">
            {video === null ? <div className="avatar" style={{backgroundColor:`${mycolor}`}}>{selfname[0]} </div> : <ReactPlayer playing={true} muted={true} url={video} height="120px" />}
        </div>
        <div className="usertitle" >{selfname}</div>
    </div>

});
const Participants = (props: any) => {

    const { streams } = props;
    console.log("the size of map is ", streams.size);

    return <>
        {Array.from(streams as Map<peerservice, Array<string | MediaStream>>).map(([_peer, data], index) => {
            const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
            const randomNumber = (Math.floor(Math.random() * 10))%9 + 1;
            return <div key={index} className="usergrid">
                <div className="userview">
                    {data[0] === null ? <div className="avatar" style={{backgroundColor:`${colors[randomNumber]}`}}>{(data[2] as string)[0]} </div> : <ReactPlayer playing={true} muted={true} url={data[0]} height="120px" />}
                    {data[1] != null && <ReactPlayer playing={true} muted={false} url={data[1]} width="0px" height="0px" />}
                </div>
                <div className="usertitle" >{data[2] as string}</div>
            </div>

        })}
    </>
}

const Videos = memo((props: any) => {
    const { mapping, remotestream, selfname, camera, voice } = props;
    const [peers, setpeers] = useState<number>(0);
    const { code } = useParams();
    const socket = useContext(SocketContext);

    useEffect(() => {
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", { code, selfname });
        console.log("triggering to get offers from existing users");


        //new user get offers from existing
        socket.on("offerscame", async ({ offer, from, remotename }) => {
            console.log("offer coming from existing users");
            const peer = new peerservice();
            remotestream.current.set(peer, [null, null, remotename])
            setpeers(remotestream.current.size);
            peer.peer.addEventListener("negotiationneeded", async () => {
                console.log("nego needed");
                const offer = await peer.getoffer();
                socket.emit("peer:negoNeeded", { offer, to: from });
            })

            peer.peer.addEventListener("track", (ev) => {
                if (ev.track.kind === "video") {
                    console.log("video track comes");
                    let videostream = new MediaStream();
                    videostream.addTrack(ev.track);
                    remotestream.current.get(peer)[0] = videostream;
                }
                else if (ev.track.kind === "audio") {
                    console.log("audio track comes");
                    let audiostream = new MediaStream();
                    audiostream.addTrack(ev.track);
                    remotestream.current.get(peer)[1] = audiostream;
                }
                let x: number = Math.floor(Math.random() * 1000);
                if (x === peers) {
                    x = Math.floor(Math.random() * 1000);
                }
                setpeers(x);
            })
            mapping.current.set(from, peer);

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
        socket.on("sendoffers", async ({ to, remotename }) => {
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
                if (ev.track.kind === "video") {
                    console.log("video track comes");
                    let videostream = new MediaStream();
                    videostream.addTrack(ev.track);
                    remotestream.current.get(peer)[0] = videostream;
                }
                else if (ev.track.kind === "audio") {
                    console.log("audio track comes");
                    let audiostream = new MediaStream();
                    audiostream.addTrack(ev.track);
                    remotestream.current.get(peer)[1] = audiostream;
                }
                let x: number = Math.floor(Math.random() * 1000);
                if (x === peers) {
                    x = Math.floor(Math.random() * 1000);
                }
                setpeers(x);
            })
            mapping.current.set(to, peer);

            try {
                const offer = await peer.getoffer();
                socket.emit("redirectoffers", { to, offer, selfname });
                console.log("offer sent to new users");
            } catch (error) {
                console.log("error on sending offer");
            }

        });
        socket.on("stopvideo", (from) => {
            const peer: peerservice = mapping.current.get(from);
            remotestream.current.get(peer)[0] = null;
            let x: number = Math.floor(Math.random() * 1000);
            if (x === peers) {
                x = Math.floor(Math.random() * 1000);
            }
            setpeers(x);
        })
        socket.on("stopaudio", (from) => {
            const peer: peerservice = mapping.current.get(from);
            remotestream.current.get(peer)[1] = null;
            let x: number = Math.floor(Math.random() * 1000);
            if (x === peers) {
                x = Math.floor(Math.random() * 1000);
            }
            setpeers(x);
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
        socket.on("peer:negofinal", async ({ from, answer }) => {
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
        socket.on("disconnectuser", (from) => {
            if (mapping.current.get(from)) {
                const peer: peerservice = mapping.current.get(from);
                peer.peer.close();
                remotestream.current.delete(peer);
                let x: number = Math.floor(Math.random() * 1000);
                if (x === peers) {
                    x = Math.floor(Math.random() * 1000);
                }
                mapping.current.delete(from);
                setpeers(x);
            }


        })

    }, [])
    useEffect(() => {

        //getting answers
        socket.on("sendAnswer", async ({ answer, from }) => {
            console.log("answers coming");
            console.log(mapping.current);
            const peer: peerservice = mapping.current.get(from);
            try {
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("the state of camera is ", camera);
            }
            catch (error) {
                console.log(error);
                console.log("error in setting local description of answer recieved");
            }
            try {
                if (camera === true) {
                    let stream = await navigator.mediaDevices.getUserMedia({
                        audio: false, video: true
                    });
                    let videotrack = stream.getVideoTracks()[0];
                    console.log("track added");
                    peer.peer.addTrack(videotrack, stream);


                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: false, video: true
                    });
                    videotrack = stream.getVideoTracks()[0];
                    console.log("track added");
                    peer.peer.addTrack(videotrack, stream);
                }
                if (voice === true) {
                    let stream = await navigator.mediaDevices.getUserMedia({
                        audio: true, video: false
                    });
                    let audiotrack = stream.getAudioTracks()[0];
                    console.log("track added");
                    peer.peer.addTrack(audiotrack, stream);


                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: false, video: true
                    });
                    audiotrack = stream.getAudioTracks()[0];
                    console.log("track added");
                    peer.peer.addTrack(audiotrack, stream);
                }
            } catch (error) {
                console.log(error);
                console.log("error in sending media when user joined in existing meet");


            }

        })
        return () => {
            socket.off("sendAnswer")
        }
    }, [camera, voice])



    return <>
        <Myvideo selfname={selfname} camera={camera} voice={voice} remotestream={remotestream} />
        <Participants streams={remotestream.current} />
    </>
})
const MeetUI = (props: any) => {
    const { selfname } = props;
    const [camera, setcamera] = useState(false);
    const [askers, setaskers] = useState(new Map());
    const [voice, setvoice] = useState(false);
    const mapping = useRef(new Map());
    const socket = useContext(SocketContext);
    const remotestream = useRef<Map<peerservice, Array<MediaStream | string>>>(new Map());
    useEffect(() => {
        socket.on("askhost", ({ name, to }) => {
            console.log("request reached");
            let temp = new Map(askers);
            temp.set(to, name);
            setaskers(temp);
        })
        return () => {
            socket.off("askhost")
        }
    }, [askers])
    const sendacknowledge = (e: any, key: any) => {
        let answer = e.target.innerText;
        if (answer === "Accept") {
            answer = true;
        }
        else {
            answer = false;
        }
        socket.emit("hostdecision", { answer, to: key })
        let temp = new Map(askers);
        temp.delete(key);
        setaskers(temp);
    }
    return <div id="meet-container">
        {askers.size >= 1 &&
            <div id="permitpanel">
                {Array.from(askers).map(([key, value]) => {
                    return <div key={key} className="permit-user">
                        <p>{value}</p>
                        <button onClick={(e) => sendacknowledge(e, key)}>Accept</button>
                        <button onClick={(e) => sendacknowledge(e, key)}>Reject</button>
                    </div>
                })}
            </div>
        }
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
}

export default MeetUI;