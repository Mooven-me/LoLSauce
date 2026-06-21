import {Button, Offcanvas, OffcanvasBody, OffcanvasHeader} from "reactstrap";
import React from "react";

export default function Settings(){

    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(!isOpen)} className={"position-absolute opaque-dark-blue"} style={{top:"20px", left:"20px"}}><i className="bi bi-gear"></i></Button>
            <Offcanvas isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} className="opaque-dark-blue text-white">
                <OffcanvasHeader toggle={() => setIsOpen(!isOpen)}>
                    Options
                </OffcanvasHeader>
                <OffcanvasBody>
                    bonjour
                </OffcanvasBody>
            </Offcanvas>
        </>
    )
}