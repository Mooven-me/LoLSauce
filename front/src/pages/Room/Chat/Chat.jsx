import React from 'react'
import { Input } from 'reactstrap'
import { sendData } from '../../../utils/utils'
import ChatCard from './ChatCard';

export default function Chat(props) {

  const [inputMessage, setInputMessage] = React.useState();

  const handleMessageSend = () => {
    if(inputMessage.length > 0){
      sendData({route: '/sendMessage', method: "POST", data: {"user_id": props.userId, "message":inputMessage}})
    }
    setInputMessage('')
  }

  const handleRender = () => {
    console.log(props.users)
    const messagesCopy = [...props.messages]
    return messagesCopy.reverse().map((elem) => {
      return <ChatCard 
        message={elem.message} 
        isOwner={elem.user_id==props.userId} 
        user={props.users.find((user) => user.user_id===elem.user_id)}
      />
    })
  }

  return (
    <div
      className='d-flex flex-column'
      style={{
        backgroundColor: "rgba(34, 37, 61, 1)",
        width:"25vw",
        border: "2px solid #444"
      }}
    >
      <div
        className='d-flex flex-column gap-1'
        style={{fontSize: "50px"}}
      >
        LoLChat
      </div>
      
      <div
        className='d-flex gap-1'
        style={{
          flex: 1,
          overflowY: "auto",
          borderTop: "1px solid #444",
          flexDirection: "column-reverse"
        }}
      >
        {handleRender()}
      </div>

      <div style={{ padding: "10px", borderTop: "1px solid #444"}}>
        <Input 
          placeholder="chat"
          value={inputMessage}
          onKeyUpCapture={(e) => e.key === 'Enter' && handleMessageSend()} 
          onChange={(e) => { setInputMessage(e.target.value)}}
        />
      </div>
    </div>
  )
}
