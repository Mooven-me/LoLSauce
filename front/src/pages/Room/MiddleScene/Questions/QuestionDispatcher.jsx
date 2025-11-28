import { Card, Input } from "reactstrap";
import PixelQuestion from "./PixelQuestion";
import React from "react";
import { sendData } from "../../../../utils/utils";
import { useSelector } from "react-redux";


export default function QuestionDispatcher(props) {

    const [time, setTime] = React.useState(15)
    const [inputValue, setInputValue] = React.useState()
    const foundAnswer  = useSelector((state) => state.game.foundAnswer)
    const userId  = useSelector((state) => state.auth.userId)

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(prevIndex => {
                return prevIndex-1;
            });
        }, 1000); 
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval)
    }, []);

    const handleQuestionDispatch = React.useMemo(() => {
        let result;
        let data = props.data
        switch(data.type){
            case "item_image":
            case "spell_image":
            case "passive_image":
            case "skin_image": {
                const imageSrc = `data:image/jpeg;base64,${data.content}`;

                result =
                    <img
                        alt={"image"}
                        src={imageSrc}
                        // 1. Remove "h-100" so height isn't forced
                        // 2. Use "img-fluid" (Bootstrap) or just max-width: 100%
                        className="w-100"
                        style={{
                            borderRadius: "10px",
                            // 3. CHANGE "cover" to "contain"
                            objectFit: "contain",
                            maxHeight: "50vh",
                            // 4. Ensure the height adjusts automatically
                            height: "auto"
                        }}
                    />

                break;
            }
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
    },[props.data])

    const handleAnswerSending = () => {
        if(inputValue.trim()){
            let data = {
                'user_id': userId,
                'word': inputValue.trim()
            }
            setInputValue('')
            sendData({route:'/send_answer', data:data})
        }
    }

    return (
        <>
            <div className="align-content-center h-100 mx-2">
                {time}s
                <div className="mx-auto" style={{width:"fit-content"}}>
                    <Card className="gap-4 align-items-center opaque-dark-blue border border-secondary" style={{backgroundColor:"rgb(74, 81, 117)", color:"white", fontWeight: "bold"}}>
                        <div className="fs-2">
                            {props.data.title}
                        </div>
                        {handleQuestionDispatch}
                    </Card>
                </div>
            </div>
            <div className="my-5 align-self-center" style={{width:"300px"}}>
                {!foundAnswer &&
                    <Input
                        className={"opaque-dark-blue text-white"}
                        style={{textAlign: 'center'}} 
                        autoFocus 
                        value={inputValue}
                        onChange={(e) => {setInputValue(e.target.value)}}
                        onKeyUpCapture={(e) => e.key === 'Enter' && handleAnswerSending()} 
                    />
                }
            </div>
        </>
    )
}