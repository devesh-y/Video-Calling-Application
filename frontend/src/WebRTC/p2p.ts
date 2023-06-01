class peerservice {

    peer: RTCPeerConnection;
    constructor() {
        this.peer = new RTCPeerConnection({ 
            'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] 
        })
    }
    async getoffer(){
        if(this.peer){
            const offer= await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return this.peer.localDescription;
        }
    }
    async getanswer(offer:any,mystream:any){
        await this.peer.setRemoteDescription(offer);
        mystream.getTracks().forEach((track: any) => {
            this.peer.addTrack(track, mystream);
        });
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        return this.peer.localDescription;
    }
}
export {peerservice};