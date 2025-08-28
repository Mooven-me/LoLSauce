import { Card, Input } from "reactstrap";
import PixelQuestion from "./PixelQuestion";
import React from "react";
import { sendData } from "../../../../utils/utils";


export default function QuestionDispatcher(props) {

    const [time, setTime] = React.useState(15)
    const [inputValue, setInputValue] = React.useState()

    React.useEffect(() => {
            const interval = setInterval(() => {
                setTime(prevIndex => {
                    return prevIndex -=1;
                });
            }, 1000); 
            
            // Cleanup interval on component unmount
            return () => clearInterval(interval)
        }, []);

    const handleQuestionDispatch = (data) => {
        let result;
        switch(data.type){
            case "spell_image":
            case "passive_image":
            case "skin_image":
                const imageSrc = `data:image/jpeg;base64,${data.content}`;

                result = 
                    <img src={imageSrc} 
                    className="w-100 h-100"
                    style={{
                        borderRadius:"10px",
                        objectFit: "cover",
                        maxHeight: "50vh"
                    }}/>

                break;
            case "pixel_image":
                result = <PixelQuestion content={data.content}/>
                break;
            case "lore":
                result = 
                <div>
                    <div>{data.content}</div>
                </div>
                break;
        }
        return result
    }

    const handleAnswerSending = () => {
        if(inputValue.trim()){
            let data = {
                'user_id': props.userId,
                'word': inputValue.trim()
            }
            setInputValue('')
            sendData({route:'/send_answer', data:data})
        }
    }

    return (
        <>
            <div className="align-content-center h-100">
                {time}s
                <div className="mx-auto" style={{width:"fit-content"}}>
                    <Card className="gap-4 align-items-center" style={{backgroundColor:"rgb(74, 81, 117)", color:"white", fontWeight: "bold"}}>
                        <div className="fs-2">
                            {props.data.title}
                        </div>
                        {handleQuestionDispatch(props.data)}
                    </Card>
                </div>
            </div>
            <div className="my-5 align-self-center" style={{width:"300px"}}>
                <Input 
                    style={{textAlign: 'center'}} 
                    autoFocus 
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value) 
                        console.log(e.target.value)
                    }}
                    onKeyUpCapture={(e) => e.key === 'Enter' && handleAnswerSending()} 
                />
            </div>
        </>
    )
}