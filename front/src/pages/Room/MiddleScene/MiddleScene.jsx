import React from 'react'
import QuestionDispatcher from './Questions/QuestionDispatcher';
import { Card } from 'reactstrap';

export default function MiddleScene(props) {

    const [data, setData] = React.useState(false);

    React.useEffect(() => {
        setData(props.data);
    }, [props.data])

    const handleRenderScene = () => {
        let result
        switch(data.type){
            case 'question':
                console.log("%MiddleSCene : handleRenderScene")
                result = <QuestionDispatcher {...props} data={data.question} />
                break;
            case 'answer':
                result = 
                <div className="align-content-center h-100">
                    <div className="mx-auto" style={{width:"fit-content"}}>
                        <Card className="gap-4 align-items-center" style={{backgroundColor:"rgb(74, 81, 117)", color:"white", fontWeight: "bold"}}>
                            <div className="fs-2">
                                {data.answer}
                            </div>
                        </Card>
                    </div>
                </div>
                break;
        }
        return result
    }

    return (
        handleRenderScene(props.data)
    )
}