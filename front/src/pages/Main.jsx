import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Input } from 'reactstrap';
import RealtimeChatApp from './RealtimeChatApp';

export default function Main(params) {
    const [roomCode, setRoomCode] = useState('');
    
    const createRoom = () => {
        console.log(roomCode);
        // Utiliser roomCode pour la logique de création de salle
    }
    
    return (
    <>
        <div className='d-flex flex-column'>
            <div className='position-absolute translate-middle' style={{top:"18vh", left:"50%",fontSize: "10vw"}}>
                LoLSauce
            </div>
            <div className="flex-row-column justify-content-around align-items-center gap-5" style={{width:"90vw"}}>
                <Card style={{padding:0, backgroundColor:"rgb(107, 114, 150)", width:"35%", minWidth:"180px"}}>
                    <CardBody className='flex-row-column'>
                        <Button color="info" className='shadow-sm border-0 arrondi-droit' onClick={createRoom}>
                            <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Rejoindre</b>
                        </Button>
                        <Input 
                            className='shadow-sm arrondi-gauche' 
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            onKeyUpCapture={(e) => e.key === 'Enter' && createRoom()} 
                            placeholder='Code de la salle'
                        />
                    </CardBody>
                </Card>
                <Card style={{padding:0, backgroundColor:"rgb(107, 114, 150)", width:"35%", minWidth:"180px"}}>
                    <CardBody>
                        <Button color="info" className='shadow-sm border-0'>
                            <b style={{color:"rgb(255, 255, 255)", textWrap:"nowrap"}}>Créer une partie</b>
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div>
    </>
    )
}