import React from 'react';
import {
    Alert,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Col,
    Container,
    FormGroup,
    Input,
    InputGroup,
    Row, UncontrolledAlert
} from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendData } from '../../utils/utils.jsx';
import LoadingButton from '../../utils/LoadingButton.jsx';
import { setIsLeader, setRoomId, setUsers } from '../../store/roomSlice.js';
import { setAuth } from '../../store/authSlice.js';
import MainNavbar from "./MainNavbar.jsx";
import JoinBackAlert from "../../utils/JoinBackAlert.jsx";
import {initDiscordAuth} from "../../utils/DiscordSdk.jsx";

export default function Main() {
    const navigate = useNavigate();
    const [usernameError, setUsernameError] = React.useState(false);
    const [joinRoomError, setJoinRoomError] = React.useState(false);
    const [roomCreationLoading, setRoomCreationLoading] = React.useState(false);
    const usernameRef = React.useRef(window.IS_LOGGED_IN ? window.USERNAME : "");
    const roomId = React.useRef("")

    const dispatch = useDispatch();

    React.useEffect(() => {
        initDiscordAuth().then(data => {
            // if the user is using discord
            if(data){
                console.log(data)
                window.USERNAME = data.user.username;
                window.ROOM_ID = data.room_id
                navigate('/'+data.room_id)
            }
        });
    },  [])

    const createRoom = async () => {
        if(!usernameError && usernameRef.current.trim() !== ""){
            setRoomCreationLoading(true)
            await sendData({route: '/create_room', method: "POST", data: {"username": usernameRef.current}}).then((data) => {
                setRoomCreationLoading(false)
                dispatch(setIsLeader(true));
                dispatch(setRoomId(data.room_id));
                dispatch(setUsers([{user_id:data.user_id, username: usernameRef.current, is_leader:true}]));
                dispatch(setAuth({
                    userId: data.user_id,
                    username: usernameRef.current
                }));
                navigate('/'+data.room_id)
            })
        }else{
            setUsernameError(true)
        }
    }

    const handleNavigateToRoom =() => {
        if(!roomId.current){
            setJoinRoomError(true)
        }else{
            navigate('/'+roomId.current)
        }
    }

    const handleUsernameChange = (e) => {
        if(e.target.value.length <=15){
            usernameRef.current = e.target.value
            if(usernameError || e.target.value.trim() !== "") {
                setUsernameError(false);
            }else{
                setUsernameError(true)
            }
        }
    }

    return (
    <>
        <div className='d-flex flex-column h-100'>
            <MainNavbar />
            <Container className={"flex-grow-1"}>
                <div style={{fontSize: "10vw", marginTop:"50px"}}>
                    LoLSauce
                </div>
                <div className='vstack gap-5'>
                    <Row className="gy-3 justify-content-center">
                        <Col sm={6} md={5} lg={4}>
                            <Card color={'dark'} className={"p-0 bg-opacity-50"}>
                                <CardBody>
                                    <InputGroup>
                                        <Button outline color={"info"} style={{width:"101px"}} className='shadow' onClick={handleNavigateToRoom}>
                                            <b>Rejoindre</b>
                                        </Button>
                                        <Input
                                            className='shadow bg-opacity-25 bg-secondary'
                                            onChange={(e) => {roomId.current = e.target.value}}
                                            type={"number"}
                                            onKeyUpCapture={(e) => e.key === 'Enter' && handleNavigateToRoom()}
                                            placeholder='Code'
                                            invalid={joinRoomError}
                                            min={"0"}
                                        />
                                    </InputGroup>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col sm={6} md={5} lg={4}>
                            <Card color={'dark'} className={"p-0 bg-opacity-50"}>
                                <CardBody>
                                    <InputGroup>
                                        <LoadingButton color={"info"} style={{width:"101px"}} outline onClick={createRoom} forceLoading={roomCreationLoading}>
                                            <b>Créer</b>
                                        </LoadingButton>
                                        <Input
                                            className='bg-opacity-25 bg-secondary'
                                            placeholder='Pseudo'
                                            onKeyUpCapture={(e) => e.key === 'Enter' && createRoom()}
                                            onChange={(e) => handleUsernameChange(e)}
                                            invalid={usernameError}
                                            maxLength={32}
                                            defaultValue={window.IS_LOGGED_IN ? window.USERNAME : ""}
                                        />
                                    </InputGroup>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col sm={12} md={10} lg={8}>
                            <JoinBackAlert leavable />
                        </Col>
                    </Row>

                </div>
            </Container>
            <div className="w-100 opaque-dark-blue py-2 px-3 text-center" style={{fontSize: '0.8rem'}}>
                <div className="mb-2">
                    <span className="mx-2" onClick={() => navigate('/terms')} style={{cursor: 'pointer', textDecoration: 'underline'}}>Terms of Service</span>
                    |
                    <span className="mx-2" onClick={() => navigate('/privacy')} style={{cursor: 'pointer', textDecoration: 'underline'}}>Privacy Policy</span>
                </div>
                <div>
                    LoLSauce is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
                </div>
            </div>
        </div>
    </>
    )
}
