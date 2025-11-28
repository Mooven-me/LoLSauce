// Room.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  useParams } from 'react-router-dom';
import { connect, disconnect } from '../../store/mercureSlice';
import { RoomPlayerMenu } from './Player/RoomPlayerMenu';
import MiddleScene from './MiddleScene/MiddleScene';
import Chat from './Chat/Chat';
import LoadingButton from '../../utils/LoadingButton';
import JoinModal from './JoinModal';
import { sendData } from '../../utils/utils';
import CustomNavbar from './CustomNavbar.jsx';
import { stop } from '../../store/gameSlice';
import Settings from "./Settings.jsx";

export default function Room() {
  const dispatch = useDispatch();
  const params = useParams();
  
  const isGameStarted = useSelector(state => state.game.isStarted);
  const isLeader = useSelector(state => state.room.isLeader);
  const userId = useSelector(state => state.auth.userId);
  const roomId = useSelector(state => state.room.roomId);

  useEffect(() => {
    dispatch(connect({ roomId: roomId ?? params.room_id }));
    
    return () => {
      dispatch(disconnect());
      dispatch(stop());
      sendData({ route: "/leaved", method: "POST", data: { user_id: userId } });
    };
  }, []);

  const handleStartGame = async () => {
    await sendData({ route: '/start', method: "POST", data: { user_id: userId } })
  }
  
  return (
    <div className='h-100 w-100 d-flex flex-column'>
      <CustomNavbar roomId={roomId} />
      <JoinModal />
      <div 
        className='flex-grow-1 d-flex flex-row border border-primary mh-0'
        style={{ minHeight: 0, marginRight: "1px" }}
      >
        <div className="d-flex flex-column w-100 h-100 justify-content-center position-relative">
          {isGameStarted ? (
            <MiddleScene />
          ) : (
            isLeader ? (
              <>
                <Settings />
                <LoadingButton onClick={handleStartGame} className={"align-self-center opaque-dark-blue"}>
                    lancer la partie
                </LoadingButton>
              </>
            ) : (
              <div><i>Le chef configure la game ...</i></div>
            )
          )}
        </div>
        <RoomPlayerMenu />
        <Chat />
      </div>
    </div>
  );
}