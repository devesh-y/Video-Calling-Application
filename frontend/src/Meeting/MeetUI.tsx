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
import { BsPinAngleFill } from "react-icons/bs";
import { setremotescreen, setremotestream ,setmapping,setpinname,setpinvideo } from "../ReduxStore/slice1";
import { Socket } from "socket.io-client";
const Myvideo = memo((props: any) => {
    const { selfname,pinscreenid } = props;
    const video:MediaStream|null=useSelector((state:any)=>state.slice1.video);
    const [mycolor,setcolor]=useState("green");
    const screen:MediaStream|null=useSelector((state:any)=>state.slice1.screen);
    const dispatch=useDispatch();
    useEffect(()=>{
        const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
        const randomNumber = (Math.floor(Math.random() * 10)) % 9;
        setcolor(colors[randomNumber]);
    },[])

    return <>
        <div className="usergrid" >
            <div className="userview">
                <div className="pinicon" onClick={()=>{
                        dispatch(setpinvideo(video));
                        dispatch(setpinname("You"))
                        pinscreenid.current=[-1,-1];
                    }}>
                    <BsPinAngleFill size='20'/>
                </div>
                {video === null ? <div className="avatar" style={{ backgroundColor: `${mycolor}` }}>{selfname[0]} </div> : <ReactPlayer playing={true} muted={true} url={video} 
                width="100%" height="100%"/>}
            </div>
            <div className="usertitle" >{selfname}</div>
        </div>
        {
           ( screen != null )? 
            <div className="usergrid"  >
                <div className="userview">
                    <div className="pinicon" onClick={() => {
                
                        dispatch(setpinvideo(screen))
                        dispatch(setpinname('Your Screen'))
                        pinscreenid.current = [-1,-1];
                    }}>
                        <BsPinAngleFill size='20' />
                    </div>
                        <ReactPlayer playing={true} muted={true} url={screen} height="100%" width="100%"/>
                </div>
                <div className="usertitle" >Your Screen</div>
            </div>
            : <></>
        }
        
        
        
    </> 

});
const Participants = memo((props:any) => {
    const {pinscreenid}=props;
    const remotestream=useSelector((state:any)=>state.slice1.remotestream);
    const arr = Array.from(remotestream as Map<peerservice, Array<string | MediaStream | null>>);
    const dispatch=useDispatch();
    return <>
        {arr.map(([peer, data], index) => {
            const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
            const randomNumber = (Math.floor(Math.random() * 10))%9 ;
            return <div key={index} className="usergrid">
                <div className="userview">
                    <div className="pinicon" onClick={()=>{
                        pinscreenid.current = [peer,0];
                        dispatch(setpinvideo(data[0]));
                        dispatch(setpinname(data[2]));
                    }}>
                        <BsPinAngleFill size='20' />
                    </div>
                    {(data[0] == null || data[0] == undefined || data[0] === null) ? <div className="avatar" style={{ backgroundColor: `${colors[randomNumber]}` }}>{(data[2] as string)[0]} </div> : <ReactPlayer playing={true} muted={true} url={data[0]} height="100%" width="100%" />}
                    {data[1] != null && <ReactPlayer  playing={true} muted={false} url={data[1]} width="0px" height="0px" />}
                </div>
                <div className="usertitle" >{data[2] as string}</div>
            </div>

        })}
    </>
})

const Screens= memo((props:any)=>{
    const { pinscreenid } = props;
    const remotescreens=useSelector((state:any)=>state.slice1.remotescreens);
    const arr = Array.from(remotescreens as Map<peerservice, Array<string | MediaStream>>)
    const dispatch=useDispatch();
    return <>
        {arr.map(([peer, data], index) => {
            return <div key={index} className="usergrid">
                <div className="userview">
                    <div className="pinicon" onClick={()=>{
                        pinscreenid.current = [peer,1];
                        dispatch(setpinvideo(data[0]));
                        dispatch(setpinname(data[1]+'\'Screen'))
                    }}>
                        <BsPinAngleFill size='20' />
                    </div>
                    <ReactPlayer playing={true} muted={true} url={data[0]} height="100%" width="100%" />
                </div>
                <div className="usertitle" >{data[1] as string}'s Screen</div>
            </div>
        })}
    </>
})

const Videos = memo((props: any) => {
    const { selfname} = props;
    const { code } = useParams();
    const socket = useContext(SocketContext);
    const tracknumber=useRef(new Map<peerservice,number>());
    const peerstreams = useRef(new Map<peerservice, Array<MediaStream | null | string>>());
    const mapping = useRef(new Map<Socket,peerservice>());
    const video:MediaStream|null=useSelector((state:any)=>state.slice1.video);
    const audio: MediaStream|null = useSelector((state: any) => state.slice1.audio);
    const screen:MediaStream|null= useSelector((state:any)=>state.slice1.screen);
    const peerscreens=useRef(new Map<peerservice,Array<MediaStream|string>>());
    const trackid=useRef(new Set<string>());
    const pinscreenref =useRef<HTMLVideoElement | null>(null);
    const pinvideo:MediaStream|null=useSelector((state:any)=>state.slice1.pinvideo);
    const pinname:string=useSelector((state:any)=>state.slice1.pinname);
    const dispatch=useDispatch();
    const pinscreenid=useRef<Array<peerservice|number>>([-1,-1]);
    const addtrackfunc = useCallback((ev: any, peer: peerservice) => {
        if(!tracknumber.current.get(peer)){
            let newtracknumber = new Map(tracknumber.current);
            newtracknumber.set(peer, 1);
            tracknumber.current = newtracknumber;
            return;
        }
        
        if(ev.track.kind==="audio"){
            let stream = new MediaStream();
            stream.addTrack(ev.track);
            console.log("audio track comes");
            let arr = Array.from(peerstreams.current.get(peer) as Array<MediaStream | null | string>);
            arr[1] = stream;
            let newpeerstream = new Map(peerstreams.current);
            newpeerstream.set(peer, arr);
            peerstreams.current=newpeerstream;
            dispatch(setremotestream(peerstreams.current));
        }
        else if(ev.track.kind==="video")
        {           
            console.log("track reached with id =",ev.track.id);
            console.log(trackid.current);
            
            
            if(!(trackid.current.has(ev.track.id)) ){
                let stream = new MediaStream();
                stream.addTrack(ev.track);
                console.log("video track comes");
                let arr = Array.from(peerstreams.current.get(peer) as Array<MediaStream | null | string>);
                arr[0] = stream;
                let newpeerstream = new Map(peerstreams.current);
                newpeerstream.set(peer, arr);
                peerstreams.current = newpeerstream;
                dispatch(setremotestream(peerstreams.current));
            }
            else{
                let stream = new MediaStream();
                stream.addTrack(ev.track);
                console.log("screen track comes");
                let remotename = (Array.from(peerstreams.current.get(peer) as Array<MediaStream | null | string>)[2] as string);
                let newpeerscreen = new Map(peerscreens.current);
                newpeerscreen.set(peer, [stream, remotename]);
                peerscreens.current=newpeerscreen;
                dispatch(setremotescreen(peerscreens.current));

                let newtrackid=new Set(trackid.current);
                newtrackid.delete(ev.track.id);
                trackid.current=newtrackid;
            }
        }

    }, [])

    const offercamefunc = useCallback(async (data:any)=>{
        const { offer, from, remotename }=data;
        console.log("offer coming from existing users");
        const peer = new peerservice();
        let newpeerstream = new Map(peerstreams.current);
        newpeerstream.set(peer, [null, null, remotename]);
        peerstreams.current = newpeerstream;
        dispatch(setremotestream(peerstreams.current))
        peer.peer.addEventListener("track", (ev) => addtrackfunc(ev, peer));
        peer.peer.addEventListener("negotiationneeded", async () => {
            console.log("nego needed");
            const offer = await peer.getoffer();
            socket.emit("peer:negoNeeded", { offer, to: from });
        })
        let newmapping=new Map(mapping.current);
        newmapping.set(from, peer);
        mapping.current=newmapping;
        dispatch(setmapping(mapping.current));
        //answer this offer 
        try {
            const myanswer = await peer.getanswer(offer);
            socket.emit("sendAnswer", { to: from, myanswer });
            console.log("offer answered");

        }
        catch (err) {
            console.log("error occured in answering the offer");

        }
    },[])

    const sendofferfunc=useCallback(async( data:any)=>{
        const { to, remotename }=data;
        console.log("sending offers to new user");

        const peer = new peerservice();
        let newpeerstream = new Map(peerstreams.current);
        newpeerstream.set(peer, [null, null, remotename]);
        peerstreams.current = newpeerstream;
        dispatch(setremotestream(peerstreams.current))

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
                    let newtracknumber=new Map(tracknumber.current);
                    newtracknumber.set(peer,1);
                    tracknumber.current=newtracknumber;
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

   
        let newmapping = new Map(mapping.current);
        newmapping.set(to, peer);
        mapping.current = newmapping;
        dispatch(setmapping(mapping.current));

        try {
            const offer = await peer.getoffer();
            socket.emit("redirectoffers", { to, offer, selfname });
            console.log("offer sent to new users");
        } catch (error) {
            console.log("error on sending offer");
        }
    },[])
    
    const stopvideofunc = useCallback((from:any) => {
        const peer = mapping.current.get(from);
        if(peer){
            if(peerstreams.current.get(peer)){
                let arr= Array.from(peerstreams.current.get(peer) as Array<MediaStream|string|null>);
                arr[0]=null;
                console.log("video stoped");
                
                let newpeerstream = new Map(peerstreams.current);
                newpeerstream.set(peer, arr);
                peerstreams.current = newpeerstream;
                dispatch(setremotestream(peerstreams.current));

                if(pinscreenid.current[0]===peer && pinscreenid.current[1]===0){
                    dispatch(setpinvideo(null));
                    dispatch(setpinname("You"));
                }
            }
        }
        
    },[])

    const stopaudiofunc = useCallback((from:any) => {
        const peer = mapping.current.get(from);
        if (peer) {
            if (peerstreams.current.get(peer)) {
                let arr = Array.from(peerstreams.current.get(peer) as Array<MediaStream | string | null>);
                arr[1] = null;
                console.log("audio stopped");
                
                let newpeerstream = new Map(peerstreams.current);
                newpeerstream.set(peer,arr);
                peerstreams.current=newpeerstream;
                dispatch(setremotestream(peerstreams.current));
            }
        }
    },[])
    const stopscreenfunc = useCallback((from: any) => {
        const peer = mapping.current.get(from);
        if (peer) {
            let newpeerscreen=new Map(peerscreens.current);
            newpeerscreen.delete(peer);
            peerscreens.current=newpeerscreen;
            console.log("screen stopped");
            
            dispatch(setremotescreen(peerscreens.current));
            if (pinscreenid.current[0] === peer && pinscreenid.current[1] === 1) {
                dispatch(setpinvideo(null));
                dispatch(setpinname("You"));
            }
        }
    }, [])
    const trackinfofunc=useCallback((data:any)=>{
        const { id,from }=data;
        let peer=mapping.current.get(from);
        if(peer){
            if(!peerscreens.current.get(peer)){
                let newtrackid = new Set(trackid.current);
                newtrackid.add(id);
                trackid.current = newtrackid;
                socket.emit("sendtrack", { id, from })
                console.log("track id comes");

                console.log(trackid.current);
            }
        }
        
        
    },[])
    const peernegoneedfunc = useCallback(async (data:any) => {
        const { from, offer }=data;
        console.log("nego offer comes");
        const peer: (peerservice|undefined) = mapping.current.get(from);
        if(peer){
            try {
                const answer = await peer.getanswer(offer);
                socket.emit("peer:negodone", { to: from, answer });
                console.log("nego offer answered");

            } catch (error) {
                console.log("error in sending answer in negotiating");
            }
        }
        
    },[])
    
    const peernegofinalfunc = useCallback(async (data:any) => {
        const { from, answer }=data;
        console.log("nego answer comes");
        const peer: peerservice|undefined = mapping.current.get(from);
        if(peer){
            try {
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
            }
            catch (error) {
                console.log(error);
                console.log("error in setting local description of answer recieved in negotiating");
            }
        }
    },[])

    const disconnectuserfunc = useCallback((from:any) => {
        const peer = mapping.current.get(from);
        if (peer) {
            peer.peer.close();
            let newmapping=new Map(mapping.current);
            newmapping.delete(from);
            mapping.current=newmapping;
            dispatch(setmapping(mapping.current));
            let temppeerstream= new Map(peerstreams.current);
            temppeerstream.delete(peer);
            peerstreams.current=temppeerstream;
            dispatch(setremotestream(peerstreams.current))
            let temppeerscreens= new Map(peerscreens.current);
            temppeerscreens.delete(peer);
            peerscreens.current=temppeerscreens;
            dispatch(setremotescreen(peerscreens.current));
            if (pinscreenid.current[0] === peer) {
                dispatch(setpinvideo(null));
                dispatch(setpinname("You"));
            }
            
        }
    },[])
    const gettinganswerfunc = useCallback(async (data:any) => {
        const { answer, from }=data;
        console.log("answers coming");
        const peer = mapping.current.get(from);
        if(peer){
            try {
                await peer.peer.setRemoteDescription(new RTCSessionDescription(answer));
            }
            catch (error) {
                console.log(error);
                console.log("error in setting local description of answer recieved");
            }
            if (video != null) {
                setTimeout(() => {
                    const track = video.getVideoTracks()[0];
                    peer.peer.addTrack(track, video);
                }, 1000);
            }
            if (audio != null) {
                setTimeout(() => {
                    const track = audio.getAudioTracks()[0];
                    peer.peer.addTrack(track, audio);
                }, 1000);
            }
            if(screen!=null){
                setTimeout(() => {
                    const track = screen.getVideoTracks()[0];
                    socket.emit("trackinfo", { id: track.id, code });
                }, 1000);
            }
        }
    },[video,audio,screen])

    
    useEffect(() => {
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", { code, selfname });
        console.log("triggering to get offers from existing users");

        //new user get offers from existing
        socket.on("offerscame", offercamefunc);
        // existing user send offer to new user
        socket.on("sendoffers", sendofferfunc);
        socket.on("peer:negoNeeded", peernegoneedfunc);
        socket.on("peer:negofinal", peernegofinalfunc);
        socket.on("stopvideo", stopvideofunc)
        socket.on("stopaudio", stopaudiofunc)
        socket.on("stopscreen", stopscreenfunc)
        socket.on("disconnectuser", disconnectuserfunc);
        socket.on("trackinfo",trackinfofunc);

    }, [])

    useEffect(()=>{
        if (pinvideo?.getVideoTracks()[0].readyState==="ended"){
            dispatch(setpinvideo(null));
            dispatch(setpinname("You"));
        }
        //getting answers
        socket.on("sendAnswer", gettinganswerfunc);
        return ()=>{
            socket.off("sendAnswer")
        }
    },[video,audio,screen])

    useEffect(()=>{
        if(pinscreenref.current){
            pinscreenref.current.srcObject = pinvideo as MediaStream;
        }
        
    },[pinvideo])

    return <div id="crowdmeet">
        <PeoplePanel selfname={selfname} />
        <div id="pin-screen">
            <div className="userview">
                {pinvideo === null ? <div className="avatar" style={{ backgroundColor: `green` }}>{pinname[0]} </div> : <video ref={pinscreenref}  autoPlay muted  height={400} />}
            </div>
            <div className="usertitle" >{pinname}</div>
        </div>
        <div id="side-screen">
            <Myvideo selfname={selfname} pinscreenid={pinscreenid}/>
            <Participants pinscreenid={pinscreenid} />
            <Screens pinscreenid={pinscreenid} />
        </div>
        
    </div>
})

const MeetUI = (props: any) => {
    const { selfname } = props;
    const [askers, setaskers] = useState(new Map());
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
        <Videos selfname={selfname}/>
        <Toolbars  />
    </div>
}

export default MeetUI;