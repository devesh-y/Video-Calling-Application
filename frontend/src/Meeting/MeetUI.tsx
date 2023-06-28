import { useContext, useState, useEffect, useRef,memo, useCallback} from "react";
import {  useParams  } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import {useSelector, useDispatch} from "react-redux"
import "./meetUI.css"
import { peerservice } from "../WebRTC/p2p";
import ReactPlayer from "react-player";
import Toolbars from "./Toolbar";
import Chatpanel from "./ChatPanel";
import PeoplePanel from "./PeoplePanel";
import { setremotestream,setmapping } from "../ReduxStore/slice1";
const Myvideo = memo((props: any) => {
    const { selfname, myscreen } = props;
    const video=useSelector((state:any)=>state.slice1.video);
    const [mycolor,setcolor]=useState("green");
    useEffect(()=>{
        const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
        const randomNumber = (Math.floor(Math.random() * 10)) % 9 + 1;
        setcolor(colors[randomNumber]);
    },[])

    return <>
        <div className="usergrid" >
            <div className="userview">
                {video === null ? <div className="avatar" style={{ backgroundColor: `${mycolor}` }}>{selfname[0]} </div> : <ReactPlayer playing={true} muted={true} url={video} height="120px" />}
            </div>
            <div className="usertitle" >{selfname}</div>
        </div>
        
        <div className="usergrid" ref={myscreen} style={{display:"none"}} >
            <div className="userview">
                <video autoPlay height="120px" >
                </video>
            </div>
            <div className="usertitle" >{selfname}</div>
        </div>
        
        
    </> 

});
const Participants = memo(() => {

    const remotestream=useSelector((state:any)=>state.slice1.remotestream);
    return <>
        {Array.from(remotestream as Map<peerservice, Array<string | MediaStream | null>>).map(([_peer, data], index) => {
            const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
            const randomNumber = (Math.floor(Math.random() * 10))%9 + 1;
            return <div key={index} className="usergrid">
                <div className="userview">
                    {(data[0] == null || data[0]==undefined ||data[0]===null) ? <div className="avatar" style={{backgroundColor:`${colors[randomNumber]}`}}>{(data[2] as string)[0]} </div> : <ReactPlayer  playing={true} muted={true} url={data[0]} height="120px" />}
                    {data[1] != null && <ReactPlayer  playing={true} muted={false} url={data[1]} width="0px" height="0px" />}
                </div>
                <div className="usertitle" >{data[2] as string}</div>
            </div>

        })}
    </>
})
const Screens=()=>{
    return <>
        
    </>
}
const Videos = memo((props: any) => {
    const { selfname, myscreen} = props;
    const { code } = useParams();
    const socket = useContext(SocketContext);
    const tracknumber=useRef(new Map<peerservice,number>());
    const totalpeers = useRef(new Map<peerservice, Array<MediaStream | null | string>>());
    const remotestream: Map<peerservice, Array<MediaStream | null | string>> = useSelector((state:any) => state.slice1.remotestream);
    const mapping = useSelector((state: any) => state.slice1.mapping);
    const video:MediaStream=useSelector((state:any)=>state.slice1.video);
    const audio: MediaStream = useSelector((state: any) => state.slice1.audio);
    const dispatch=useDispatch();
    
    const addtrackfunc = useCallback((ev: any, peer: peerservice) => {
        if(!tracknumber.current.get(peer)){
            tracknumber.current.set(peer,1);
            return;
        }

        if (ev.track.kind === "video") {
            console.log("video track comes");
            let videostream = new MediaStream();
            videostream.addTrack(ev.track);
            let temprstream: Map<peerservice, Array<string | MediaStream | null>> = new Map(totalpeers.current);
            if (temprstream.get(peer) != undefined && temprstream.get(peer) != null) {
                let arr = Array.from(temprstream.get(peer) as Array<MediaStream | null | string>);
                arr[0] = videostream;
                temprstream.set(peer, arr);
                totalpeers.current=temprstream;
                dispatch(setremotestream(temprstream));
            }
        }
        else if (ev.track.kind === "audio") {
            console.log("audio track comes");
            let audiostream = new MediaStream();
            audiostream.addTrack(ev.track);
          
            let temprstream: Map<peerservice, Array<string | MediaStream | null>> = new Map(totalpeers.current);
            if (temprstream.get(peer) != undefined && temprstream.get(peer) != null) { 
                let arr=Array.from(temprstream.get(peer) as Array<MediaStream|null|string>);
                arr[1]=audiostream;
                temprstream.set(peer,arr);
                totalpeers.current = temprstream;
                dispatch(setremotestream(temprstream));
            }
        }

    }, [])

    const offercamefunc = useCallback(async (data:any)=>{
        const { offer, from, remotename }=data;
        console.log("offer coming from existing users");
        const peer = new peerservice();
        let temprstream = new Map(remotestream);
        temprstream.set(peer, [null, null, remotename]);
        totalpeers.current=temprstream;
        dispatch(setremotestream(temprstream))
        peer.peer.addEventListener("track", (ev) => addtrackfunc(ev, peer));
        peer.peer.addEventListener("negotiationneeded", async () => {
            console.log("nego needed");
            const offer = await peer.getoffer();
            socket.emit("peer:negoNeeded", { offer, to: from });
        })

        let tempmapping = new Map(mapping);
        tempmapping.set(from, peer);
        dispatch(setmapping(tempmapping));
        
        //answer this offer 
        try {
            const myanswer = await peer.getanswer(offer);
            socket.emit("sendAnswer", { to: from, myanswer });
            console.log("offer answered");

        }
        catch (err) {
            console.log("error occured in answering the offer");

        }
    },[remotestream,mapping])

    const sendofferfunc=useCallback(async( data:any)=>{
        const { to, remotename }=data;
        console.log("sending offers to new user");

        const peer = new peerservice();
        let temprstream = new Map(remotestream);
        temprstream.set(peer, [null, null, remotename]);
        totalpeers.current=temprstream;
        dispatch(setremotestream(temprstream));
        peer.peer.addEventListener("track", (ev) => addtrackfunc(ev, peer));
        function convertToMediaStreamTrack(arrayBuffer: ArrayBuffer) {
            const audioContext = new AudioContext();

            audioContext.decodeAudioData(arrayBuffer)
                .then(audioBuffer => {
                    const audioSource = audioContext.createBufferSource();
                    audioSource.buffer = audioBuffer;

                    const mediaStreamSource = audioContext.createMediaStreamDestination();
                    audioSource.connect(mediaStreamSource);

                    const mystream = mediaStreamSource.stream;
                    const mytrack = mystream.getAudioTracks()[0];

                    peer.peer.addTrack(mytrack, mystream)
                    tracknumber.current.set(peer,1);
                })
                .catch(error => console.error('Error decoding audio data:', error));
        }
        fetch('MessageTone.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => convertToMediaStreamTrack(arrayBuffer))
            .catch(error => console.error('Error retrieving the file:', error));

        

        peer.peer.addEventListener("negotiationneeded", async () => {
            console.log("nego needed");
            const offer = await peer.getoffer();
            socket.emit("peer:negoNeeded", { offer, to });
        })

        let tempmapping = new Map(mapping);
        tempmapping.set(to, peer);
        dispatch(setmapping(tempmapping));
        

        try {
            const offer = await peer.getoffer();
            socket.emit("redirectoffers", { to, offer, selfname });
            console.log("offer sent to new users");
        } catch (error) {
            console.log("error on sending offer");
        }
    },[remotestream,mapping])
    
    const stopvideofunc = useCallback((from:any) => {
        const peer: peerservice = mapping.get(from);
        let temprstream: Map<peerservice, Array<string | MediaStream | null>> = new Map(remotestream);
        if (temprstream.get(peer)) { 
            let arr = Array.from(temprstream.get(peer) as Array<MediaStream | null | string>);
            arr[0] = null;
            temprstream.set(peer, arr);
            totalpeers.current = temprstream;
            dispatch(setremotestream(temprstream));
        }
    },[mapping,remotestream])

    const stopaudiofunc = useCallback((from:any) => {
        const peer: peerservice = mapping.get(from);
        let temprstream: Map<peerservice, Array<string | MediaStream | null>> = new Map(remotestream);
        if (temprstream.get(peer)) {
            let arr = Array.from(temprstream.get(peer) as Array<MediaStream | null | string>);
            arr[1] = null;
            temprstream.set(peer,arr);
            totalpeers.current = temprstream;
            dispatch(setremotestream(temprstream));
        }
    },[mapping,remotestream])

    const peernegoneedfunc = useCallback(async (data:any) => {
        const { from, offer }=data;
        console.log("nego offer comes");
        const peer: peerservice = mapping.get(from);
        try {
            const answer = await peer.getanswer(offer);
            socket.emit("peer:negodone", { to: from, answer });
            console.log("nego offer answered");

        } catch (error) {
            console.log("error in sending answer in negotiating");
        }
    },[mapping])
    
    const peernegofinalfunc = useCallback(async (data:any) => {
        const { from, answer }=data;
        console.log("nego answer comes");
        const peer: peerservice = mapping.get(from);
        try {
            await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
        catch (error) {
            console.log(error);
            console.log("error in setting local description of answer recieved in negotiating");
        }
    },[mapping])

    const disconnectuserfunc = useCallback((from:any) => {
        if (mapping.get(from)) {
            const peer: peerservice = mapping.get(from);
            peer.peer.close();
            let updremote = new Map(remotestream);
            updremote.delete(peer);
            totalpeers.current=updremote;
            dispatch(setremotestream(updremote));
            let updmapping = new Map(mapping);
            updmapping.delete(from);
            dispatch(setmapping(updmapping));
            
        }
    },[mapping,remotestream])
    const gettinganswerfunc = useCallback(async (data:any) => {
        const { answer, from }=data;
        console.log("answers coming");
        const peer: peerservice = mapping.get(from);
        try {
            await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
        catch (error) {
            console.log(error);
            console.log("error in setting local description of answer recieved");
        }
        if(video!=null){
            setTimeout(() => {
                const track=video.getVideoTracks()[0];
                peer.peer.addTrack(track,video);
            }, 1000);
        }
        if(audio!=null){
            setTimeout(() => {
                const track=audio.getAudioTracks()[0];
                peer.peer.addTrack(track,audio);
            }, 1000);
        }

    },[mapping,video,audio])

    useEffect(() => {
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", { code, selfname });
        console.log("triggering to get offers from existing users");
        
    }, [])
    
    useEffect(() => {
        //new user get offers from existing
        socket.on("offerscame", offercamefunc);
        // existing user send offer to new user
        socket.on("sendoffers", sendofferfunc);
        socket.on("stopvideo", stopvideofunc)
        socket.on("stopaudio", stopaudiofunc)
        socket.on("disconnectuser", disconnectuserfunc);

        return () => {
            socket.off("offerscame");
            socket.off("sendoffers");
            socket.off("stopvideo")
            socket.off("stopaudio")
            socket.off("disconnectuser");
        }
    }, [mapping,remotestream])

    useEffect(()=>{
        socket.on("peer:negoNeeded", peernegoneedfunc);
        socket.on("peer:negofinal", peernegofinalfunc);
        return ()=>{
            socket.off("peer:negoNeeded");
            socket.off("peer:negofinal");
        }
    },[mapping])

    useEffect(()=>{
        //getting answers
        socket.on("sendAnswer", gettinganswerfunc);
        return ()=>{
            socket.off("sendAnswer")
        }
    },[mapping,video,audio])



    return <div id="crowdmeet">
        <PeoplePanel selfname={selfname} />
        <Myvideo selfname={selfname} myscreen={myscreen}  />
        <Participants />
        <Screens/>
    </div>
})

const MeetUI = (props: any) => {
    const { selfname } = props;
    const [askers, setaskers] = useState(new Map());
    const myscreen=useRef(null);
    const socket = useContext(SocketContext);
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
        <Chatpanel selfname={selfname}/>
        <Videos selfname={selfname} myscreen={myscreen} />
        <Toolbars myscreen={myscreen} />
    </div>
}

export default MeetUI;