<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth')]
final class UserController extends AbstractController
{

    public function __construct(
        private EntityManagerInterface $em,
    ){}

    #[Route('/create', name: 'app_user')]
    public function createUser(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username']??null;
        $email = $data['email']??null;
        $password = $data['password']??null;

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword(
            $user,
            $password
        ));
        $user->setUsername($username);


        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(array('error'=>0));
    }
}
