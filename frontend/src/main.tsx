import React from 'react';
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './HomePage/Home.tsx'
import Meet from './Meeting/Meet.tsx'
import "./index.css"
import SocketProvider from './Socket/SocketClient.tsx';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

    <SocketProvider>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/:code' element={<Meet />} />
            </Routes>
        </BrowserRouter>
    </SocketProvider>

)
 