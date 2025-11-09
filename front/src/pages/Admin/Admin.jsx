import { Col } from "reactstrap";
import { sendData } from "../../utils/utils";
import LoadingButton from "../../utils/LoadingButton";

export default function Admin(props) {

    const handleDataGeneration = async () => {
        await sendData({route:'/generateData'}).then((data) => {
            console.log(data)
            console.log("fin du webserv")
        })
    }

    return(
        <Col className="justify-content-center d-flex align-items-center h-100">
            <LoadingButton size='lg' onClick={handleDataGeneration}> générer les données</LoadingButton>
        </Col>
    )
}