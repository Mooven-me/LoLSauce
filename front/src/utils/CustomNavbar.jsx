import {Navbar} from 'reactstrap';

export default function CustomNavbar(props) {
    return (
    <>
    <div className='w-100 bg-info text-black' style={{top:0, left:0}}>
        {props.roomId}
    </div>
    </>
    )
}