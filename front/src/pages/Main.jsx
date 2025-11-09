import React from 'react';
import { Button, ButtonGroup, Card, CardBody, Fade, FormFeedback, FormGroup, Input, Navbar } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { sendData } from '../utils/utils';
import LoadingButton from '../utils/LoadingButton';
import { setIsLeader, setRoomId, setUsers } from '../store/roomSlice';
import { setAuth, setUsername } from '../store/authSlice';

export default function Main(props) {
    const navigate = useNavigate();
    const [usernameError, setUsernameError] = React.useState(false);
    const [joinRoomError, setJoinRoomError] = React.useState(false);
    const [roomCreationLoading, setRoomCreationLoading] = React.useState(false);
    const [size, setSize] = React.useState(window.innerWidth);
    const usernameRef = React.useRef("");
    const roomId = React.useRef("")

    const dispatch = useDispatch();

    React.useEffect(() =>{
        dispatch(setUsername(""));
        window.addEventListener('resize', () => {
            setSize(window.innerWidth)
        })
        return () => {
            removeEventListener('resize', window)
        }
    },[])
    
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
            console.log("erreur")
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
        <div className='d-flex flex-column h-100 align-items-center '>
            <Navbar fixed={"top"} className='align-items-end'>
                <div className='w-100 d-flex justify-content-end gap-3'>
                    <Button className='shadow' onClick={() => navigate('/register')}>Inscription</Button>
                    <Button className='shadow' onClick={() => navigate('/login')}>Connexion</Button>
                </div>
            </Navbar>
            <div className='' style={{fontSize: "10vw", marginTop:"50px"}}>
                LoLSauce
            </div>
            <div className='d-flex flex-column h-100 w-100 align-items-center'>
                <div className="flex-row-column align-self-center align-items-center gap-5 computer-600 h-25" style={{width:"40vw"}}>
                    <Card style={{padding:0, backgroundColor:"rgb(107, 114, 150)", width:"100%", minWidth:"180px"}}>
                        <CardBody className='flex-row-column'>
                            <FormGroup className="formulaire w-100">
                                <ButtonGroup className="w-100" vertical={size<682}>
                                    <Button color="info" className='shadow border-0' onClick={() =>handleNavigateToRoom()}>
                                        <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Rejoindre</b>
                                    </Button>
                                    <Input 
                                        className='shadow- arrondi-gauche'
                                        onChange={(e) => {roomId.current = e.target.value}}
                                        type={"number"}
                                        onKeyUpCapture={(e) => e.key === 'Enter' && handleNavigateToRoom()} 
                                        placeholder='Code de la salle'
                                        invalid={joinRoomError}
                                        min={"0"}
                                    />
                                </ButtonGroup>
                            </FormGroup>
                        </CardBody>
                    </Card>
                    <Card style={{padding:0, backgroundColor:"rgb(107, 114, 150)", width:"100%", minWidth:"180px"}}>
                        <CardBody className='flex-row-column'>
                            <FormGroup className="formulaire w-100">
                                <ButtonGroup className="w-100" vertical={size<682}>
                                    <LoadingButton color="info" className='shadow border-0' onClick={createRoom} forceLoading={roomCreationLoading}>
                                        <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Créer</b>
                                    </LoadingButton>
                                    <Input 
                                        className='shadow arrondi-gauche'
                                        placeholder='Pseudo' 
                                        onKeyUpCapture={(e) => e.key === 'Enter' && createRoom()} 
                                        onChange={(e) => handleUsernameChange(e)}
                                        invalid={usernameError}
                                        maxLength={15}
                                    />
                                </ButtonGroup>
                            </FormGroup>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    </>
    )
}
