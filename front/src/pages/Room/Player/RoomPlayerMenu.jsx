import React from 'react';
import UserCard from './UserCard';
import { useSelector } from 'react-redux';

export function RoomPlayerMenu(props) {

    const users = useSelector(state => state.room.users)
    const userId = useSelector(state => state.auth.userId)

    const handleRenderUsers = () => {
        let usersCopy = [...users]
        usersCopy.sort(function(x,y){
            if(x.score >= y.score){
                return -1
            }else{
                return 1
            }
        })
        return usersCopy.map((user, index) => (
            <UserCard key={index} index={index} user={user} isCurrentUser={userId === user.user_id}/>
        ))
    }

    return (
        <div className="d-flex flex-column align-items-start gap-2 p-1 overflow-y-scroll overflow-x-hidden h-100" style={{backgroundColor:"rgb(41, 45, 70)", width:"30vw", minWidth:"150px", maxWidth:"300px"}}>
            {handleRenderUsers()}
        </div>
    )
}