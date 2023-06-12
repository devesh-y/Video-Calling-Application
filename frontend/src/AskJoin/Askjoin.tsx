import { useContext, useEffect, useState} from "react"
import "./askjoin.css"
import { SocketContext } from "../Socket/SocketClient"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
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
    useEffect(()=>{
        if(location.state && location.state.selfname!=""){
            navigate(`/`,{state:{code}});
            return;
        }
        socket.emit("check-meet",code);
    },[])
    useEffect(()=>{
        socket.on("check-meet",(chk)=>{
            if(chk===false){
                setvalid(false);
            }
            else{
                setvalid(true);
            }
            setchecking(false);
        })
    }, [checking])
    return (checking === true)?     <ColorRing
                                    visible={true}
                                    height="80"
                                    width="80"
                                    ariaLabel="blocks-loading"
                                    wrapperStyle={{}}
                                    wrapperClass="blocks-wrapper"
                                    colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}/>
                                    : (valid=== true) ?
                                                    <div id="askcontainer">
                                                        <div id="askbox">
                                                            <div id="askjoinlogo">
                                                                CrowdConnect
                                                            </div>
                                                            <p>Crowd Code : {code}</p>
                                                            <button id="joinbtn">Ask to join</button>
                                                            <div id="askjoinloading"></div>
                                                        </div>
                                                    </div>
                                    : <WrongPage/> 
                                    
            
}

export default Askjoin;