import './App.css'
import Room from './pages/Room/Room'
import {BrowserRouter, Route, Routes} from 'react-router';
import Main from './pages/Main';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import { ToastContainer } from 'react-toastify';
import {
    Badge
} from 'reactstrap'

function App() {

  return (
    <>
      <BrowserRouter>
        <div className='animated-background'/>
        <div className='d-flex flex-column h-100'>
          <Badge style={{position:'absolute', top:'10px', left:'10px'}} color='danger'>Beta 0.1</Badge>
          <ToastContainer />
            <div className='flex-grow-1 h-100'>
              <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/:room_id" element={<Room />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
