import {useCallback, useContext, useEffect, useState} from "react"
import "./askjoin.css"
import { SocketContext } from "../Socket/SocketClient.ts"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import {getCookieValue,setcookie} from "../../utils/getSetCookie.ts";

const WrongPage = () => {
    return <>
        <p>This link is either invalid or expired</p>
    </>
}
const Askjoin=()=>{
    const socket = useContext(SocketContext);
    const {code}=useParams();
    const navigate=useNavigate();
    const location=useLocation();
    const [checking,setchecking]=useState(true);
    const [valid,setvalid]=useState(false);
    const [askloader,setaskloader]=useState(false);

    const askhost=useCallback(()=>{
        socket.emit("askhost",{code,name:location.state.selfname});
        setaskloader(true);
    },[code, location, socket])
    const hostDecisionfunc=useCallback((answer:boolean)=> {
        if (answer) {
            setcookie(code as string,"participant");
            navigate(`/${code}`, {state: {permission: true, selfname: location.state.selfname}, replace: true});
        } else {
            setaskloader(false);
            alert("Host denied your request");
        }
    },[code, location, navigate])
    const checkMeetFunc=useCallback((chk:boolean)=>{
        if(chk){
            setvalid(true);
        }
        else{
            setvalid(false);
        }
        setchecking(false);
    },[])
    useEffect(()=>{
        socket.on("hostdecision",hostDecisionfunc)
        return ()=>{
            socket.off("hostdecision",hostDecisionfunc)
        }
    },[hostDecisionfunc, socket])
    useEffect(()=>{
        if(location.state == undefined || location.state.selfname==""){
            console.log("navigating to home page");
            navigate(`/`, { state: { code }, replace: true });
            return;
        }
        else if (getCookieValue(code as string) === "host" || getCookieValue(code as string) === "participant" ){
            navigate(`/${code}`, { state: { permission: true, selfname: location.state.selfname }, replace: true });
        }
        else{
            socket.emit("check-meet",code);
        }
    },[code, location, navigate, socket])
    useEffect(()=>{
        socket.on("check-meet",checkMeetFunc)
        return ()=>{
            socket.off("check-meet",checkMeetFunc);
        }
    }, [checkMeetFunc, socket])
    return checking?
        <div id="askcontainer">
            <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
            colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']} />
        </div> 
    
        : valid ?
                        <div id="askcontainer">
                            <div id="askbox">
                                <div id="askjoinlogo">
                                    CrowdConnect
                                </div>
                                <p>Crowd Code : {code}</p>
                            {(askloader) ? <ColorRing
                                visible={true}
                                height="80"
                                width="80"
                                ariaLabel="blocks-loading"
                                wrapperStyle={{}}
                                wrapperClass="blocks-wrapper"
                                colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']} /> :
                                <button id="joinbtn" onClick={askhost}>Ask to join</button>
                            }

                                <div id="askjoinloading"></div>
                            </div>
                        </div>
        : <WrongPage/> 
                                    
            
}

export default Askjoin;