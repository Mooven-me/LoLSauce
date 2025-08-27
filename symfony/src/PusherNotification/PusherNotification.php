<?php

namespace App\PusherNotification;

use App\Entity\Room;
use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('async')]
class PusherNotification {
    public function __construct(
        private Room $room,
        private array $content,
        private ?string $type = null
    ){}

    public function getRoom(): Room {
        return $this->room;
    }

    public function getContent(): array {
        return $this->content;
    }

    public function getType(): ?string {
        return $this->type;
    }
}