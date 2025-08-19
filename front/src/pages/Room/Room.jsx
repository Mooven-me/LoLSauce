import React from 'react';
import { ShowQuestion } from './Questions/ShowQuestion';
import { RoomPlayerMenu } from './Player/RoomPlayerMenu';
import CustomInput from '../../utils/CustomInput';
import { Button, Form, FormFeedback, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { sendData } from '../../utils/utils';
import { useParams, useNavigate } from 'react-router-dom';
import Questions from './Questions/Questions';

export default function Room(props) {
  let params = useParams()
  let navigate = useNavigate();
  const eventSourceRef = React.useRef(null);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const usersRef = React.useRef([]); // Add this ref to avoid problems bro
  const userIdRef = React.useRef(null); // Add this ref to handle disconnected users
  const [users, setUsers] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false)
  const [usernameError, setUsernameError] = React.useState(false)
  const [data, _setData] = React.useState(false)
  const dataRef = React.useRef({})

  const setData = (data) => {
    dataRef.current = data;
    _setData(data)
  }

  React.useEffect(() => {
    usersRef.current = users;
  }, [users]);

  React.useEffect(() => {
    userIdRef.current = props.userId;
  }, [props.userId]);

  React.useEffect(() => {
    handleConnectWebSocket(props.roomId ?? params.room_id);
    if (!props.isLeader) {
      setShowModal(true)
    } else {
      setUsers([{ user_id: props.userId, username: props.username, is_leader: props.isLeader }]);
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
    const url = new URL("https://localhost/.well-known/mercure");
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

  const handleDispatcher = (data) => {
    setData(data)
    switch (data.type) {
      case "usersUpdate":
        handleUsersUpdate(data)
        break;
    }
  }

  const handleStartGame = () => {
    sendData({ route: '/start', method: "POST", data: { "user_id": props.userId } }).then((data) => {
        setIsGameStarted(true)
    })
  }

  const handleUsernameChange = (e) => {
    props.setUsername(() => e.target.value);
    if (usernameError && e.target.value.trim() !== "") {
      setUsernameError(false);
    }
  }

  React.useEffect(() => {
    console.log("UPDATE DE USERS : ", users);
  }, [users])

  const handleConfirmUser = (e) => {
    e.preventDefault();

    if (props.username.trim() === '') {
      setUsernameError(true);
      return;
    }

    sendData({ route: "/joined", method: "POST", data: { username: props.username, room_id: params.room_id } }).then(data => {
      setShowModal(false);
      setUsers(data.users)
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

      <div className='d-flex flex-row border border-info h-100'>
        <div className="d-flex flex-column w-100 h-100">
          {isGameStarted ?
            <>
              <Questions {...props} data={dataRef}/>
            </>
            :
            props.isLeader &&
            <div className='w-100 h-100 align-content-center'>
              <Button onClick={() => handleStartGame()}> lancer la partie </Button>
            </div>
          }
        </div>
        <RoomPlayerMenu {...{ users: users }} />
      </div>
    </>
  );
}