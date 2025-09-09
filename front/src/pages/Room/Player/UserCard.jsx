import React from 'react'
import { Tooltip } from 'reactstrap'

export default function UserCard(props) {
    
    const [tooltipOpen, setTooltipOpen] = React.useState(false)

    return (
        <div className='d-flex d-flex gap-2 w-100 p-2 position-relative' style={{
                backgroundColor: (props.user.success?"#0000e2ff":"darkblue"), 
                borderRadius:"0.5rem", 
                fontSize:"1.85em",
                borderStyle: "solid",
                borderColor: (props.user.success?"#0099ffcb":"#212c4ecb"),
            }}>
            <div className='position-absolute' style={{top:"1.90em", fontSize:"1rem", backgroundColor:"black", borderRadius:"0.1rem", lineHeight:"1", paddingInline:"2px"}}>{props.user.score}</div>
            <i className="bi bi-person-circle" style={{color:(props.user.is_leader?"Khaki":"lightblue")}}></i>
            <div className='text-start w-100'>
                <div className='text-truncate w-100' id={"name_"+props.index} style={{fontSize:"0.55em",fontWeight:"800"}}>
                    {props.user.username}
                </div>
                <div style={{fontSize:"0.55em", fontStyle:"italic"}}>
                    {props.user.time}
                </div>
                <div style={{fontSize:"0.55em", fontStyle:"oblique"}}>
                    {props.user.word}
                </div>
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