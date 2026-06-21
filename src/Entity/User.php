<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 32)]
    private ?string $username = null;

    #[ORM\ManyToOne(inversedBy: 'Users')]
    #[ORM\JoinColumn(nullable: true, onDelete:'SET NULL')]
    private ?Room $room = null;

    #[ORM\Column]
    private int $score = 0;

    #[ORM\Column(length: 255, unique: true, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $password = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\ManyToOne(inversedBy: 'Room')]
    private ?Room $CorrectAnswerRoom = null;

    #[ORM\Column(nullable: true)]
    private ?bool $anonymous = null;

    #[ORM\Column(length: 255, unique: true, nullable: true)]
    private ?string $discordId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatarLink = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getRoom(): ?Room
    {
        return $this->room;
    }

    public function setRoom(?Room $room): self
    {
        $this->room = $room;

        return $this;
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(int $score): self
    {
        $this->score = $score;

        return $this;
    }

    /**
     * room related information
     * @return array
     */
    public function getFormattedUser(): array {
        return array(
            'user_id'   => $this->id,
            'username'  => $this->username,
            'score'     => $this->score,
            'avatar_link' => $this->avatarLink,
        );
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * The public representation of the user (e.g. a username, an email address, etc.)
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function eraseCredentials(): void
    {
        //Later
    }

    public function getCorrectAnswerRoom(): ?Room
    {
        return $this->CorrectAnswerRoom;
    }

    public function setCorrectAnswerRoom(?Room $CorrectAnswersUsers): self
    {
        $this->CorrectAnswerRoom = $CorrectAnswersUsers;

        return $this;
    }

    public function isAnonymous(): ?bool
    {
        return $this->anonymous ?? false;
    }

    public function setAnonymous(?bool $anonymous): self
    {
        $this->anonymous = $anonymous;

        return $this;
    }

    public function setDiscordId(?int $discordId) : self
    {
        $this->discordId = $discordId;
        return $this;
    }

    public function setAvatarLink(?string $link) : self
    {
        $this->avatarLink = $link;
        return $this;
    }

    public function getAvatarLink() : ?string
    {
        return $this->avatarLink;
    }

    /**
     * sensitive information
     * @return array
     */
    public function getFormattedInformation(): array {
        return array(
            'username' => $this->username,
            'is_logged_in' => (!$this->anonymous) ?? true,
            'roles' => $this->roles,
            'room_id' => $this->room?->getId() ?? null,
        );
    }
}

