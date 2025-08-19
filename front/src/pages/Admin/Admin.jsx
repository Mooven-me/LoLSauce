import { Button, Col } from "reactstrap";
import { sendData } from "../../utils/utils";
import LoadingButton from "../../utils/LoadingButton";
import React from "react";

export default function Admin(props) {

    const [loading, setLoading] = React.useState()

    const handleDataGeneration = () => {
        setLoading(true)
        sendData({route:'/generateData'}).then((data) => {
            setLoading(false)
            console.log(data)
            console.log("fin du webserv")
        })
    }

    return(
        <Col className="justify-content-center d-flex align-items-center">
            <LoadingButton size='lg' onClick={handleDataGeneration} loading={loading}> générer les données</LoadingButton>
        </Col>
    )
}