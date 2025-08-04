<?php

namespace App\PusherNotification;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class PusherNotificationHandler{

    public function __construct(
        private HubInterface $hub
    ){}

    public function __invoke(PusherNotification $pn){
        $roomId = $pn->getRoomId();

        $update = new Update(
            topics: 'https://subrscribed.channel/'.$roomId.'/room',
            data: json_encode(
                array(
                        'type' => $pn->getType(),
                    )
                )
        );

        $this->hub->publish($update);
    }
}