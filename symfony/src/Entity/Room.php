<?php

namespace App\Entity;

use App\Repository\RoomRepository;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RoomRepository::class)]
class Room
{
    #[ORM\Id]
    #[ORM\Column]
    private int $id;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private User $leader;

    /**
     * @var Collection<int, User>
     */
    #[ORM\OneToMany(targetEntity: User::class, mappedBy: 'room')]
    private Collection $Users;

    #[ORM\ManyToOne]
    private ?Questions $currentQuestion = null;

    /**
     * @var Collection<int, Setting>
     */
    #[ORM\ManyToMany(targetEntity: Setting::class)]
    private Collection $settings;

    #[ORM\Column]
    private ?\DateTime $date = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $questionDate = null;

    public function __construct()
    {
        $this->id = rand(100000000, 999999999);
        $this->Users = new ArrayCollection();
        $this->settings = new ArrayCollection();
        $this->date = new DateTime();
    }

    public function setId(?int $id): static
    {
        $this->id = $id;
        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLeader(): ?User
    {
        return $this->leader;
    }

    public function setLeader(User $leader): static
    {
        $this->leader = $leader;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->Users;
    }

    public function addUser(User $user): static
    {
        if (!$this->Users->contains($user)) {
            $this->Users->add($user);
            $user->setRoom($this);
            $user->setScore(0);
            $user->setUserRoomId(bin2hex(random_bytes(20)));
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->Users->removeElement($user)) {
            // set the owning side to null (unless already changed)
            if ($user->getRoom() === $this) {
                $user->setRoom(null);
                $user->setScore(0);
                $user->setUserRoomId(null);
            }
        }

        return $this;
    }

    public function getFormattedUsers(): array {
        $users = $this->Users;
        $result = array();
        foreach($users as $user){
            $result[]=array(
                ...$user->getFormattedUser(),
                'is_leader' => $user == $this->leader
            );
        }
        return $result;
    }

    public function getCurrentQuestion(): ?Questions
    {
        return $this->currentQuestion;
    }

    public function setCurrentQuestion(?Questions $currentQuestion): static
    {
        $this->currentQuestion = $currentQuestion;

        $this->questionDate = new DateTime();

        return $this;
    }

    /**
     * @return Collection<int, Setting>
     */
    public function getSettings(): Collection
    {
        return $this->settings;
    }

    public function addSetting(Setting $setting): static
    {
        if (!$this->settings->contains($setting)) {
            $this->settings->add($setting);
        }

        return $this;
    }

    public function removeSetting(Setting $setting): static
    {
        $this->settings->removeElement($setting);

        return $this;
    }

    public function getSettingByTitle(string $title): ?Setting{
        foreach($this->getSettings() as $setting){
            if($setting->getTitle() === $title){
                return $setting;
            }
        }
        return null;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getQuestionDate(): ?\DateTime
    {
        return $this->questionDate;
    }

    public function setQuestionDate(?\DateTime $questionDate): static
    {
        $this->questionDate = $questionDate;

        return $this;
    }
}
