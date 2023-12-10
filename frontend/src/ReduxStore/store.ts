import { configureStore } from "@reduxjs/toolkit"
import {reducer1} from "./slice1.ts"
import {peerservice} from "../components/WebRTC/p2p.ts";
export const store = configureStore({
    reducer: {
        slice1: reducer1,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck:false
    })
});

export type StoreType={
    slice1:{
        mapping: Map<string,peerservice>,
        remotestream: Map<peerservice, Array<string | MediaStream | null>>,
        remotescreens: Map<peerservice, Array<MediaStream|string>>,
        video:MediaStream | null,
        audio:MediaStream | null,
        screen:MediaStream | null,
        pinvideo:MediaStream | null,
        pinname:string,
        hands:Map<string,string>
    }
}
