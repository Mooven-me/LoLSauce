import React from 'react'
import { Input } from 'reactstrap'
import { sendData } from '../../../utils/utils'
import ChatCard from './ChatCard';
import { useSelector } from 'react-redux';

export default function Chat(props) {

  const [inputMessage, setInputMessage] = React.useState("")
  const messages = useSelector(state => state.chat.messages)
  const userId = useSelector(state => state.auth.userId)
  const users = useSelector(state => state.room.users)

  const handleMessageSend = () => {
    if(inputMessage.length > 0){
      sendData({route: '/sendMessage', method: "POST", data: {"user_id": userId, "message":inputMessage}})
    }
    setInputMessage('')
  }

const renderMessages = React.useMemo(() => {
  let messagesCopy = [...messages]
    return messagesCopy.reverse().map((messageElem) => {
      return <ChatCard 
        key={messageElem.id}
        message={messageElem.message} 
        isOwner={messageElem.user_id===userId} 
        user={users.find((user) => user.user_id===messageElem.user_id)}
      />
    })
  }, [messages, userId, users]);

  return (
    <div
      className='d-flex flex-column border border-start-0 rounded-end-3 border-secondary my-3 me-3'
      style={{
        minWidth:"150px",
        backgroundColor: "rgba(34, 37, 61, 0.8)",
        width:"25vw",
        border: "2px solid #444"
      }}
    >
      <div
        className='d-flex gap-1'
        style={{
          flex: 1,
          overflowY: "auto",
          flexDirection: "column-reverse"
        }}
      >
        {renderMessages}
      </div>
      <div style={{ padding: "10px", borderTop: "1px solid #444"}}>
        <Input
          className='opaque-dark-blue text-white placeholder-white'
          placeholder="chat"
          value={inputMessage}
          onKeyUpCapture={(e) => e.key === 'Enter' && handleMessageSend()} 
          onChange={e => setInputMessage(e.target.value)}
        />
      </div>
    </div>
  )
}
