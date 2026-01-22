<?php

namespace App\Service\Room;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class RoomUtilManager
{
    public function __construct(
        private EntityManagerInterface $em
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
}
