import React from 'react';
import { RoomPlayerMenu } from './Player/RoomPlayerMenu';
import { Button, Form, FormFeedback, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { sendData } from '../../utils/utils';
import { useParams, useNavigate } from 'react-router-dom';
import MiddleScene from './MiddleScene/MiddleScene.jsx';
import LoadingButton from '../../utils/LoadingButton.jsx';
import Chat from './Chat/Chat.jsx';

export default function Room(props) {
  let params = useParams()
  let navigate = useNavigate();
  const eventSourceRef = React.useRef(null);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const usersRef = React.useRef([]);
  const userIdRef = React.useRef(null);
  const [users, _setUsers] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false)
  const [usernameError, setUsernameError] = React.useState(false)
  const [data, _setData] = React.useState(false)
  const dataRef = React.useRef({})
  const [startGameLoading, setStartGameLoading] = React.useState(false);
  const [userFoundAnswer, setUserFoundAnswer] = React.useState(false)
  const messagesRef = React.useRef([]);
  const [messages, _setMessages] = React.useState([]);

  const setMessages = (messages) => {
    messagesRef.current = messages;
    _setMessages(messages);
  }

  const setData = (data) => {
    dataRef.current = data;
    _setData(data)
  }

  React.useEffect(() => {
    console.log("User a changé : ")
    console.log(users)
  }, [users]);

  const setUsers = (users) => {
    usersRef.current = users;
    _setUsers(users)
  }

  React.useEffect(() => {
    userIdRef.current = props.userId;
  }, [props.userId]);

  React.useEffect(() => {
    handleConnectWebSocket(props.roomId ?? params.room_id);
    if (!props.isLeader) {
      setShowModal(true)
    } else {
      setUsers([{ user_id: props.userId, username: props.username, is_leader: props.isLeader, score:0 }]);
    }

    const handleBeforeUnload = () => {
      if (userIdRef) {
        navigator.sendBeacon(
          '/api/leaved',
          JSON.stringify({ user_id: userIdRef },
            {
              type: 'application/json'
            }
          ));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        sendData({ route: "/leaved", method: "POST", data: { user_id: props.userId } })
      };
    }
  }, [])

  const handleConnectWebSocket = (roomId) => {
    const url = new URL(import.meta.env.VITE_MERCURE_PUBLIC_URL);
    url.searchParams.append('topic', "https://subrscribed.channel/" + roomId + "/room");
    const es = new EventSource(url.toString(), { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      handleDispatcher(JSON.parse(event.data))
    };

    es.onerror = (err) => {
      sendData({ route: "/leaved", method: "POST", data: { user_id: props.userId } })
    };
  }

  const handleUsersUpdate = (data) => {
    setUsers(data.users)
  }

  const handleResetUsers = () => {
    setUsers(
      usersRef.current.map((user) => {
        return {
          ...user,
          time: "",
          success: false,
          word: "",
        }
      }
    ))
    setUserFoundAnswer(false)
  }

  const handleUserMessage = (message) => {
    setMessages([...messagesRef.current, 
      {
        "message":message.message,
        "user_id":message.user_id
      }
    ])
  }

  const handleDispatcher = (data) => {
    switch (data.type) {
      case "userMessage":
        handleUserMessage(data);
        break;
      case "usersUpdate":
        handleUsersUpdate(data)
        break;
      case "question":
        setData(data)
        handleResetUsers()
        break;
      case "answer":
        setData(data)
        break;
      case "start":
        setIsGameStarted(true)
        break;
      case "success":
        let time = data.time.s + data.time.f
        console.log("time 1 : " + data.time.s)
        console.log("time 2 : " + data.time.f)
        setUsers(usersRef.current.map(user => 
            user.user_id === data.user_id 
                ? { 
                  ...user, 
                  success: true,
                  time: time.toFixed(3) + 's',
                  word: "",
                  score: data.score
                }
                : user
        ))
        if(data.user_id === userIdRef.current){
          setUserFoundAnswer(true)
        }
        break;
      case "try":
        setUsers(usersRef.current.map(user => 
            user.user_id === data.user_id 
                ? { 
                  ...user, 
                  word: data.word
                }
                : user
        ))
        break;
    }
  }

  const handleStartGame = () => {
    setStartGameLoading(true)
    sendData({ route: '/start', method: "POST", data: { "user_id": props.userId } }).then((data) => {
      setStartGameLoading(false)
    })
  }

  const handleUsernameChange = (e) => {
    props.setUsername(() => e.target.value);
    if (usernameError && e.target.value.trim() !== "") {
      setUsernameError(false);
    }
  }

  const handleConfirmUser = (e) => {
    e.preventDefault();

    if (props.username.trim() === '') {
      setUsernameError(true);
      return;
    }

    sendData({ route: "/join", data: { username: props.username, room_id: params.room_id } }).then(data => {
      setShowModal(false);
      setUsers(data.users);
      props.setUserId(data.user_id);
      props.setRoomId(data.room_id);
      props.setUsername(data.username);
    })

  };

  return (
    <>
      <Modal isOpen={showModal} centered fade backdrop>
        <Form onSubmit={handleConfirmUser}>
          <ModalHeader>Choisissez votre pseudo</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Input
                type="text"
                placeholder="Pseudo"
                value={props.username ?? ""}
                onChange={handleUsernameChange}
                invalid={usernameError}
                required
              />
              <FormFeedback>Ce champ est requis.</FormFeedback>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="info" className="text-white" type="submit">
              Confirmer
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <div className='d-flex flex-row border border-info h-100' style={{maxHeight: "calc(100% - 24px)"}}>
        <div className="d-flex flex-column w-100 h-100 justify-content-center">
          {isGameStarted ?
            <>
              <MiddleScene {...props} data={data} userFoundAnswer={userFoundAnswer}/>
            </>
            :
            props.isLeader ?
            <div className='w-100 d-flex justify-content-center align-items-center'>
              <LoadingButton loading={startGameLoading} onClick={() => handleStartGame()}> lancer la partie </LoadingButton>
            </div>
            :
            <div>
              <i>Le chef configure la game ...</i>
            </div>
          }
        </div>
        <RoomPlayerMenu users={users} />
        <Chat messages={messages} userId={props.userId} users={users}/>
      </div>
    </>
  );
}