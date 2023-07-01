import { RxCross1 } from "react-icons/rx"
import {memo, useContext, useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import { peerservice } from "../WebRTC/p2p";
import "./peoplepanel.css"
import { SocketContext } from "../Socket/SocketClient";
import { sethands } from "../ReduxStore/slice1";
const PeoplePanel = memo((props: any) => {
    const { selfname } = props;
    const remotestream:Map<peerservice,Array<MediaStream|null|string>>=useSelector((state:any)=>state.slice1.remotestream);
    const hands:Map<string,string>=useSelector((state:any)=>state.slice1.hands);
    const dispatch=useDispatch();
    const mapping:Map<string,peerservice>=useSelector((state:any)=>state.slice1.mapping);
    const socket=useContext(SocketContext);
    useEffect(()=>{
        socket.on("handonoff",({type,from})=>{
            if(type==="raise"){
                const peer = mapping.get(from);
                if (peer) {
                    if (remotestream.get(peer)) {
                        let temp = new Map(hands);
                        temp.set(from, (remotestream.get(peer) as Array<MediaStream | null | string>)[2] as string);
                        dispatch(sethands(temp)) ;
                    }
                } 
            }
            else{
                let temp=new Map(hands);
                temp.delete(from);
                dispatch(sethands(temp)) ;
            }
            
        })
        return ()=>{
            socket.off("handonoff");
        } 
    },[mapping,remotestream,hands])
    return <div id="panelpeople">
        <div className="crossbutton" onClick={() => {
            (document.getElementById("panelpeople") as HTMLElement).style.right = "-400px";
        }}> <RxCross1 />
        </div>
        <p style={{ backgroundColor: "#a2f6fc", padding: "10px", borderRadius: "10px" }}>Raised Hands</p>
        <div id="handslist" className="myscrollbar">
            {Array.from(hands as Map<string, string>).map(([_socketid, name], index) => {
                const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
                const randomNumber = (Math.floor(Math.random() * 10)) % 9;
                return <div key={index} className="userdetails">
                    <div className="avatar" style={{ backgroundColor: `${colors[randomNumber]}` }}>{(name as string)[0]}</div>
                    <div className="panelpeoname">{name as string}</div>
                </div>
            })}
        </div>
        <p style={{ backgroundColor: "#a2f6fc", padding: "10px", borderRadius: "10px" }}>Participants</p>
        <div id="peoplelist" className="myscrollbar">
            <div  className="userdetails">
                <div className="avatar" style={{ backgroundColor: "red" }}>{(selfname as string)[0]}</div>
                <div className="panelpeoname">{selfname as string} (You)</div>
            </div>
            {Array.from(remotestream as Map<peerservice, Array<string | MediaStream>>).map(([_peer, data], index) => {
                const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
                const randomNumber = (Math.floor(Math.random() * 10)) % 9 ;
                return <div key={index} className="userdetails">
                    <div className="avatar" style={{ backgroundColor: `${colors[randomNumber]}` }}>{(data[2] as string)[0]}</div>
                    <div className="panelpeoname">{data[2] as string}</div>
                </div>
            })}
        </div>
    </div>
})
export default PeoplePanel;