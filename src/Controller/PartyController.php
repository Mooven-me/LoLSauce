<?php

namespace App\Controller;

use App\Entity\Room;
use App\Entity\User;
use App\PusherNotification\PusherNotification;
use App\PusherNotification\PusherNotificationHandler;
use App\Repository\RoomRepository;
use App\Service\Room\RoomUtilManager;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
final class PartyController extends AbstractController
{
    private HubInterface $hub;
    private MessageBusInterface $bus;

    public function __construct(
        EntityManagerInterface $em,
        HubInterface $hub,
        MessageBusInterface $bus
    ){
        $this->hub = $hub;
        $this->bus = $bus;
    }

    #[Route('/create_room', name: 'app_party')]
    public function createRoom(Request $request, EntityManagerInterface $em, RoomUtilManager $roomUtilManager): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        $username = $data["username"]??null;

        if(empty($username)){
            new JsonResponse(['error' => 1, 'error_message' => 'no username provided'], 400);
        }

        $roomUtilManager->removeUserFromRoom($user);

        $user->setUsername($username);

        // create the room
        $room = $roomUtilManager->createRoom($user);

        $result['data'] = array(
            'room_id' => $room->getId(),
            'user_id' => $user->getId(),
        );
        return new JsonResponse($result, 200);
    }

    #[Route('/send_answer', name: 'send_answer', methods: ['POST'])]
    public function sendAnswer(Request $request, EntityManagerInterface $em, HubInterface $hub) : JsonResponse{
        /** @var User $user */
        $user = $this->getUser();

        if(!$user){
            return $this->json(['error' => 'User not authenticated'],Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $word = $data['word']??null;

        if(!$word){
            return new JsonResponse(['error' => '1',  'error_message' => 'word is required'], 400);
        }

        $room = $user->getRoom();
        $roomId = $room->getId();
        $question = $room->getCurrentQuestion();

        if(in_array($this->toUpperWithoutAccents($word), $question->getAnswers())){ //check si la réponse est bonne
            $foundedAnswersCount = count($room->getCorrrectAnswerUsers());
            if($foundedAnswersCount >= 10){
                $foundedAnswersCount = 9;
            }

            $score = 10 - $foundedAnswersCount;

            $user->setScore($user->getScore() + $score);
            $room->addCorrectAnswerUser($user);
            $em->flush();

            $allUsersFound = count($room->getCorrrectAnswerUsers()) === count($room->getUsers()) && count($room->getCorrrectAnswerUsers()) > 0;

            if($allUsersFound){
                $answer = $question->getAnswer('fr_FR');

                $result = [
                    'type' => 'answer',
                    'answer' => $answer,
                    'question_id' => $question->getId()
                ];

                $this->bus->dispatch(
                    new PusherNotification(
                        $roomId,
                        $result,
                        'create_question'
                    )
                );
            }

            $currentDate = new DateTime();

            $update = new Update(
                'https://subscribed.channel/'.$roomId.'/room',
                json_encode([
                    'type' => 'success',
                    'user_id' => $user->getId(),
                    'time' => $currentDate->diff($room->getQuestionDate()),
                    'score' => $user->getScore(),
                ])
            );
        }else{
            $update = new Update(
            topics: 'https://subscribed.channel/'.$roomId.'/room',
            data: json_encode([
                    'type' => 'try',
                    'user_id' => $user->getId(),
                    'word'  => $word
                ])
            );
        }
        $hub->publish($update);

        return new JsonResponse(array('error' => 0), 200);
    }

    function toUpperWithoutAccents($string) {
        $string = iconv('UTF-8', 'ASCII//TRANSLIT', $string);
        return strtoupper($string);
    }

    #[Route('/start', name: 'start', methods: ['POST'])]
    public function startRoom(Request $request, PusherNotificationHandler $pusherNotificationHandler) : Response{
        /** @var User $user */
        $user = $this->getUser();
        $room = $user->getRoom();
        $roomId = $room->getId();

        // reset the game in case some users have still some points
        foreach($room->getUsers() as $user){
            $user->setScore(0);
        }

        // wait a little bit to start the game
        $pusherNotificationHandler->handleCreateQuestion($roomId);

        $update = new Update(
            topics: 'https://subscribed.channel/'.$roomId.'/room',
            data: json_encode(['type' => 'start'])
        );
        $this->hub->publish($update);

        return new JsonResponse(array('error' => 0), 200);
    }

    #[Route('/join', name: 'join', methods: ['POST'])]
    public function joinRoom(Request $request, RoomUtilManager $roomUtilManager, RoomRepository $roomRepository) : JsonResponse{
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        $username = $data['username']??null;
        $room_id = $data['room_id']??null;

        // if the user is not already in a room
        if(!$user->getRoom() || $user->getRoom()->getId() != $room_id){
            if(!$username){
                return new JsonResponse(['error' => '1',  'error_message' => 'username is required'], 400);
            }
            if(!$room_id){
                return new JsonResponse(['error' => '1',  'error_message' => 'room_id is required'], 400);
            }
            $room = $roomRepository->findOneById($room_id);
            if(empty($room)){
                return new JsonResponse(['error' => '1',  'error_message' => 'invalid room_id'], 400);
            }
            $user->setUsername($username);
            $roomUtilManager->joinRoom($user, $room);
        }else{
            $room = $user->getRoom();
        }

        $result = array(
            'is_leader' => $user === $room->getLeader(),
            'room_id'   => $room->getId(),
            'user_id'   => $user->getId(),
            'username'  => $username,
            'users'     =>  $room->getFormattedUsers(),
            'gameStarted'   => !empty($room->getCurrentQuestion())
        );

        return new JsonResponse(array('error' => 0, 'data' => $result), 200);
    }

    #[Route('/disconnect', name: 'disconnect', methods: ['POST'])]
    public function disconnectRoom(Request $request, RoomUtilManager $roomUtilManager, HubInterface $hub) : JsonResponse{

        /** @var User $user */
        $user = $this->getUser();
        $room = $user->getRoom();

        $roomUtilManager->removeUserFromRoom($user);

        $update = new Update(
            topics: 'https://subscribed.channel/'.$room->getId().'/room',
            data: json_encode(
                array(
                        'type' => 'usersUpdate',
                        'users' => $room->getFormattedUsers()
                    )
                )
        );
        $hub->publish($update);

        return new JsonResponse(array('error' => 0), 200);
    }

    #[Route('/sendMessage', name: 'send_message', methods: ['POST'])]
    public function sendMessage(Request $request, HubInterface $hub) : JsonResponse{
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        $message = $data['message']??null;

        if(!$message){
            return new JsonResponse(['error' => '1',  'error_message' => 'message is required'], 400);
        }

        $update = new Update(
            topics: 'https://subscribed.channel/'.$user->getRoom()->getId().'/room',
            data: json_encode(
                array(
                        'type' => 'userMessage',
                        'user_id' => $user->getId(),
                        'message' => $message,
                    )
                )
        );
        $hub->publish($update);

        return new JsonResponse(array('error' => 0), 200);
    }
}
