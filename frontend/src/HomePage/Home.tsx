import "./home.css"
import { useContext, useEffect, useState} from "react"
import { SocketContext } from "../Socket/SocketClient";
import { useLocation, useNavigate } from "react-router-dom";

function Meet_create(){
    const [name,setname]=useState("");
    const socket=useContext(SocketContext);
    const navigate = useNavigate();
    const location=useLocation();
    const [code, setcode] = useState("");
    function joinmeeting(navigate:any){
        if(name===""){
            alert("Enter name");
            return;
        }
        if(socket.connected===false){
            alert("Try after few seconds. (max - 30s)")
            return;
        }
        
        navigate(`/${code}`,{state:{selfname:name}});

    }
    function newmeeting(navigate:any){
        if (name === "") {
            alert("Enter name");
            return;
        }
        if (socket.connected === false) {
            alert("Try after few seconds. (max - 30s)")
            return;
        }
        socket.emit("create-room");
        socket.on("create-room",(code)=>{
            const d = new Date();
            d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toUTCString();
            document.cookie = code + "=" + "host" + ";" + expires + ";path=/";
            navigate(`/${code}`, { state: { selfname: name } });
            return;
        })
    }
    useEffect(()=>{
        if(location.state && location.state.code!=undefined){
            setcode(location.state.code);
        }
    },[])
    return <>
        <input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setname(e.target.value)} />
        <div id="meet-creation">
            <button onClick={()=>newmeeting(navigate)}>New meeting</button>
            <input type="text" value={code} placeholder="Enter an existing code" onChange={(e)=>setcode(e.target.value)}></input>
            {code != "" ? <p onClick={()=>joinmeeting(navigate)} >Join</p>:<></>}
        </div>
        
    </>
}
function Home() {
    return <div id="homecontainer">
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