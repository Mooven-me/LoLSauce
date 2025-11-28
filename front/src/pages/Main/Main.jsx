import React from 'react';
import { Button, ButtonGroup, Card, CardBody, FormGroup, Input } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendData } from '../../utils/utils.jsx';
import LoadingButton from '../../utils/LoadingButton.jsx';
import { setIsLeader, setRoomId, setUsers } from '../../store/roomSlice.js';
import { setAuth, setUsername } from '../../store/authSlice.js';
import MainNavbar from "./MainNavbar.jsx";

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
            <MainNavbar />
            <div className='' style={{fontSize: "10vw", marginTop:"50px"}}>
                LoLSauce
            </div>
            <div className='d-flex flex-column h-100 w-100 align-items-center'>
                <div className="flex-row-column align-self-center align-items-center gap-5 computer-600 h-25" style={{width:"40vw"}}>
                    <Card className={"opaque-grey"} style={{padding:0, width:"100%", minWidth:"180px"}}>
                        <CardBody className='flex-row-column'>
                            <FormGroup className="formulaire w-100 ">
                                <ButtonGroup className="w-100" vertical={size<682}>
                                    <Button className='shadow opaque-light-blue border-info' onClick={() =>handleNavigateToRoom()}>
                                        <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Rejoindre</b>
                                    </Button>
                                    <Input
                                        className='shadow arrondi-gauche opaque-light-blue placeholder-white'
                                        onChange={(e) => {roomId.current = e.target.value}}
                                        type={"number"}
                                        onKeyUpCapture={(e) => e.key === 'Enter' && handleNavigateToRoom()}
                                        placeholder='Code'
                                        invalid={joinRoomError}
                                        min={"0"}
                                    />
                                </ButtonGroup>
                            </FormGroup>
                        </CardBody>
                    </Card>
                    <Card className={"opaque-grey"} style={{padding:0, width:"100%", minWidth:"180px"}}>
                        <CardBody className='flex-row-column'>
                            <FormGroup className="formulaire w-100">
                                <ButtonGroup className="w-100" vertical={size<682}>
                                    <LoadingButton className='shadow shadow opaque-light-blue border-info' onClick={createRoom} forceLoading={roomCreationLoading}>
                                        <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Créer</b>
                                    </LoadingButton>
                                    <Input 
                                        className='shadow arrondi-gauche opaque-light-blue placeholder-white'
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
        <div className="w-100 opaque-dark-blue py-1 px-3" >
            LoLSauce is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
        </div>
        </div>
    </>
    )
}
