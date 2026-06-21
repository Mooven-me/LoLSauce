<?php

namespace App\PusherNotification;

use App\Entity\Room;
use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('async')]
class PusherNotification {
    public function __construct(
        private int $roomId,
        private array $content,
        private ?string $type = null,
        private ?int $questionId = null
    ){}

    public function getRoomId(): int {
        return $this->roomId;
    }

    public function getContent(): array {
        return $this->content;
    }

    public function getType(): ?string {
        return $this->type;
    }

    public function getQuestionId(): ?int {
        return $this->questionId;
    }
}