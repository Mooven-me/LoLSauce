import {Badge, Button} from "reactstrap";
import React from "react";
import {useNavigate} from "react-router-dom";

export default function MainNavbar(){
    const navigate = useNavigate();

    return (
        <div className='w-100 py-2 align-items-center bg-info bg-opacity-25 border-bottom d-flex gap-2 pe-2 justify-content-end border-primary'>
            {window.IS_LOGGED_IN ?
                <>
                    <Badge className={"bg-success bg-opacity-50"}>connecté</Badge>
                    <Button className='shadow opaque-dark-blue' onClick={() => navigate('/account')}>Compte</Button>
                </>
            :
            <>
                <Button className='shadow opaque-dark-blue' onClick={() => navigate('/register')}>Inscription</Button>
                <Button className='shadow opaque-dark-blue' onClick={() => navigate('/login')}>Connexion</Button>
            </>
            }
        </div>
    )
}