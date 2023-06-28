import { createSlice } from "@reduxjs/toolkit";
import { peerservice } from "../WebRTC/p2p";

const slice1=createSlice({
    name:"slice1",
    initialState:{
        remotestream: new Map<peerservice, Array<string | MediaStream | null>>(),
        remotescreens: new Map<peerservice, Array<MediaStream|string>>(),
        video:null,
        audio:null,
        screen:null,

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
        }
    }
});

export const { setremotescreen,setremotestream,setscreen,setvideo,setaudio}=slice1.actions;
export const reducer1=slice1.reducer;
