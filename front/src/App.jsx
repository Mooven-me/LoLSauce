import './App.css'
import Room from './pages/Room/Room'
import {BrowserRouter, Route, Routes} from 'react-router';
import Main from './pages/Main/Main.jsx';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import { ToastContainer } from 'react-toastify';
import {
  Badge, Modal, Spinner
} from 'reactstrap'
import TermsOfService from "./pages/Legal/TermsOfServices.jsx";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy.jsx";
import React, {useState} from "react";
import {initDiscordAuth} from "./utils/DiscordSdk.jsx";
import {useNavigate} from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // detect if this is a discord client
    const queryParams = new URLSearchParams(window.location.search);
    const isDiscordEnv = queryParams.has('instance_id') || queryParams.has('frame_id');

    if(isDiscordEnv) {
      setLoading(true);
      initDiscordAuth().then(data => {
        // if the user is using discord
        if(data){
          window.USERNAME = data.user.username;
          window.ROOM_ID = data.room_id
          navigate('/'+data.room_id)
        }
        setLoading(false);
      });
    }

  },  [])

  return (
    <>
        <Modal centered isOpen={loading}>
          <Spinner className="mx-auto" />
        </Modal>
        <div className='animated-background'/>
        <div className='d-flex flex-column h-100'>
          <Badge style={{position:'absolute', top:'10px', left:'10px', zIndex:"1040"}} color='danger'>v0.4 - Discord Activity</Badge>
          <ToastContainer />
          <div className='flex-grow-1 h-100'>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<Register />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/:room_id" element={<Room />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </div>
    </>
  )
}

export default App
