import React from 'react';
import { ShowQuestion } from '../utils/ShowQuestion';
import { RoomPlayerMenu } from '../utils/RoomPlayerMenu';
import CustomInput from '../utils/CustomInput';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { sendData } from '../utils/utils';
import { useParams, useNavigate } from 'react-router-dom';

export default function Room(props) {
  let params = useParams()
  let navigate = useNavigate();
  const eventSourceRef = React.useRef(null);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const usersRef = React.useRef([]); // Add this ref to avoid problems bro
  const [users, setUsers] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false)
  const [usernameError, setUsernameError] = React.useState(false)

  React.useEffect(() => {
    usersRef.current = users;
  }, [users]);

  React.useEffect(() => {
    handleConnectWebSocket(props.roomId??params.room_id);
    if(!props.isLeader){
      setShowModal(true)
    }else{
        setUsers([{userId:props.userId, username: props.username, isLeader: props.isLeader}]);
    }

    const handleBeforeUnload = () => {
      if (props.userId) {
        // Use sendBeacon for reliability during page unload
        navigator.sendBeacon('/api/leaved', JSON.stringify({user_id: props.userId}));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if(eventSourceRef.current){
          eventSourceRef.current.close();
          console.log(props.userId)
          sendData({route:"/leaved", method:"POST", data:{user_id:props.userId}})
        };
      }
  }, []) 
 
  const handleConnectWebSocket = (roomId) => {
    const url = new URL("https://localhost/.well-known/mercure");
    url.searchParams.append('topic', "https://subrscribed.channel/"+roomId+"/room");
    const es = new EventSource(url.toString(), { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      handleDispatcher(JSON.parse(event.data))
    };

    es.onerror = (err) => {
      console.log('ici')
      sendData({route:"/leaved", method:"POST", data:{user_id:props.userId}})
    };
  }
  
  const handleJoinedUser = (data) => {
    console.log(data)
    let usersId = usersRef.current.map((elem) => (elem.user_id))
    if(!usersId.includes(data.user.user_id)){
      setUsers((old) => [...old, data.user])
    }
  }

  const handleLeavedUser = (data) => {
    console.log("users dans le handleLeavedUser", usersRef.current)
    let usersId = usersRef.current.map((elem) => (elem.user_id))
    console.log(usersId)
    if(usersId.includes(data.user_id)){
      let usersCopy = usersRef.current.filter((user) => user.user_id !== data.user_id);
      setUsers(usersCopy)
    }
  }

  const handleDispatcher = (data) => {
    switch(data.type){
      case "start":
        setIsGameStarted(() => true)
        break;
      case "try":

        break;
      case "success":

        break;
      case "joined":
        handleJoinedUser(data)
        break;
      case "leaved":
        handleLeavedUser(data)
        break;
    }
  }

  const handleStartGame = () => {
    navigate("/")
    props.sendData('/start', "POST", {"user_id": props.userId})
  }

  const handleUsernameChange = (e) => {
      props.setUsername(() => e.target.value);
      if(usernameError && e.target.value.trim() !== "") {
          setUsernameError(false);
      }
  }

  React.useEffect(() => {
    console.log("UPDATE DE USERS : ", users);
  }, [users])

  const handleConfirmUser = () => {
      sendData({route:"/joined", method:"POST", data: {username: props.username, room_id: params.room_id}}).then(data => {
        props.setUserId(data.user_id)
        props.setRoomId(data.room_id)
        setShowModal(false);
        console.log("ON A RECU LE WEBSERV DE JOINED", data.users)
        setUsers(data.users)
      })
  }

  return (
    <>
      <Modal isOpen={showModal} centered fade backdrop>
        <ModalHeader>Choisiez votre pseudo</ModalHeader>
        <ModalBody>
          <Input placeholder='Pseudo' onChange={handleUsernameChange} invalid={usernameError}/>
        </ModalBody>
        <ModalFooter>
          <Button color="info" className='text-white' onClick={handleConfirmUser}>Confirmer</Button>
        </ModalFooter>
      </Modal>

      <div className='d-flex flex-row border border-info h-100'>
        <div className="d-flex flex-column w-100 h-100">
          {props.isLeader &&
            <div className='w-100 h-100 align-content-center'>
              <Button onClick={() => handleStartGame()}> lancer la partie </Button>
            </div>
          }                                                                                                              
          {isGameStarted &&
          <>
            <ShowQuestion
              question="aled ?"
              type="image"
              image="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Gangplank_0.jpg"
            />
            <CustomInput/>
          </>
          }
        </div>
        <RoomPlayerMenu {...{users: users}}/>
      </div>
    </>
  );
}