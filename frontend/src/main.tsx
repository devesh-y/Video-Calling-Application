import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Meet from './components/Meeting/MeetAuth.tsx'
import Askjoin from './components/AskJoin/Askjoin.tsx'
import Home from './components/HomePage/Home.tsx'
import Endmeet from './components/Meeting/EndMeet.tsx'
import {socket} from './components/Socket/SocketClient.ts';
import { SocketContext } from './components/Socket/SocketClient.ts'
import { store } from './ReduxStore/store.ts'
import { Provider } from 'react-redux'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Provider store={store}>
        <SocketContext.Provider value={socket}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/:code'>
                        <Route path='' element={<Meet />} />
                        <Route path='ask' element={<Askjoin />} />
                    </Route>
                    <Route path='/end' element={<Endmeet />} />
                </Routes>
            </BrowserRouter>
        </SocketContext.Provider>
    </Provider>
    

)
