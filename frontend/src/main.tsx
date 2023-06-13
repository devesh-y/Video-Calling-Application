import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Meet from './Meeting/Meet.tsx'
import Askjoin from './AskJoin/Askjoin.tsx'
import Home from './HomePage/Home.tsx'
import SocketProvider from './Socket/SocketClient.tsx';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

    <SocketProvider>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/:code'>
                    <Route path='' element={<Meet />} />
                    <Route path='ask' element={<Askjoin />} />
                </Route>
                
            </Routes>
        </BrowserRouter>
    </SocketProvider>

)
