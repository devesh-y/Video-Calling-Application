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

        }
    }

}