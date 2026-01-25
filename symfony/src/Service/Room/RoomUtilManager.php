<?php

namespace App\Service\Room;

use App\Entity\Room;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class RoomUtilManager
{
    public function __construct(
        private EntityManagerInterface $em,
        private HubInterface $hub
    ){}
    public function removeUserFromRoom(User $user) : void
    {
        $room = $user->getRoom();

        if(!empty($room)){
            $room->removeUser($user);
            $users = $room->getUsers();

            //if the user is leader, set another one leader
            if ($room->getLeader() === $user && count($users)>0){
                $room->setLeader($users[0]);
            }
            else if(count($users)===0){
                $this->em->remove($room);
            }

            $this->em->flush();
        }
    }

    public function createRoom(User $user, ?int $forceRoomId = null) : Room
    {
        $this->removeUserFromRoom($user);

        $room = new Room();
        $room->setLeader($user);
        $room->addUser($user);
        $room->setId($forceRoomId ?? null);
        $user->setRoom($room);
        $this->em->persist($room);
        $this->em->flush();

        return $room;
    }

    public function joinRoom(User $user, Room $room) : void
    {
        $this->removeUserFromRoom($user);
        $room->addUser($user);
        $this->em->flush();

        $update = new Update(
            topics: 'https://subscribed.channel/'.$room->getId().'/room',
            data: json_encode(
                array(
                    'type' => 'usersUpdate',
                    'users' => $room->getFormattedUsers(),
                )),
        );
        $this->hub->publish($update);
    }
}
