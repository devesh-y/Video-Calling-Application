import React, { useContext, useState, useEffect, useRef,memo, useCallback} from "react";
import {  useParams  } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient.ts";
import {useSelector, useDispatch} from "react-redux"
import "./meetUI.css"
import { peerservice } from "../WebRTC/p2p.ts";
import ReactPlayer from "react-player";
import Toolbars from "./Toolbar.tsx";
import Chatpanel from "./ChatPanel.tsx";
import PeoplePanel from "./PeoplePanel.tsx";
import { BsPinAngleFill } from "react-icons/bs";
import { setremotescreen, setremotestream ,setmapping,setpinname,setpinvideo,sethands } from "../../ReduxStore/slice1.ts";
import {StoreType} from "../../ReduxStore/store.ts";

const Myvideo = memo(({ selfname,pinscreenid }:{selfname:string,pinscreenid: React.MutableRefObject<(number | peerservice)[]>} ) => {
    const video:MediaStream|null=useSelector((state:StoreType)=>state.slice1.video);
    const [mycolor,setcolor]=useState("green");
    const screen:MediaStream|null=useSelector((state:StoreType)=>state.slice1.screen);
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
                        pinscreenid.current=[-1,0];
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
const Participants = memo(({pinscreenid}:{pinscreenid: React.MutableRefObject<(number | peerservice)[]>}) => {
    
    const remotestream=useSelector((state:StoreType)=>state.slice1.remotestream);
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
                    {(data[0] == null || data[0] == undefined || data[0] === null) ? <div className="avatar" style={{ backgroundColor: `${colors[randomNumber]}` }}>{(data[2] as string)[0]} </div> : <ReactPlayer playing={true} muted={true} url={data[0] as MediaStream} height="100%" width="100%" />}
                    {data[1] != null && <ReactPlayer  playing={true} muted={false} url={data[1] as  MediaStream} width="0px" height="0px" />}
                </div>
                <div className="usertitle" >{data[2] as string}</div>
            </div>

        })}
    </>
})

const Screens= memo(({pinscreenid}:{pinscreenid:React.MutableRefObject<(number | peerservice)[]>})=>{

    const remotescreens=useSelector((state:StoreType)=>state.slice1.remotescreens);
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

const Videos = memo(({selfname}:{selfname:string}) => {

    const { code } = useParams();
    const socket = useContext(SocketContext);
    const tracknumber=useRef(new Map<peerservice,number>());
    const peerstreams = useRef(new Map<peerservice, Array<MediaStream | null | string>>());
    const mapping = useRef(new Map<string,peerservice>());
    const video=useSelector((state:StoreType)=>state.slice1.video);
    const audio = useSelector((state: StoreType) => state.slice1.audio);
    const screen= useSelector((state:StoreType)=>state.slice1.screen);
    const hands=useSelector((state:StoreType)=>state.slice1.hands);
    const peerscreens=useRef(new Map<peerservice,Array<MediaStream|string>>());
    const trackid=useRef(new Set<string>());
    const pinscreenref =useRef<HTMLVideoElement>(null);
    const pinvideo=useSelector((state:StoreType)=>state.slice1.pinvideo);
    const pinname=useSelector((state:StoreType)=>state.slice1.pinname);
    const dispatch=useDispatch();
    const pinscreenid=useRef<Array<peerservice|number>>([-1,-1]);
    const addtrackfunc = useCallback((ev: RTCTrackEvent, peer: peerservice) => {
        if(!tracknumber.current.get(peer)){
            const newtracknumber = new Map(tracknumber.current);
            newtracknumber.set(peer, 1);
            tracknumber.current = newtracknumber;
            return;
        }
        
        if(ev.track.kind==="audio"){
            const stream = new MediaStream();
            stream.addTrack(ev.track);
            console.log("audio track comes");
            const arr = Array.from(peerstreams.current.get(peer) as Array<MediaStream | null | string>);
            arr[1] = stream;
            const newpeerstream = new Map(peerstreams.current);
            newpeerstream.set(peer, arr);
            peerstreams.current=newpeerstream;
            dispatch(setremotestream(peerstreams.current));
        }
        else if(ev.track.kind==="video")
        {           
            console.log("track reached with id =",ev.track.id);
            console.log(trackid.current);
            
            
            if(!(trackid.current.has(ev.track.id)) ){
                const stream = new MediaStream();
                stream.addTrack(ev.track);
                console.log("video track comes");
                const arr = Array.from(peerstreams.current.get(peer) as Array<MediaStream | null | string>);
                arr[0] = stream;
                const newpeerstream = new Map(peerstreams.current);
                newpeerstream.set(peer, arr);
                peerstreams.current = newpeerstream;
                dispatch(setremotestream(peerstreams.current));
            }
            else{
                const stream = new MediaStream();
                stream.addTrack(ev.track);
                console.log("screen track comes");
                const remotename = (Array.from(peerstreams.current.get(peer) as Array<MediaStream | null | string>)[2] as string);
                const newpeerscreen = new Map(peerscreens.current);
                newpeerscreen.set(peer, [stream, remotename]);
                peerscreens.current=newpeerscreen;
                dispatch(setremotescreen(peerscreens.current));

                const newtrackid=new Set(trackid.current);
                newtrackid.delete(ev.track.id);
                trackid.current=newtrackid;
            }
        }

    }, [dispatch])

    const offercamefunc = useCallback( ({ offer, from, remotename }:{offer:RTCSessionDescriptionInit,from:string,remotename:string})=>{
        
        console.log("offer coming from existing users");
        const peer = new peerservice();
        const newpeerstream = new Map(peerstreams.current);
        newpeerstream.set(peer, [null, null, remotename]);
        peerstreams.current = newpeerstream;
        dispatch(setremotestream(peerstreams.current))
        peer.peer.addEventListener("track", (ev) => addtrackfunc(ev, peer));
        peer.peer.addEventListener("negotiationneeded", async () => {
            console.log("nego needed");
            const offer = await peer.getoffer();
            socket.emit("peer:negoNeeded", { offer, to: from });
        })
        const newmapping=new Map(mapping.current);
        newmapping.set(from, peer);
        mapping.current=newmapping;
        dispatch(setmapping(mapping.current));
        //answer this offer 

        peer.getanswer(offer).then((myanswer)=>{
            socket.emit("sendAnswer", { to: from, myanswer });
            console.log("offer answered");
        }).catch(() =>{
            console.log("error occured in answering the offer");
        })
    },[addtrackfunc, dispatch, socket])

    const sendofferfunc=useCallback(async( {to,remotename}:{to:string,remotename:string})=>{
        console.log("sending offers to new user");

        const peer = new peerservice();
        const newpeerstream = new Map(peerstreams.current);
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
                    const newtracknumber=new Map(tracknumber.current);
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


        const newmapping = new Map(mapping.current);
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
    },[addtrackfunc, dispatch, selfname, socket])
    
    const stopvideofunc = useCallback((from:string) => {
        const peer = mapping.current.get(from);
        if(peer){
            if(peerstreams.current.get(peer)){
                const arr= Array.from(peerstreams.current.get(peer) as Array<MediaStream|string|null>);
                arr[0]=null;
                console.log("video stoped");

                const newpeerstream = new Map(peerstreams.current);
                newpeerstream.set(peer, arr);
                peerstreams.current = newpeerstream;
                dispatch(setremotestream(peerstreams.current));

                if(pinscreenid.current[0]===peer && pinscreenid.current[1]===0){
                    dispatch(setpinvideo(null));
                    dispatch(setpinname("You"));
                }
            }
        }
        
    },[dispatch])

    const stopaudiofunc = useCallback((from:string) => {
        const peer = mapping.current.get(from);
        if (peer) {
            if (peerstreams.current.get(peer)) {
                const arr = Array.from(peerstreams.current.get(peer) as Array<MediaStream | string | null>);
                arr[1] = null;
                console.log("audio stopped");

                const newpeerstream = new Map(peerstreams.current);
                newpeerstream.set(peer,arr);
                peerstreams.current=newpeerstream;
                dispatch(setremotestream(peerstreams.current));
            }
        }
    },[dispatch])
    const stopscreenfunc = useCallback((from: string) => {
        const peer = mapping.current.get(from);
        if (peer) {
            const newpeerscreen=new Map(peerscreens.current);
            newpeerscreen.delete(peer);
            peerscreens.current=newpeerscreen;
            console.log("screen stopped");
            
            dispatch(setremotescreen(peerscreens.current));
            if (pinscreenid.current[0] === peer && pinscreenid.current[1] === 1) {
                dispatch(setpinvideo(null));
                dispatch(setpinname("You"));
            }
        }
    }, [dispatch])
    const trackinfofunc=useCallback(({ id,from }:{id:string,from:string})=>{

        const peer=mapping.current.get(from);
        if(peer){
            if(!peerscreens.current.get(peer)){
                const newtrackid = new Set(trackid.current);
                newtrackid.add(id);
                trackid.current = newtrackid;
                socket.emit("sendtrack", { id, from })
                console.log("track id comes");

                console.log(trackid.current);
            }
        }
        
        
    },[socket])
    const peernegoneedfunc = useCallback(async ({ from, offer }:{from:string,offer:RTCSessionDescriptionInit}) => {

        console.log("nego offer comes");
        const peer = mapping.current.get(from);
        if(peer){
            try {
                const answer = await peer.getanswer(offer);
                socket.emit("peer:negodone", { to: from, answer });
                console.log("nego offer answered");

            } catch (error) {
                console.log("error in sending answer in negotiating");
            }
        }
        
    },[socket])
    
    const peernegofinalfunc = useCallback(async ({ from, answer }:{from:string,answer:RTCSessionDescriptionInit}) => {
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

    const disconnectuserfunc = useCallback((from:string) => {
        const peer = mapping.current.get(from);
        if (peer) {
            peer.peer.close();
            const newmapping=new Map(mapping.current);
            newmapping.delete(from);
            mapping.current=newmapping;
            dispatch(setmapping(mapping.current));
            const temppeerstream= new Map(peerstreams.current);
            temppeerstream.delete(peer);
            peerstreams.current=temppeerstream;
            dispatch(setremotestream(peerstreams.current))
            const temppeerscreens= new Map(peerscreens.current);
            temppeerscreens.delete(peer);
            peerscreens.current=temppeerscreens;
            dispatch(setremotescreen(peerscreens.current));
            if (pinscreenid.current[0] === peer) {
                dispatch(setpinvideo(null));
                dispatch(setpinname("You"));
            }
            const thands=new Map(hands);
            thands.delete(from);
            dispatch(sethands(thands));
            
        }
    },[dispatch, hands])
    const gettinganswerfunc = useCallback(async ({ from, answer }:{from:string,answer:RTCSessionDescriptionInit}) => {

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
    },[video, audio, screen, socket, code])

    useEffect(() => {
        //first triggering to get offers from existing  --for new user
        socket.emit("sendoffers", { code, selfname });
        console.log("triggering to get offers from existing users");
    }, [code, selfname, socket]);
    
    useEffect(() => {
        //new user get offers from existing
        socket.on("offerscame", offercamefunc);
        // existing user send offer to new user
        socket.on("sendoffers", sendofferfunc);
        socket.on("peer:negoNeeded", peernegoneedfunc);
        socket.on("peer:negofinal", peernegofinalfunc);
        socket.on("stopvideo", stopvideofunc)
        socket.on("stopaudio", stopaudiofunc)
        socket.on("stopscreen", stopscreenfunc)
        socket.on("trackinfo",trackinfofunc);
        socket.on("sendAnswer", gettinganswerfunc);
        return ()=>{
            socket.off("offerscame", offercamefunc);
            socket.off("sendoffers", sendofferfunc);
            socket.off("peer:negoNeeded", peernegoneedfunc);
            socket.off("peer:negofinal", peernegofinalfunc);
            socket.off("stopvideo", stopvideofunc)
            socket.off("stopaudio", stopaudiofunc)
            socket.off("stopscreen", stopscreenfunc)
            socket.off("trackinfo",trackinfofunc);
            socket.off("sendAnswer",gettinganswerfunc)
        }

    }, [ gettinganswerfunc,offercamefunc, peernegofinalfunc, peernegoneedfunc, sendofferfunc, socket, stopaudiofunc, stopscreenfunc, stopvideofunc, trackinfofunc])

    useEffect(()=>{
        socket.on("disconnectuser", disconnectuserfunc);
        return ()=>{
            socket.off("disconnectuser");
        }
    },[disconnectuserfunc, socket])


    useEffect(()=>{
        if(pinscreenref.current){
            pinscreenref.current.srcObject = pinvideo;
        }
        
    },[pinvideo])

    return <div id="crowdmeet">
        <PeoplePanel selfname={selfname} />
        <div id="pin-screen">
            <div className="userview">
                {pinvideo === null ? <div className="avatar" style={{ backgroundColor: `green` }}>{pinname[0]} </div> : <video ref={pinscreenref} style={{maxWidth:"100%", maxHeight:"100%",overflow:"hidden"}}  autoPlay muted  height="100%" width="100%" />}
            </div>
            <div className="usertitle" >{pinname}</div>
        </div>
        <div id="side-screen" className="myscrollbar">
            <Myvideo selfname={selfname} pinscreenid={pinscreenid}/>
            <Participants pinscreenid={pinscreenid} />
            <Screens pinscreenid={pinscreenid} />
        </div>
        
    </div>
})

const MeetUI = ({selfname}:{selfname:string}) => {
    const [askers, setaskers] = useState(new Map<string,string>());
    const socket = useContext(SocketContext);
    const sendacknowledge = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) => {
        const answer = e.currentTarget.innerText;
        socket.emit("hostdecision", { answer:(answer === "Accept"), to: key })
        const temp = new Map(askers);
        temp.delete(key);
        setaskers(temp);
    },[askers, socket])
    const askHostFunc=useCallback(({ name, to }:{name:string,to:string}) => {
        console.log("request reached");
        const temp = new Map(askers);
        temp.set(to, name);
        setaskers(temp);
    },[askers])
    useEffect(() => {
        socket.on("askhost",askHostFunc )
        return () => {
            socket.off("askhost",askHostFunc)
        }
    }, [askHostFunc, socket])
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