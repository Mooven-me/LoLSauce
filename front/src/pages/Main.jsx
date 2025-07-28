import React from 'react';
import { Button, Card, CardBody, FormFeedback, FormGroup, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { sendData } from '../utils/utils';

export default function Main(props) {
    const navigate = useNavigate();
    const [usernameError, setUsernameError] = React.useState(false);

    //permet quand quand on est dans une game et qu'on fait retour, le RoomId est vidé
    React.useEffect(() =>{
        props.setRoomId(() => null)
    },[])
    
    const createRoom = () => {
        if(!props.username || props.username.trim() === ""){
            setUsernameError(true);
            return;
        } else {
            setUsernameError(false);
            sendData({route: '/create_room', method: "POST", data: {"username": props.username}}).then((data) => {
                console.log(data)
                navigate('/'+data.room_id)
                props.setUserId(data.user_id)
                props.setRoomId(data.room_id)
                props.setIsLeader(true)
            })
        }
    }

    const handleUsernameChange = (e) => {
        props.setUsername(() => e.target.value);
        if(usernameError && e.target.value.trim() !== "") {
            setUsernameError(false);
        }
    }
    
    return (
    <>
        <div className='d-flex flex-column h-100 align-items-center'>
            <div className='' style={{fontSize: "10vw", marginTop:"50px"}}>
                LoLSauce
            </div>
            <div className='d-flex flex-column h-100 w-100 align-items-center'>
                <FormGroup>
                    <Input 
                        style={{width:"160px", marginTop:"100px"}} 
                        placeholder='Pseudo' 
                        onChange={handleUsernameChange}
                        invalid={usernameError}
                    />
                    <FormFeedback>
                        Requis
                    </FormFeedback>
                </FormGroup>
                <div className="flex-row-column align-self-center align-items-center gap-5 computer-600 h-25" style={{width:"40vw"}}>
                    <Card style={{padding:0, backgroundColor:"rgb(107, 114, 150)", width:"100%", minWidth:"180px"}}>
                        <CardBody className='flex-row-column'>
                            <Button color="info" className='shadow-sm border-0 arrondi-droit' onClick={createRoom}>
                                <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Rejoindre</b>
                            </Button>
                            <Input 
                                className='shadow-sm arrondi-gauche'
                                onChange={(e) => props.setRoomCode(() => e.target.value)}
                                onKeyUpCapture={(e) => e.key === 'Enter' && createRoom()} 
                                placeholder='Code de la salle'
                            />
                        </CardBody>
                    </Card>
                    <Card style={{padding:0, backgroundColor:"rgb(107, 114, 150)", width:"100%", minWidth:"180px"}}>
                        <CardBody>
                            <div className='d-flex flex-column align-items-center'>
                                <Button color="info" className='shadow-sm border-0' onClick={createRoom}>
                                    <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Créer une partie</b>
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    </>
    )
}
