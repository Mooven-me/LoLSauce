<?php

namespace App\PusherNotification;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('async')]
class PusherNotification {
    public function __construct(
        private int $roomId,
        private string $type = 'end_answers',
    ){
    }

    public function getRoomId(): int {
        return $this->roomId;
    }

    public function getType(): string {
        return $this->type;
    }
}