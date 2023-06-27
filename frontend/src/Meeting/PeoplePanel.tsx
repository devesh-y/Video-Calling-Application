import { RxCross1 } from "react-icons/rx"
import { peerservice } from "../WebRTC/p2p";
import "./peoplepanel.css"
const PeoplePanel = (props: any) => {
    const { remotestream,selfname } = props;
    return <div id="panelpeople">
        <div className="crossbutton" onClick={() => {
            (document.getElementById("panelpeople") as HTMLElement).style.right = "-400px";
        }}> <RxCross1 />
        </div>
        <div id="peoplelist">
            <div  className="userdetails">
                <div className="avatar" style={{ backgroundColor: "red" }}>{(selfname as string)[0]}</div>
                <div className="panelpeoname">{selfname as string} (You)</div>
            </div>
            {Array.from(remotestream as Map<peerservice, Array<string | MediaStream>>).map(([_peer, data], index) => {
                const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
                const randomNumber = (Math.floor(Math.random() * 10)) % 9 + 1;
                return <div key={index} className="userdetails">
                    <div className="avatar" style={{ backgroundColor: `${colors[randomNumber]}` }}>{(data[2] as string)[0]}</div>
                    <div className="panelpeoname">{data[2] as string}</div>
                </div>
            })}
        </div>
    </div>
}
export default PeoplePanel;