import './App.css'
import Lobby from './pages/Lobby'
import {BrowserRouter, Route, Routes} from 'react-router';
import Main from './pages/Main';
import Navbar from './utils/Navbar';

function App() {
  return (
    <>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route 
            path="/"
            element={<Main />}
          />
          <Route 
            path="/:lobby_id"
            element={<Lobby />}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
