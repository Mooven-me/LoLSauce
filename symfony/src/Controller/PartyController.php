<?php

namespace App\Controller;

use App\Entity\Questions;
use App\Entity\Room;
use App\Entity\User;
use App\PusherNotification\PusherNotification;
use App\PusherNotification\PusherNotificationHandler;
use App\Service\QuestionHandler;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;
use Symfony\Component\Routing\Attribute\Route;

use function PHPSTORM_META\map;

#[Route('/api')]
final class PartyController extends AbstractController
{
    private PusherNotificationHandler $questionHandler;
    private EntityManagerInterface $em;
    private HubInterface $hub;
    private MessageBusInterface $bus;

    public function __construct(
        PusherNotificationHandler $questionHandler,
        EntityManagerInterface $em,
        HubInterface $hub,
        MessageBusInterface $bus
    ){
        $this->questionHandler = $questionHandler;
        $this->em = $em;
        $this->hub = $hub;
        $this->bus = $bus;
    }

    #[Route('/create_room', name: 'app_party')]
    public function createRoom(EntityManagerInterface $em, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $username = $data["username"]??null;
        $result = array('error' => 0);
        try {

            $user = new User();
            $room = new Room();

            $room->setLeader($user);
            $room->addUser($user);
            $user->setRoom($room);
            $user->setUsername($username);

            $em->persist($room);
            $em->persist($user);

            $em->flush();

            $result['data'] = array(
                'room_id' => $room->getId(),
                'user_id' => $user->getId(),
            );
        } catch (\Exception $e) {
            $result['error'] = 1;
            $result['error_text'] = $e->getMessage();
            $result['error_stack_trace'] = $e->getTraceAsString();
        }
        return new JsonResponse($result, 200);
    }

    #[Route('/send_answer', name: 'send_answer', methods: ['POST'])]
    public function sendAnswer(Request $request, EntityManagerInterface $em, HubInterface $hub){
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id']??null;
        $word = $data['word']??null;

        if(!$userId){
            return new JsonResponse(['error' => '1',  'error_message' => 'userId is required'], 400);
        }
        if(!$word){
            return new JsonResponse(['error' => '1',  'error_message' => 'word is required'], 400);
        }

        /** @var User|null $user */
        $user = $em->getRepository(User::class)->findOneById($userId);

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
                    'user_id' => $userId,
                    'time' => $currentDate->diff($room->getQuestionDate()),
                    'score' => $user->getScore(),
                ])
            );
        }else{
            $update = new Update(
            topics: 'https://subscribed.channel/'.$roomId.'/room',
            data: json_encode([
                    'type' => 'try',
                    'user_id' => $userId,
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
    public function startRoom(Request $request, EntityManagerInterface $em){
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id']??null;

        if(!$userId){
            return new JsonResponse(['error' => 'userId is required'], 400);
        }

        /** @var User|null $user */
        $user = $em->getRepository(User::class)->findOneById($userId);
        $room = $user->getRoom();
        $roomId = $room->getId();

        // reset the game in case some users have still some points locale_filter_matches
        foreach($room->getUsers() as $user){
            $user->setScore(0);
        }

        //wait a little bit to start the game
        $this->questionHandler->handleCreateQuestion($roomId);

        $update = new Update(
            topics: 'https://subscribed.channel/'.$roomId.'/room',
            data: json_encode(['type' => 'start'])
        );
        $this->hub->publish($update);

        return new JsonResponse(array('error' => 0), 200);
    }

    #[Route('/join', name: 'join', methods: ['POST'])]
    public function joinRoom(Request $request, EntityManagerInterface $em, HubInterface $hub){
        $data = json_decode($request->getContent(), true);
        $username = $data['username']??null;
        $room_id = $data['room_id']??null;

        if(!$username){
            return new JsonResponse(['error' => '1',  'error_message' => 'username is required'], 400);
        }
        if(!$room_id){
            return new JsonResponse(['error' => '1',  'error_message' => 'room_id is required'], 400);
        }


        $room = $em->getRepository(Room::class)->findOneById($room_id);

        if(empty($room)){
            return new JsonResponse(['error' => '1',  'error_message' => 'invalid room_id'], 400);
        }

        $user = new User();
        $user->setUsername($username);
        $user->setRoom($room);
        $room->addUser($user);

        $em->persist($user);
        $em->persist($room);

        $em->flush();

        $update = new Update(
            topics: 'https://subscribed.channel/'.$room->getId().'/room',
            data: json_encode(
                array(
                    'type' => 'usersUpdate',
                    'users' => $room->getFormattedUsers(),
                    )),
        );
        $hub->publish($update);


        $result = array(
            'room_id'   => $room->getId(),
            'user_id'   => $user->getId(),
            'username'  => $username,
            'users'     =>  $room->getFormattedUsers(),
            'gameStarted'   => !empty($room->getCurrentQuestion())
        );

        return new JsonResponse(array('error' => 0, 'data' => $result), 200);
    }

    #[Route('/leaved', name: 'leaved', methods: ['POST'])]
    public function leavedRoom(Request $request, EntityManagerInterface $em, HubInterface $hub){
        $data = json_decode($request->getContent(), true);
        $user_id = $data['user_id']??null;

        if(!$user_id){
            return new JsonResponse(['error' => '1',  'error_message' => 'user_id is required'], 400);
        }

        $user = $em->getRepository(User::class)->findOneById($user_id);

        if(!$user){
            return new JsonResponse(['error' => '1',  'error_message' => 'user not found'], 400);
        }

        $room = $user->getRoom();

        $user->setRoom(null);
        $room->removeUser($user);

        $users = $room->getUsers();

        //if the user is leader, set another one leader
        if ($room->getLeader() === $user && count($users)>0){
            // if there is other users
            if(count($users) > 0){
                $room->setLeader($users[0]);
            }
        }

        if(count($users)===0){
            $em->remove($room);
        }

        //delete the user and affect the changes
        $em->remove($user);
        $em->flush();

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
    public function sendMessage(Request $request, HubInterface $hub){
        $data = json_decode($request->getContent(), true);

        $userId = $data['user_id']??null;
        $message = $data['message']??null;

        $user = $this->em->getRepository(User::class)->findOneById($userId);

        if(!$userId){
            return new JsonResponse(['error' => '1',  'error_message' => 'user_id is required'], 400);
        }

        if(!$message){
            return new JsonResponse(['error' => '1',  'error_message' => 'message is required'], 400);
        }

        $update = new Update(
            topics: 'https://subscribed.channel/'.$user->getRoom()->getId().'/room',
            data: json_encode(
                array(
                        'type' => 'userMessage',
                        'user_id' => $userId,
                        'message' => $message,
                    )
                )
        );
        $hub->publish($update);

        return new JsonResponse(array('error' => 0), 200);
    }
}
