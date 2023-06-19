import { useContext, useState, useEffect, Suspense, lazy} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meetAuth.css"
import { ColorRing } from "react-loader-spinner";
const MeetUI=lazy(()=>import("./MeetUI"))
function Meet() {
    const location = useLocation();
    const navigate =useNavigate();
    const socket = useContext(SocketContext);
    const { code } = useParams();
    const [selfname, setselfname] = useState("")
    const [loading, setloading] = useState(true);
    function getCookieValue(cookieName:string):string|null {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName + '=') === 0) {
                return cookie.substring(cookieName.length + 1);
            }
        }
        return null;
    }
    useEffect(()=>{
        socket.on("join-meet", () => {
            setloading(false);
        })
        return ()=>{
            socket.off("join-meet");
        }
    },[loading])
    useEffect(()=>{
        if (location.state == undefined || location.state == null || location.state.permission!=true)
        {
            navigate(`/`, { state: { code }, replace: true });
        }
        else{
            setselfname(location.state.selfname);
            socket.emit("join-meet", { code, type: getCookieValue(code as string), name: location.state.selfname })
        }
    },[])
    return (loading === true) ?
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