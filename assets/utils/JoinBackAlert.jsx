import {Button, UncontrolledAlert} from "reactstrap";
import React from "react";
import {useNavigate} from "react-router-dom";
import {sendData} from "./utils.jsx";
import LoadingButton from "./LoadingButton.jsx";

export default function JoinBackAlert({leavable = false}) {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = React.useState(false)

    const handleJoinBackRoom = () => {
        navigate('/'+window.ROOM_ID)
    }

    const handleLeaveRoom = () => {
        return sendData({ route: "/disconnect"}).then(() => {
            window.ROOM_ID = null;
            setShowAlert(false);
        })
    }

    React.useEffect(() => {
        if(window.ROOM_ID){
            setShowAlert(true);
        }
    }, [])

    return (
        showAlert &&
        <UncontrolledAlert className={"mx-auto"} color={'success'} >
            <div className="vstack gap-2">
                <div>
                    Vous êtes actuellement dans une autre partie{!leavable && ", voulez vous la rejoindre ?"}
                </div>
                <div className="hstack gap-3">
                    <Button color={"success"} className={"mx-auto"} outline onClick={handleJoinBackRoom}>
                        Rejoindre
                    </Button>
                    {leavable &&
                        <LoadingButton onClick={handleLeaveRoom} color={"warning"} outline className={"mx-auto"}>
                            Quitter
                        </LoadingButton>
                    }
                </div>
            </div>
        </UncontrolledAlert>
    )
}