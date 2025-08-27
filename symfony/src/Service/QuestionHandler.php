<?php 

namespace App\Service;

use App\Entity\Questions;
use App\Entity\Room;
use App\PusherNotification\PusherNotification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

class QuestionHandler {

    private EntityManagerInterface $entityManager;
    private MessageBusInterface $bus;
    public function __construct(EntityManagerInterface $entityManager, MessageBusInterface $bus){
        $this->bus = $bus;
        $this->entityManager = $entityManager;
    }
}