import { configureStore } from "@reduxjs/toolkit"
import {reducer1} from "./slice1"
export const store = configureStore({
    reducer: {
        slice1: reducer1,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck:false
    })
});


