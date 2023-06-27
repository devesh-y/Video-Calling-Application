import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Meet from './Meeting/MeetAuth.tsx'
import Askjoin from './AskJoin/Askjoin.tsx'
import Home from './HomePage/Home.tsx'
import Endmeet from './Meeting/EndMeet.tsx'
import SocketProvider from './Socket/SocketClient.tsx';
import { store } from './ReduxStore/store.tsx'
import { Provider } from 'react-redux'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Provider store={store}>
        <SocketProvider>
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
        </SocketProvider>
    </Provider>
    

)
