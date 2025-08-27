<?php

namespace App\Entity;

use App\Repository\QuestionsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use QuestionsTypes;

#[ORM\Entity(repositoryClass: QuestionsRepository::class)]
class Questions
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 1200)]
    private ?string $content = null;

    #[ORM\Column(length: 255)]
    private ?string $answer = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $data1 = null;
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(string $answer): static
    {
        $this->answer = $answer;

        return $this;
    }

    public function getData1(): ?string
    {
        return $this->data1;
    }

    public function setData1(?string $data1): static
    {
        $this->data1 = $data1;

        return $this;
    }

    public function toArray(){

        $content = null;

        switch($this->type){
            case QuestionsTypes::passive_image->value:
            case QuestionsTypes::skin_image->value:
            case QuestionsTypes::spell_image->value:
                $content = base64_encode(file_get_contents($this->content));
                break;
            case QuestionsTypes::pixel_image->value:
                foreach(array(4,8,12,16) as $degree){
                    $content[$degree] = base64_encode(file_get_contents($this->content.'/'.$this->data1.'_'.$degree.'.png'));
                }
                break;
            case QuestionsTypes::lore->value:
                $content = $this->content;
                break;
        }

        $result = array(
            'type'      => $this->type,
            'content'   => $content,
            'title'     => $this->title,
        );

        return $result;
    }
}
