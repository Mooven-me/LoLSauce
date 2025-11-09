<?php

namespace App\PusherNotification;

use App\Entity\Questions;
use App\Entity\Room;
use DateInterval;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

#[AsMessageHandler]
class PusherNotificationHandler{
    private EntityManagerInterface $entityManager;
    private MessageBusInterface $bus;
    public function __construct(
        private HubInterface $hub,
        EntityManagerInterface $entityManager, 
        MessageBusInterface $bus
    ){
        $this->bus = $bus;
        $this->entityManager = $entityManager;
    }

    public function __invoke(PusherNotification $pn){

        $roomId = $pn->getRoomId();

        $update = new Update(
            topics: 'https://subrscribed.channel/'.$roomId.'/room',
            data: json_encode($pn->getContent())
        );

        // prepare the next question
        switch($pn->getType()){
            case 'create_question':
                $this->handleCreateQuestion($roomId);
                break;
            case 'show_answer':
                $this->handleShowNotification($roomId);
                break;
        }

        $this->hub->publish($update);
    }

    public function handleShowNotification(int $roomId){

        $room = $this->entityManager->getRepository(Room::class)->findOneById($roomId);
        $answer = $room->getCurrentQuestion()->getAnswer();

        $result = array(
            'type' => 'answer',
            'answer' => $answer,
        );
        
        $this->bus->dispatch(
            new PusherNotification(
                $roomId, 
                $result, 
                'create_question'
                ),
            [new DelayStamp(15000)]
        );
    }

    public function handleCreateQuestion(int $roomId){

        $stopGame = false;
        $room = $this->entityManager->getRepository(Room::class)->findOneById($roomId);

        // to see if the game is finish
        $roomDatePlusOneHour = clone $room->getDate();
        $roomDatePlusOneHour->add(new DateInterval('PT1H')); // PT1H = 1 hour

        // Get current datetime
        $currentDateTime = new DateTime();
        if ($currentDateTime >= $roomDatePlusOneHour) {
            $stopGame = true;
        }

        //check if a user have the max score
        foreach($room->getUsers() as $user){
            if($user->getScore() >= ($room->getSettingByTitle('max_score')?->getValue()??150)){
                $stopGame = true;
            }
        }

        // reset the score system
        $room->removeAllCorrectAnswerUser();

        if($stopGame){
            // generate the end of the game
            $this->entityManager->flush();
            $result = array(
                'type' => 'end',
            );
            
            $this->bus->dispatch(
                new PusherNotification(
                    $roomId, 
                    $result
                    ),
                [new DelayStamp(5000 )]
            );

        }else{

            // generate the new question

            $questionRepository = $this->entityManager->getRepository(Questions::class);

            $question = $questionRepository->findOneRandomEqualy();

            if($question === null){
                throw new Exception("Database empty");
            }

            $room->setCurrentQuestion($question);
            $this->entityManager->flush();

            $result = array(
                'type'  => 'question',
                'question' => $question->toArray()
            );

            // generate the next question
            $this->bus->dispatch(
                new PusherNotification(
                    $roomId, 
                    $result, 
                    'show_answer'
                    ),
                [new DelayStamp(5000 )]
            );
        }
    }
}