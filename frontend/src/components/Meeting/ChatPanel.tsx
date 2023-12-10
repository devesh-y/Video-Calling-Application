import {memo, useContext, useState, useEffect, useCallback, useRef} from "react"
import { SocketContext } from "../Socket/SocketClient.ts";
import { RxCross1 } from "react-icons/rx"
import { AiOutlineSend } from "react-icons/ai";
import "./chatpanel.css"
const Chatpanel = memo(({selfname}:{selfname:string}) => {

    const socket = useContext(SocketContext);
    const [myinput, setmyinput] = useState("");
    const [chats, setchats] = useState<Array<Array<string>>>([]);
    const panelChatRef=useRef<HTMLDivElement>(null);
    const chatListRef=useRef<HTMLDivElement>(null);
    const getmessagetime = useCallback((): string => {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${formattedHours}:${formattedMinutes} ${amPm}`;
    },[])

    const sendMessage =useCallback( () => {
        if (myinput === "") {
            return;
        }
        const messagetime = getmessagetime();
        setchats([...chats, ["You", messagetime, myinput]])
        socket.emit("chatmessage", { uName: selfname, message: myinput })
        setmyinput("");

    },[chats, getmessagetime, myinput, selfname, socket])

    const getMessage=useCallback(({ uName, message }:{uName:string,message:string}) => {
        const messagetime = getmessagetime();
        setchats([...chats, [uName, messagetime, message]])
    },[chats, getmessagetime])

    useEffect(() => {
        socket.on("chatmessage",getMessage )
        if(chatListRef.current)
        {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }

        return () => {
            socket.off("chatmessage",getMessage)
        }
    }, [getMessage, socket])
    return <div id="panelchat" ref={panelChatRef}>
        <div className="crossbutton" onClick={() => {
            if(panelChatRef.current) {
                panelChatRef.current.style.right = "-400px";
            }

        }}> <RxCross1 /> </div>
        <p style={{ backgroundColor: "#a2f6fc", padding: "10px", borderRadius: "10px" }}>Chat Messages</p>
        <div id="showchat" className="myscrollbar" ref={chatListRef}>
            {chats.map((value, index) => {
                return <div key={index} className="userchat">
                    <pre style={{ marginBottom: "3px" }}><span style={{ fontWeight: "600" }}>{value[0]}</span>     <span style={{ opacity: "0.6" }}>{value[1]}</span> </pre>
                    <pre>{value[2]} </pre>
                </div>
            })}
        </div>
        <div id="addchat">
            <input placeholder="Send a message" value={myinput} type="text" onKeyDown={(event) => {
                if (event.key === "Enter") {
                    sendMessage();
                }
            }} onChange={(e) => setmyinput(e.target.value)} />
            <div onClick={sendMessage}>
                {myinput != "" ? <AiOutlineSend /> : <></>}
            </div>
        </div>

    </div>
})
export default Chatpanel;