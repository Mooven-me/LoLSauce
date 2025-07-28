import React from 'react';
import { ShowQuestion } from '../utils/ShowQuestion';
import { RoomPlayerMenu } from '../utils/RoomPlayerMenu';
import CustomInput from '../utils/CustomInput';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { sendData } from '../utils/utils';
import { useParams } from 'react-router-dom';

export default function Room(props) {
  let params = useParams()
  const eventSourceRef = React.useRef(null);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  console.log('props', props)
  const [users, setUsers] = React.useState([{userId:props.userId, username: props.username, isLeader: props.isLeader}]);
  const [showModal, setShowModal] = React.useState(false)
  const [usernameError, setUsernameError] = React.useState(false)

  

  React.useEffect(() => {
    console.log("user mis a jour : " + users);
  },[users])

  const handleConnectWebSocket = () => {
    console.log(props)
    if(props.roomId == null && props.userId == null){
      console.log("not connected")
    }
    const url = new URL("https://localhost/.well-known/mercure");
    url.searchParams.append('topic', "https://subrscribed.channel/"+props.roomId+"/room");
    console.log("envoyé")

    const es = new EventSource(url.toString(), { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      handleDispatcher(JSON.parse(event.data))
    };

    es.onerror = (err) => {
      console.error("Mercure error", err);
      sendData({route:"/leaved", method:"POST", data:{username:props.username}})
    };

    return () => {
      es.close();
      sendData({route:"/leaved", method:"POST", data:{username:props.username}})
    };
  }

  React.useEffect(() => {
    if(props.isLeader){
      handleConnectWebSocket();
    }else{
      setShowModal(true)
    }
  }, []) 
  
  const handleJoinedUser = (data) => {
    let usersId = users.map((elem) => (elem.userId))
    console.log('userid', usersId)
    if(!usersId.includes(data.user.user_id)){
      console.log("mauvaise nouvelle")
      setUsers((old) => ([...old, data.user]))
    }
  }

  const handleLeavedUser = () => {
    let usersId = users.map((elem) => (elem.user_id))
    if(usersId.includes(data.user_id)){
      let usersCopy = users.filter((user) => user.user_id !== data.user_id);
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
    props.sendData('/start_room', "POST", {"user_id": props.userId})
  }

  const handleUsernameChange = (e) => {
      props.setUsername(() => e.target.value);
      if(usernameError && e.target.value.trim() !== "") {
          setUsernameError(false);
      }
  }

  const handleConfirmUser = () => {
      sendData({route:"/joined", method:"POST", data: {username: props.username, room_id: params.room_id}}).then(data => {
         props.setUserId(data.user_id)
         props.setRoomId(data.room_id)
         setShowModal(false);
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
              <Button onClick={() => handleStartGame}> lancer la partie </Button>
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