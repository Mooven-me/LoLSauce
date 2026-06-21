import { useDispatch, useSelector } from "react-redux";
import {
    Input,
    Modal,
    Button,
    Form,
    Card, CardHeader, CardBody, InputGroup, Spinner
} from "reactstrap";
import { setAuth } from "../../store/authSlice";
import React from "react";
import {setIsLeader, setRoomId, setUsers} from "../../store/roomSlice";
import { sendData } from "../../utils/utils";
import { useParams } from "react-router-dom";
import { start } from "../../store/gameSlice";
import JoinBackAlert from "../../utils/JoinBackAlert.jsx";

export default function JoinModal() {

    const params = useParams()
    const dispatch = useDispatch()
    const isLeader = useSelector(state => state.room.isLeader)
    const [showModal, setShowModal] = React.useState(!isLeader)
    const [usernameError, setUsernameError] = React.useState(false)
    const usernameRef = React.useRef("")

    const handleUsernameChange = (e) => {
        usernameRef.current = e.target.value;
        if (usernameError && e.target.value.trim() !== "") {
            setUsernameError(false);
        }
    }

    const handleJoinGame = () => {
        sendData({ route: "/join", data: { username: usernameRef.current ?? null, room_id: params.room_id } }).then(data => {
            setShowModal(false);
            dispatch(setUsers(data.users))
            dispatch(setRoomId(data.room_id))
            dispatch(setAuth({userId: data.user_id, username: data.username}))
            dispatch(setIsLeader(data.is_leader))
            if(data.gameStarted){
                dispatch(start())
            }
        })
    }

    const handleSubmitAnswer = (e = null) => {
        if(e){
            e.preventDefault();
        }
        if(!usernameError){
            handleJoinGame()
        }
    }

    React.useEffect(() => {
        if(window.ROOM_ID == params.room_id){
            handleJoinGame()
        }
    }, [params.room_id])

    return (
            window.ROOM_ID != params.room_id ?
                <Modal isOpen={showModal} centered fade backdrop>
                    <Card color={"dark"} className={"p-0 bg-opacity-50"}>
                        <Form onSubmit={handleSubmitAnswer}>
                            <CardHeader>Choisissez votre pseudo</CardHeader>
                            <CardBody className={"vstack gap-3"}>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        placeholder="Pseudo"
                                        onChange={handleUsernameChange}
                                        invalid={usernameError}
                                        required
                                        maxLength={15}
                                    />
                                    <Button color="info" outline type="submit">
                                        Confirmer
                                    </Button>
                                </InputGroup>
                                <JoinBackAlert />
                            </CardBody>
                        </Form>
                    </Card>
                </Modal>
                :
                <Modal backdrop fade centered isOpen={showModal} className={"border-0"}>
                    <Spinner className={"mx-auto"}/>
                </Modal>

    )
}