import './App.css'
import Room from './pages/Room/Room'
import {BrowserRouter, Route, Routes} from 'react-router';
import Main from './pages/Main';
import CustomNavbar from './utils/CustomNavbar';
import React from 'react';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import { ToastContainer } from 'react-toastify';
import {
    Badge
} from 'reactstrap'

function App() {

  const [userId, setUserId] = React.useState(null)
  const [username, setUsername] = React.useState(null)
  const [roomId, setRoomId] = React.useState(null)
  const [isLeader, setIsLeader] = React.useState(false)

  return (
    <>
      <BrowserRouter>
        <div className='d-flex flex-column h-100'>
          <Badge style={{position:'absolute', top:'10px', left:'10px'}} color='danger'>Beta</Badge>
          <CustomNavbar {...{roomId}}/>
          <ToastContainer />
          <Routes>
            <Route 
              path="/"
              element={<Main {...{userId, setUserId, roomId, setRoomId, isLeader, setIsLeader, username, setUsername}} />}
            />
            <Route 
              path="/register"
              element={<Register {...{userId, setUserId, roomId, setRoomId, isLeader, setIsLeader, username, setUsername}} />}
            />
             <Route 
              path="/login"
              element={<Login {...{userId, setUserId, roomId, setRoomId, isLeader, setIsLeader, username, setUsername}} />}
            />
            <Route 
              path="/:room_id"
              element={<Room {...{userId, setUserId, roomId, setRoomId, isLeader, setIsLeader, username, setUsername}} />}
            />
            <Route 
              path="/admin"
              element={<Admin />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
