import { useContext } from "react";
import { SocketContext } from "../Socket/SocketClient";
import "./meet.css"
function Toolbars(){
    return <>
        <div id="toolbar">
            <span className="material-symbols-outlined toolicons">
                mic
            </span>
            <span className="material-symbols-outlined toolicons">
                videocam
            </span>
            <span className="material-symbols-outlined toolicons">
                present_to_all
            </span>
            <span className="material-symbols-outlined toolicons">
                back_hand
            </span>
            <span className="material-symbols-outlined toolicons">
                more_vert
            </span>
            <span className="material-symbols-outlined toolicons" style={{ borderRadius: "30px", width: "70px" }}>
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
        </div>
    </>
}

function Meet() {
    const socketio = useContext(SocketContext);
    return <>
        <div id="meet-container">
            <div id="videos">

            </div>
            {<Toolbars/>}
        </div>

    </>
}

export default Meet;