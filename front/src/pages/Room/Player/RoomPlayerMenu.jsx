import React from 'react';
import UserCard from './UserCard';

export function RoomPlayerMenu(props) {

    const handleRenderUsers = () => {
        return props.users.map((user, index) => (
            <UserCard key={index} index={index} user={user}/>
        ))
    }

    return (
        <div className="d-flex flex-column align-items-start gap-2 p-1" style={{backgroundColor:"rgb(41, 45, 70)", width:"20vw", minWidth:"100px"}}>
            {handleRenderUsers()}
        </div>
    )
}