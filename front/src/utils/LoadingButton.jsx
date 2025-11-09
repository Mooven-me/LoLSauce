import { Button, Fade, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import React from 'react';

function LoadingButton({
    loadingColor = 'primary',
    className = '',
    ...props    
}) {

    const [loading, setLoading] = React.useState(false)
    
    const handleOnClick = () => {
        setLoading(true)
        if(!loading){
            props.onClick().finally(() => setLoading(false))
        }
    }

    const newClassName = className + " d-flex gap-2"

    console.log(newClassName)

    return (
        <Button {...props} onClick={handleOnClick} className={newClassName} disabled={loading}>
            {!loading?
            <Fade appear={false} in={!loading}>
                {props.children}
            </Fade>
            :
            <Fade in={loading} >
                <Spinner color={loadingColor} size={'sm'}/>
            </Fade>
        }
        </Button>
    )
}

LoadingButton.propTypes = {
    loadingColor: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
}

export default LoadingButton