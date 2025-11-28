import React from "react";
import Clipboard from "react-clipboard-animation/lib/clipboard.js";

export default function CustomNavbar(props) {

    const [copied, setCopied] = React.useState(false)

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (copied) setCopied(false)
        }, 500)

        return () => clearTimeout(timeout)
    }, [copied])

    return (
        <>
            <div className='w-100 bg-info bg-opacity-25 code-highlight d-flex flex-row gap-2 justify-content-center' style={{color:"rgb(201, 201, 201)"}}>
                <div>
                    {props.roomId}
                </div>
                <Clipboard
                    copied={copied}
                    setCopied={setCopied}
                    text={props.roomId}
                    color='rgb(201, 201, 201)'
                />
            </div>
        </>
    )
}