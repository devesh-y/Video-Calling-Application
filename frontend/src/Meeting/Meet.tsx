import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Socket/SocketClient";
import "./meet.css"
function Toolbars() {
    const [micstate, setmic] = useState("mic");
    const [videostate, setvideo] = useState("videocam")
    return <>
        <span onClick={(e: any): void => {
            if (micstate === "mic") {
                setmic("mic_off");
                e.target.style.backgroundColor = "red";
            }
            else {
                setmic("mic")
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="material-symbols-outlined toolicons">
            {micstate}
        </span>
        <span onClick={(e: any) => {
            if (videostate === "videocam") {
                setvideo("videocam_off");
                e.target.style.backgroundColor = "red";
            }
            else {
                setvideo("videocam")
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }} className="material-symbols-outlined toolicons">
            {videostate}
        </span>
        <span className="material-symbols-outlined toolicons">
            present_to_all
        </span>
        <span className="material-symbols-outlined toolicons" onClick={(e: any) => {
            if (e.target.style.backgroundColor === "rgb(92, 87, 87)") {
                e.target.style.backgroundColor = "#407fbf"
            }
            else {
                e.target.style.backgroundColor = "rgb(92, 87, 87)";
            }
        }}>
            back_hand
        </span>
        <span className="material-symbols-outlined toolicons">
            more_vert
        </span>
        <span className="material-symbols-outlined toolicons" style={{ borderRadius: "30px", width: "70px", backgroundColor: "red" }}>
            call_end
        </span>
        <span className="material-symbols-outlined">
            group
        </span>
        <span className="material-symbols-outlined">
            chat
        </span>
        <span className="material-symbols-outlined">
            admin_panel_settings
        </span>
    </>
}

function Meet() {
    const socketio = useContext(SocketContext);
    const {code}=useParams();
    return <>
        <div id="meet-container">
            <div id="crowdmeet">
                <div id="videos">

                </div>
                <div id="sidepanel">

                </div>
            </div>
            
            <div id="toolbar">
                {<Toolbars />}
            </div>

        </div>

    </>
}

export default Meet;