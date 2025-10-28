import React from 'react';
import UserCard from './UserCard';

export function RoomPlayerMenu(props) {

    const handleRenderUsers = () => {
        props.users.sort(function(x,y){
            if(x.score >= y.score){
                return -1
            }else{
                return 1
            }
        })
        return props.users.map((user, index) => (
            <UserCard key={index} index={index} user={user}/>
        ))
    }

    return (
        <div className="d-flex flex-column align-items-start gap-2 p-1" style={{backgroundColor:"rgb(41, 45, 70)", width:"30vw", minWidth:"100px", maxWidth:"300px"}}>
            {handleRenderUsers()}
        </div>
    )
}