<?php

namespace App\Controller;

use App\Entity\Room;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Attribute\Route;

use function PHPSTORM_META\map;

#[Route('/api')]
final class PartyController extends AbstractController
{
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

    #[Route('/send_answer', name: 'send_answer', methods: ['POST'])]
    public function startRoom(Request $request, EntityManagerInterface $em, HubInterface $hub){
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id']??null;

        if(!$userId){
            return new JsonResponse(['error' => 'userId is required'], 400);
        }

        $user = $em->getRepository(User::class)->findOneById($userId);
        $roomId = $user->getRoom();

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
                    'type' => 'joined',
                    'user' => array(
                        'user_id' => $user->getId(),
                        'username' => $user->getUsername(),
                    )
                    
                ))
        );
        $hub->publish($update);


        $result = array(
            'room_id' => $room->getId(),
            'user_id'=> $user->getId(),
            'users' => array_map(
                function ($elem) use ($room) {
                    return array(
                        'user_id' => $elem->getId(),
                        'username' => $elem->getUsername(),
                        'room_id' =>$room->getLeader() === $elem
                    ); 
                },
                $room->getUsers()->toArray()
            )
        );

        return new JsonResponse(array('error' => 0, 'data' => $result), 200);
    }
}
