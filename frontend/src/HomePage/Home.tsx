import "./home.css"
import { useContext, useState} from "react"
import { SocketContext } from "../Socket/SocketClient";
import { useNavigate } from "react-router-dom";

function Meet_create(){
    const [name,setname]=useState("");
    const socket=useContext(SocketContext);
    function joinmeeting(navigate:any){
        if(name===""){
            alert("Enter name");
            return;
        }
        navigate(`/${code}`,{state:{selfname:name}});

    }
    function newmeeting(navigate:any){
        if (name === "") {
            alert("Enter name");
            return;
        }
        socket.emit("create-room");
        socket.on("create-room",(code)=>{
    
            navigate(`/${code}`, { state: { selfname: name } });
            return;
        })
    }
    const navigate=useNavigate();
    const [code,setcode]=useState("");
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
    return <>
        <div id="logo">
            CrowdConnect
        </div>
        <div id="container">
            <div id="main">
                <p style={{ fontSize: "2.6em", marginBottom: "30px" }}>Secure video conferencing for everyone</p>
                <p style={{ fontSize: "1.1em", marginBottom: "30px", color: "grey" }}>Connect with your friends, family, and colleagues like never before. </p>
                <Meet_create/>
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
        <p style={{ marginLeft: "50px",marginTop:"50px"}} ><a style={{ textDecoration: "none", color: "#0238fd", fontWeight: "700" }} href="https://github.com/devesh-y/Video-Calling-Application#readme" target="_blank">Learn More</a> about CrowdConnect</p>
    </>
}

export default Home;



{/* <div id="devesh-y-socialmedia">
            <a href="https://github.com/devesh-y" target="_blank" title="devesh-y-github">
                <svg id="devesh-y-github" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
                    <path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .8 2.5.6 3.1.4.1-.7.4-1.2.7-1.5-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.8-.4s1.9.1 2.8.4c2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.7.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.5-5.5 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.3.7.8.6A12 12 0 0 0 12 0z" />
                </svg>
            </a>

            <a href="https://www.linkedin.com/in/devesh-y/" target="_blank" title="devesh-y-linkedin">
                <svg id="devesh-y-linkedin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.5 3h-17C2.673 3 2 3.673 2 4.5v17C2 22.327 2.673 23 3.5 23h17c.827 0 1.5-.673 1.5-1.5v-17C22 3.673 21.327 3 20.5 3zM8.681 18.657h-2.88V9.38h2.88v9.277zM7.24 8.69H7.22c-.959 0-1.558-.647-1.558-1.453C5.662 6.773 6.26 6 7.298 6c1.04 0 1.56.773 1.58 1.515c0 .806-.6 1.176-1.62 1.176zM19 18.657h-2.882v-4.856c0-1.186-.426-2-1.494-2c-.816 0-1.304.54-1.512 1.06-.078.194-.097.463-.097.733v5.06H10.22s.038-7.82 0-8.637h2.883v1.226c.387-.6 1.072-1.464 2.607-1.464c1.89 0 3.31 1.226 3.31 3.866V18.656z" />
                </svg>
            </a>
        </div> */}