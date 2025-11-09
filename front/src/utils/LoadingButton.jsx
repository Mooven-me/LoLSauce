import { Button, Fade, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import React from 'react';

function LoadingButton({
    loadingColor = 'primary',
    className = '',
    forceLoading = false,
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

    return (
        <Button {...props} onClick={handleOnClick} className={newClassName} disabled={loading || forceLoading}>
            {(!loading && !forceLoading)?
            <Fade appear={false} in={!loading && !forceLoading}>
                {props.children}
            </Fade>
            :
            <Fade in={loading || forceLoading} >
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
    forceLoading: PropTypes.bool
}

export default LoadingButton