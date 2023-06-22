import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import { BsMic, BsMicMute, BsThreeDotsVertical, BsPeople, BsChatLeftText } from "react-icons/bs";
import { BiVideoOff, BiVideo } from "react-icons/bi";
import { TbScreenShare, TbScreenShareOff } from "react-icons/tb";
import { FaRegHandPaper } from "react-icons/fa";
import { MdCallEnd, MdOutlineAdminPanelSettings } from "react-icons/md";
import "./toolbar.css"
function Toolbars(props: any) {
    const { setcamera, setvoice ,myscreen} = props;
    const [micstate, setmic] = useState("off");
    const [videostate, setvideo] = useState("off")
    const [raisehand, sethand] = useState("off");
    const [screenshare, setscreenshare] = useState("off");
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    function openclosepanel(option: string) {   
        if ((document.getElementById(option) as HTMLElement).style.right == "" || (document.getElementById(option) as HTMLElement).style.right == "-400px"){
            if(option==="panelchat"){
                (document.getElementById("panelpeople") as HTMLElement).style.right = "-400px"; 
            }else{
                (document.getElementById("panelchat") as HTMLElement).style.right = "-400px"; 
            }
        }
        let value:string = (document.getElementById(option) as HTMLElement).style.right;
        if (value ==="0px"){
            (document.getElementById(option) as HTMLElement).style.right = "-400px"; 
        }
        else{
            (document.getElementById(option) as HTMLElement).style.right = "0px";
        }
           
    }
    return <div id="toolbar">
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
            {micstate === "on" ? <BsMic size='20' />:  <BsMicMute size='20' />}
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
            {videostate === "on" ? <BiVideo size='20' /> : <BiVideoOff size='20' />
       }
        </div>
        <div className="toolicons" onClick={async () => 
        {
            if (screenshare === "off") {
                
                try {
                    let stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true
                    })
                    
                    setscreenshare("on");
                    myscreen.current.props.url={stream};
                } catch (error) {
                    console.log("user rejects");
                    
                }
            }
            else {
                setscreenshare("off");
            }
        }}>
            {screenshare === "on" ? <TbScreenShare size='20' /> : <TbScreenShareOff size='20' /> }
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
        
            <FaRegHandPaper size='20' />
 

        </div>
        <div className="toolicons">
            <BsThreeDotsVertical size='20' />
        </div>
        <div onClick={() => {
            socket.disconnect();
            navigate(`/end`, { replace: true });

        }} className="toolicons" style={{ borderRadius: "30px", width: "70px", backgroundColor: "red" }}>
            <MdCallEnd size='20'  />
        </div>
        <div className="othertools" onClick={() => openclosepanel("panelpeople")}>
            <BsPeople size='20'  />

        </div>
        <div className="othertools" onClick={() => openclosepanel("panelchat")} >
            <BsChatLeftText size='20'  />

        </div>
        <div className="othertools">
            <MdOutlineAdminPanelSettings size='20'  />
        </div>
    </div>
}
export default Toolbars;