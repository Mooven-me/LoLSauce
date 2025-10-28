import PropTypes from 'prop-types';

function ChatCard(props) {
    return (
    <div className='w-100 d-flex gap-2 px-2' style={props.isOwner ? {backgroundColor: "rgb(41, 45, 70)"}: {}}>
        <div className='d-flex flex-column'>
            <div className='d-flex flex-row gap-2'>
                <i className="bi bi-person-circle" style={{color:(props.user.is_leader?"Khaki":"lightblue")}}/>
                <i style={{color:"rgba(149, 151, 164, 1)"}}>{props.user.username}</i>
            </div>
            <div style={{fontSize:"18px", textAlign:"left"}}>{props.message}</div>
        </div>
    </div>
    )
}

ChatCard.propTypes = {
    message: PropTypes.string,
    isOwner: PropTypes.bool,
    user: PropTypes.object,
}

export default ChatCard