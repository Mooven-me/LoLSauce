import { useDispatch, useSelector } from "react-redux";
import { FormFeedback, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Button, Form } from "reactstrap";
import { setAuth, setUserId, setUsername } from "../../store/authSlice";
import React from "react";
import { setRoomId, setUsers } from "../../store/roomSlice";
import { sendData } from "../../utils/utils";
import { useParams } from "react-router-dom";
import { start } from "../../store/gameSlice";

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

    const handleSubmitAnswer = (e) => {
        e.preventDefault();
        if(!usernameError){
            sendData({ route: "/join", data: { username: usernameRef.current, room_id: params.room_id } }).then(data => {
                setShowModal(false);
                dispatch(setUsers(data.users))
                dispatch(setUsername(usernameRef.current))
                dispatch(setAuth({userId: data.user_id, username: data.username}))
                dispatch(setRoomId(data.room_id))
                if(data.gameStarted){
                    dispatch(start())
                }
            })
        }
    }

    return (
        <Modal isOpen={showModal} centered fade backdrop className="modal-grey">
            <Form onSubmit={handleSubmitAnswer}>
                <ModalHeader>Choisissez votre pseudo</ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        placeholder="Pseudo"
                        onChange={handleUsernameChange}
                        invalid={usernameError}
                        required
                        maxLength={15}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="info" className="text-white" type="submit">
                        Confirmer
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}