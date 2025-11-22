import React from 'react';
import UserCard from './UserCard';
import { useSelector } from 'react-redux';
import pentaKillMP3 from '../../../assets/sounds/Killstreak_SFX_Multikill_Melody_Penta.mp3';
import firstKillMP3 from '../../../assets/sounds/Killstreak_SFX_Multikill_Point_First.mp3';

export function RoomPlayerMenu(props) {

    const users = useSelector(state => state.room.users)
    const userId = useSelector(state => state.auth.userId)
    const [alreadyPlayedUsersAudio, setAlreadyPlayedUsersAudio] = React.useState([])

    const isNewQuestion = () => {
        let result = true
        users.map((user) => {
            if(user.success){
                result = false
            }
        })
        return result
    }

    const handleRenderUsers = React.useMemo(() => {
        let usersCopy = [...users]
        usersCopy.sort(function(x,y){
            if(x.score >= y.score){
                return -1
            }else{
                return 1
            }
        })
        if(isNewQuestion()){
            setAlreadyPlayedUsersAudio([])
        }
        return usersCopy.map((user, index) => {
            if(user.success && userId === user.user_id && alreadyPlayedUsersAudio.length === 0){
                let audio = new Audio(pentaKillMP3);
                audio.play();!alreadyPlayedUsersAudio.includes(user.user_id)
            }
            if(user.success && !alreadyPlayedUsersAudio.includes(user.user_id)){
                let audio = new Audio(firstKillMP3);
                audio.play();
                setAlreadyPlayedUsersAudio([...alreadyPlayedUsersAudio, user.user_id])
            }
            return <UserCard key={index} index={index} user={user} isCurrentUser={userId === user.user_id}/>
        })
    },[users])

    return (
        <div className="d-flex flex-column align-items-start gap-2 p-1 overflow-y-scroll overflow-x-hidden h-100" style={{backgroundColor:"rgba(41, 45, 70, 0.8)", width:"30vw", minWidth:"150px", maxWidth:"300px"}}>
            {handleRenderUsers}
        </div>
    )
}