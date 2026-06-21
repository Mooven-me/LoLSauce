import QuestionDispatcher from './Questions/QuestionDispatcher';
import { Card } from 'reactstrap';
import { useSelector } from 'react-redux';
import Confetti from 'react-confetti';
import crownImage from '../../../assets/crown.png';
import LoadingButton from '../../../utils/LoadingButton';
import { sendData } from '../../../utils/utils';

export default function MiddleScene() {

    const users = useSelector((state) => state.room.users);
    const questionData = useSelector((state) => state.game.questionData)

    const handleRestartGame = async () => {
        await sendData({ route: '/start', method: "POST" })
    }

    const handleRenderScene = () => {
        let result
        switch(questionData.type){
            case 'question':
                result = <QuestionDispatcher data={questionData.question} />
                break;
            case 'answer':
                result = 
                <div className="align-content-center h-100 mx-2">
                    <div className="mx-auto" style={{width:"fit-content"}}>
                        <Card className="gap-4 align-items-center opaque-dark-blue border border-secondary" style={{backgroundColor:"rgb(74, 81, 117)", color:"white", fontWeight: "bold"}}>
                            <div className="fs-2">
                                {questionData.answer}
                            </div>
                        </Card>
                    </div>
                </div>
                break;
            case "end":

                { const winnerUser = users.reduce((maxUser, currentUser) => {
                    if (currentUser.score > maxUser.score) {
                        return currentUser;
                    } else {
                        return maxUser;
                    }
                });

                result =
                <div className='d-flex flex-column justify-content-center align-items-center gap-5'>
                    <Confetti numberOfPieces={200} />
                    <div className='position-relative'>
                        <img src={crownImage} className='position-absolute translate-middle' style={{width:"75%", top:"-15px"}} alt={'crown'}/>
                        <div className='card opaque-dark-blue border-grey text-light' style={{width:"fit-content"}}>
                            <i className="bi bi-person-circle fs-1" style={{color:(winnerUser.is_leader?"Khaki":"lightblue")}}></i>
                            {winnerUser.username}
                        </div>
                    </div>
                    <LoadingButton className={"opaque-dark-blue"} onClick={handleRestartGame}>Relancer</LoadingButton>
                </div>
                break; }
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