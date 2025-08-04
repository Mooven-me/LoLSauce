import React from 'react'
import { ShowQuestion } from './ShowQuestion'
import CustomInput from '../../../utils/CustomInput'

export default function Questions(props) {

    const [ShowQuestionScene, setShowQuestionScene] = React.useState(false);

    const printData = (data) => {
        console.log(data)
    }

    React.useEffect(() => {
        console.log(props.data)
        if (!props.data) {  return; }
        switch (props.data.type){
            case "start":
                setShowQuestionScene(true)
                printData(props.data)
                break;
            default:
                printData(props.data)
                break;
        }
    }, [props.data])

    return (
        <>
        {ShowQuestionScene && 
            <ShowQuestion
                question="aled ?"
                type="image"
                image="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Gangplank_0.jpg"
            />
            
        }
        <CustomInput />
        </>
    )
}