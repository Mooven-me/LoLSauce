<?php

namespace App\Controller;

use App\Entity\Room;
use App\Entity\User;
use App\PusherNotification\PusherNotification;
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

    public function __construct(
        private MessageBusInterface $bus
    ){}

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

        $user = $em->getRepository(user::class)->findOneById($userId);

        $roomId = $user->getRoom()->getId();

        if($this->toUpperWithoutAccents($word) == "TROUVE"){ //check si la réponse est bonne
            $user = $em->getRepository(User::class)->findOneById($userId);
            $user->setScore($user->getScore() + 1);
            $update = new Update(
            'https://subrscribed.channel/'.$roomId.'/room',
            json_encode([
                'type' => 'success',
                'user_id' => $userId
            ])
            );
        }else{
            $update = new Update(
            topics: 'https://subrscribed.channel/'.$roomId.'/room',
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
    public function startRoom(Request $request, EntityManagerInterface $em, HubInterface $hub){
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id']??null;

        if(!$userId){
            return new JsonResponse(['error' => 'userId is required'], 400);
        }

        $user = $em->getRepository(User::class)->findOneById($userId);
        $room = $user->getRoom();
        $roomId = $room->getId();

        //wait a little bit to start the game
        $this->handleQuestion($room);

        $update = new Update(
            topics: 'https://subrscribed.channel/'.$roomId.'/room',
            data: json_encode(['type' => 'start'])
        );
        $hub->publish($update);
        
        return new JsonResponse(array('error' => 0), 200);
    }

    #[Route('/joined', name: 'joined', methods: ['POST'])]
    public function joinedRoom(Request $request, EntityManagerInterface $em, HubInterface $hub){
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
        $em->persist(object: $room);

        $em->flush();

        $update = new Update(
            topics: 'https://subrscribed.channel/'.$room->getId().'/room',
            data: json_encode(
                array(
                    'type' => 'usersUpdate',
                    'users' => $room->getFormattedUsers(),
                    )),
        );
        $hub->publish($update);


        $result = array(
            'room_id' => $room->getId(),
            'user_id'=> $user->getId(),
            'users' =>  $room->getFormattedUsers(),
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
        $room->removeUser($user);
        $users = $room->getUsers();

        //if the user is leader, set another one leader
        if ($room->getLeader() === $user){
            // if there is other users
            if(count($users) > 0){
                $room->setLeader($users[0]);
            }
        }

        //delete the user and affect the changes
        $em->remove($user);
        $em->flush();

        $update = new Update(
            topics: 'https://subrscribed.channel/'.$room->getId().'/room',
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

    public function handleQuestion($room){
        $roomId = $room->getId();
        
        //end of the questions
        $this->bus->dispatch(
            new PusherNotification($roomId, 'answers'),
            [new DelayStamp(10000 )]
        );
    }
}
