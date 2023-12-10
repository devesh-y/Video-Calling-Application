import { createSlice } from "@reduxjs/toolkit";
import { peerservice } from "../components/WebRTC/p2p";

const slice1=createSlice({
    name:"slice1",
    initialState:{
        mapping: new Map<string,peerservice>(),
        remotestream: new Map<peerservice, Array<string | MediaStream | null>>(),
        remotescreens: new Map<peerservice, Array<MediaStream|string>>(),
        video:null,
        audio:null,
        screen:null,
        pinvideo:null,
        pinname:"You",
        hands: new Map<string,string>()

    },
    reducers:{
  
        setremotestream:(state,action)=>{
            state.remotestream=action.payload;
        },
        setremotescreen:(state,action)=>{
            state.remotescreens=action.payload;
        },
        setscreen:(state,action)=>{
            state.screen = action.payload;
        },
        setvideo:(state,action)=>{
            state.video = action.payload;
        },
        setaudio:(state,action)=>{
            state.audio=action.payload
        },
        setmapping: (state, action) => {
            state.mapping = action.payload
        },
        setpinname:(state,action)=>{
            state.pinname=action.payload
        },
        setpinvideo:(state,action)=>{
            state.pinvideo=action.payload
        },
        sethands:(state,action)=>{
            state.hands = action.payload
        }
    }
});

export const { setremotescreen,setremotestream,setscreen,setvideo,setaudio,setmapping,setpinname,setpinvideo,sethands}=slice1.actions;
export const reducer1=slice1.reducer;
