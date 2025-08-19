import React from 'react'
import { ShowQuestion } from './ShowQuestion'
import CustomInput from '../../../utils/CustomInput'

export default function Questions(props) {

    const [ShowQuestion, setShowQuestion] = React.useState(false);

    const printData = (data) => {
        console.log(data)
    }

    React.useEffect(() => {
        if (!props.data) {  return; }
        switch (props.data.type){
            case "answer":
                setShowQuestion(true)
                break;
        }
    }, [props.data])

    return (
        <>
        {ShowQuestion && 
            <>
                <ShowQuestion
                    question="aled ?"
                    type="image"
                    image="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Gangplank_0.jpg"
                />
                <CustomInput />
            </>
        }
        </>
    )
}