class peerservice {

    peer: RTCPeerConnection;
    constructor(peer) {
        this.peer = new RTCPeerConnection({ 
            'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] 
        })
    }

}