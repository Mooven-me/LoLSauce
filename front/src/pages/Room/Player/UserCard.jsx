import React from 'react'
import { Tooltip } from 'reactstrap'

export default function UserCard(props) {
    
    const [tooltipOpen, setTooltipOpen] = React.useState(false)

    return (
        <div className='d-flex gap-2 w-100 p-2' style={{backgroundColor:"darkblue", borderRadius:"0.5rem", fontSize:"1.25rem"}}>
            <i className="bi bi-person-circle" style={{color:(props.user.is_leader?"Khaki  ":"lightblue")}}></i>
            <div className='text-truncate' id={"name_"+props.index}>
                {props.user.username}
            </div>
            <Tooltip
                isOpen={tooltipOpen}
                target={"name_"+props.index}
                toggle={() => setTooltipOpen(!tooltipOpen)}
                placement={"bottom"}
                autohide={false}
            >{props.user.username
            }</Tooltip>
        </div>
    )
}