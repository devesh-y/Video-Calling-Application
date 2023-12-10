import { useContext, useState, useEffect, Suspense, lazy} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient.ts";
import "./meetAuth.css"
import { ColorRing } from "react-loader-spinner";
import {getCookieValue} from "../../utils/getSetCookie.ts";
const MeetUI=lazy(()=>import("./MeetUI.tsx"))
function Meet() {
    const location = useLocation();
    const navigate =useNavigate();
    const socket = useContext(SocketContext);
    const { code } = useParams();
    const [selfname, setselfname] = useState("")
    const [loading, setloading] = useState(true);

    useEffect(()=>{
        socket.on("join-meet", () => {
            setloading(false);
        })
        return ()=>{
            socket.off("join-meet",() => {
                setloading(false);
            });
        }
    },[socket])
    useEffect(()=>{
        if (location.state == undefined || location.state.permission!=true)
        {
            navigate(`/`, { state: { code }, replace: true });
        }
        else{
            setselfname(location.state.selfname);
            socket.emit("join-meet", { code, type: getCookieValue(code as string), name: location.state.selfname })
        }
    },[code, location, navigate, socket])
    return loading ?
                <div className="vfloader">
                        <ColorRing visible={true}  height="80" width="80" ariaLabel="blocks-loading" wrapperStyle={{}}  wrapperClass="blocks-wrapper" colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                        />
                </div>
        : <Suspense fallback={<div className="vfloader">
                                <ColorRing  visible={true}  height="80" width="80" ariaLabel="blocks-loading"  wrapperStyle={{}} wrapperClass="blocks-wrapper" colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                                />
                            </div>}>  
                            <MeetUI selfname={selfname} /></Suspense>  
}

export default Meet;