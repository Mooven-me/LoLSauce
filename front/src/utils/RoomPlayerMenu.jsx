import React from 'react';

export function RoomPlayerMenu(props) {

const handleRenderUsers = () => {
        return props.users.map((user, index) => (
            <div key={index}>
                {user.username}
            </div>
        ))
}

    return (
        <div className="d-flex flex-column" style={{backgroundColor:"rgb(41, 45, 70)", width:"80px"}}>
            {handleRenderUsers()}
        </div>
    )
}