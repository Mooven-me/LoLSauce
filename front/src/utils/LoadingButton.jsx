import React from 'react';
import { Button, Fade, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';

function LoadingButton({
    loadingColor = 'primary',
    ...props    
}) {
    
    const handleOnClick = () => {
        if(!props.loading){
            props.onClick()
        }
    }

    return (
        <Button {...props} onClick={handleOnClick} className='d-flex gap-2' disabled={props.loading}>
            {!props.loading?
            <Fade appear={false} in={!props.loading}>
                {props.children}
            </Fade>
            :
            <Fade in={props.loading} >
                <Spinner color={loadingColor} size={'sm'}/>
            </Fade>
        }
        </Button>
    )
}

LoadingButton.propTypes = {
    loadingColor: PropTypes.string,
    onClick: PropTypes.func,
    loading: PropTypes.bool
}

export default LoadingButton