import React from 'react'
import QuestionDispatcher from './Questions/QuestionDispatcher';
import { Card } from 'reactstrap';
import { useSelector } from 'react-redux';

export default function MiddleScene(props) {

    const questionData  = useSelector((state) => state.game.questionData)

    const handleRenderScene = () => {
        let result
        switch(questionData.type){
            case 'question':
                console.log("%MiddleSCene : handleRenderScene")
                result = <QuestionDispatcher data={questionData.question} />
                break;
            case 'answer':
                result = 
                <div className="align-content-center h-100">
                    <div className="mx-auto" style={{width:"fit-content"}}>
                        <Card className="gap-4 align-items-center" style={{backgroundColor:"rgb(74, 81, 117)", color:"white", fontWeight: "bold"}}>
                            <div className="fs-2">
                                {questionData.answer}
                            </div>
                        </Card>
                    </div>
                </div>
                break;
            default:
                result = 
                <em>
                    ça arrive ...
                </em>
                break;
        }
        return result
    }

    return (
        handleRenderScene()
    )
}