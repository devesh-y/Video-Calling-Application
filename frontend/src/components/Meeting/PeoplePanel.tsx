import { RxCross1 } from "react-icons/rx"
import {memo, useCallback, useContext, useEffect, useRef} from "react"
import {useDispatch, useSelector} from "react-redux"
import "./peoplepanel.css"
import { SocketContext } from "../Socket/SocketClient.ts";
import { sethands } from "../../ReduxStore/slice1.ts";
import {StoreType} from "../../ReduxStore/store.ts";
const PeoplePanel = memo(({selfname}:{selfname:string}) => {
    
    const remotestream=useSelector((state:StoreType)=>state.slice1.remotestream);
    const hands=useSelector((state:StoreType)=>state.slice1.hands);
    const dispatch=useDispatch();
    const mapping=useSelector((state:StoreType)=>state.slice1.mapping);
    const socket=useContext(SocketContext);
    const panelPeopleRef=useRef<HTMLDivElement>(null);
    const handOnOffFunc=useCallback(({type,from}:{type:string,from:string})=>{
        if(type==="raise"){
            const peer = mapping.get(from);
            if (peer) {
                if (remotestream.get(peer)) {
                    const temp = new Map(hands);
                    temp.set(from, remotestream.get(peer)?.[2] as string);
                    dispatch(sethands(temp)) ;
                }
            }
        }
        else{
            const temp=new Map(hands);
            temp.delete(from);
            dispatch(sethands(temp)) ;
        }

    },[dispatch, hands, mapping, remotestream])
    useEffect(()=>{
        socket.on("handonoff",handOnOffFunc)
        return ()=>{
            socket.off("handonoff",handOnOffFunc);
        } 
    },[ socket, handOnOffFunc])
    return <div id="panelpeople" ref={panelPeopleRef}>
        <div className="crossbutton" onClick={() => {
            if(panelPeopleRef.current) {
                panelPeopleRef.current.style.right = "-400px";
            }
        }}> <RxCross1 />
        </div>
        <p style={{ backgroundColor: "#a2f6fc", padding: "10px", borderRadius: "10px" }}>Raised Hands</p>
        <div id="handslist" className="myscrollbar">
            {Array.from(hands).map(([, name], index) => {
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
            {Array.from(remotestream).map(([, data], index) => {
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