import "./home.css"
import {useCallback, useContext, useEffect, useState} from "react"
import { SocketContext } from "../Socket/SocketClient.ts";
import { useLocation, useNavigate } from "react-router-dom";
import {setcookie} from "../../utils/getSetCookie.ts";

function Meet_create(){
    const [name,setname]=useState("");
    const socket=useContext(SocketContext);
    const navigate = useNavigate();
    const location=useLocation();
    const [code, setcode] = useState("");
    const joinmeeting=useCallback(()=>{
        if(name===""){
            alert("Enter name");
            return;
        }
        if(!socket.connected){
            alert("Let the server restart. (max - 30s)")
            return;
        }
        
        navigate(`/${code}/ask`, { state: { selfname: name }, replace: true });

    },[code, name, navigate, socket])
    const createRoomFunc=useCallback((code:string)=>{
        setcookie(code,"host");
        navigate(`/${code}/ask`, { state: { selfname: name }, replace: true });
    },[name, navigate])
    const newmeeting=useCallback(()=>{
        if (name === "") {
            alert("Enter name");
            return;
        }
        if (!socket.connected) {
            alert("Let the server restart. (max - 30s)")
            return;
        }
        socket.emit("create-room");

    },[name, socket])
    useEffect(() => {
        socket.on("create-room",createRoomFunc)
        return ()=>{
            socket.off("create-room",createRoomFunc);
        }
    }, [createRoomFunc,socket]);
    useEffect(()=>{
        if(location.state && location.state.code!=undefined){
            setcode(location.state.code);
        }
    },[location])
    return <>
        <input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setname(e.target.value)} />
        <div id="meet-creation">
            <button onClick={newmeeting}>New meeting</button>
            <input type="text" value={code} placeholder="Enter an existing code" onChange={(e)=>setcode(e.target.value)}></input>
            {code === "" ? <p style={{visibility:"hidden"}} >Join</p> : <p onClick={joinmeeting} >Join</p>}
        </div>
        
    </>
}
function Home() {
    return <div>
        <div id="logo">
            CrowdConnect
        </div>
        <div id="container">
            <div id="main">
                <p style={{ fontSize: "2.6em", marginBottom: "30px" }}>Secure video conferencing for everyone</p>
                <p style={{ fontSize: "1.1em", marginBottom: "30px", color: "grey" }}>Connect with your friends, family, and colleagues like never before. </p>
                <Meet_create />
                <hr style={{ marginTop: "50px" }}></hr>

            </div>
            <div id="key-features">
                <ul>
                    <li>Experience seamless and crystal-clear video calls with multiple participants from anywhere in the world. </li>
                    <li>Stay connected, share moments, and collaborate effortlessly with our user-friendly interface</li>
                    <li>Start your video calls today and bring people together in a whole new way. </li>
                </ul>

            </div>
        </div>
        <p style={{ marginLeft: "50px", marginTop: "50px" }} ><a style={{ textDecoration: "none", color: "#0238fd", fontWeight: "700" }} href="https://github.com/devesh-y/Video-Calling-Application#readme" target="_blank">Learn More</a> about CrowdConnect</p>
    </div>
        

}

export default Home;