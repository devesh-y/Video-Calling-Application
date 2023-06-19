import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import { IconContext } from "react-icons";
import { BsMic, BsMicMute, BsThreeDotsVertical, BsPeople, BsChatLeftText } from "react-icons/bs";
import { BiVideoOff, BiVideo } from "react-icons/bi";
import { TbScreenShare, TbScreenShareOff } from "react-icons/tb";
import { FaRegHandPaper } from "react-icons/fa";
import { MdCallEnd, MdOutlineAdminPanelSettings } from "react-icons/md";
import "./toolbar.css"
function Toolbars(props: any) {
    const { setcamera, setvoice } = props;
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
            {micstate === "on" ? <IconContext.Provider value={{ className: "react-icons" }}>
                <BsMic />
            </IconContext.Provider> : <IconContext.Provider value={{ className: "react-icons" }}>
                <BsMicMute />
            </IconContext.Provider>}
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
            {videostate === "on" ? <IconContext.Provider value={{ className: "react-icons" }}>
                <BiVideo />
            </IconContext.Provider> : <IconContext.Provider value={{ className: "react-icons" }}>
                <BiVideoOff />
            </IconContext.Provider>}
        </div>
        <div className="toolicons" onClick={(e: any) => {
            if (screenshare === "off") {
                setscreenshare("on");
                e.currentTarget.style.backgroundColor = "#407fbf"
            }
            else {
                setscreenshare("off");
                e.currentTarget.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }}>
            {screenshare === "on" ? <IconContext.Provider value={{ className: "react-icons" }}>
                <TbScreenShare />
            </IconContext.Provider> : <IconContext.Provider value={{ className: "react-icons" }}>
                <TbScreenShareOff />
            </IconContext.Provider>}
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
            <IconContext.Provider value={{ className: "react-icons" }}>
                <FaRegHandPaper />
            </IconContext.Provider>

        </div>
        <div className="toolicons">
            <IconContext.Provider value={{ className: "react-icons" }}>
                <BsThreeDotsVertical />
            </IconContext.Provider>

        </div>
        <div onClick={() => {
            socket.disconnect();
            navigate(`/end`, { replace: true });

        }} className="toolicons" style={{ borderRadius: "30px", width: "70px", backgroundColor: "red" }}>
            <IconContext.Provider value={{ className: "react-icons" }}>
                <MdCallEnd />
            </IconContext.Provider>

        </div>
        <div className="othertools" onClick={() => openclosepanel("panelpeople")}>
            <IconContext.Provider value={{ className: "react-icons" }}>
                <BsPeople />
            </IconContext.Provider>

        </div>
        <div className="othertools" onClick={() => openclosepanel("panelchat")} >
            <IconContext.Provider value={{ className: "react-icons" }}>
                <BsChatLeftText />
            </IconContext.Provider>

        </div>
        <div className="othertools">
            <IconContext.Provider value={{ className: "react-icons" }}>
                <MdOutlineAdminPanelSettings />
            </IconContext.Provider>
        </div>
    </div>
}
export default Toolbars;