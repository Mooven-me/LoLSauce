<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\JWTUtilManager;
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
        private JWTUtilManager $jwtUtilManager,
    ){}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function registerUser(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username']??null;
        $email = $data['email']??null;
        $password = $data['password']??null;

        if(empty($username) || empty($email) || empty($password)){
            return new JsonResponse(array('error' => 1, 'error_message' => 'missing data', 'error_type' => 'missing_data'), 400);
        }
        $existingUser = $this->em->getRepository(User::class)->findOneByEmail($email);
        if(!empty($existingUser)){
            return new JsonResponse(array('error' => 1, 'error_message' => 'email address already taken', 'error_type' => 'email'), 400);
        }

        if($this->getUser() && $this->getUser()->isAnonymous()){
            $user = $this->getUser();
            $user->setAnonymous(false);
        }else{
            $user = new User();
            $this->em->persist($user);
        }

        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword(
            $user,
            $password
        ));
        $user->setUsername($username);

        $this->em->flush();

        $response = new JsonResponse(array('error'=>0, 'data' => $user->getFormattedInformation()));
        $this->jwtUtilManager->createCredentials($response, $user);

        return $response;
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function loginUser(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (empty($email) || empty($password)) {
            return new JsonResponse(['error' => 1, 'error_message' => 'Email and password are required', 'error_type' => 'missing_data'], 400);
        }

        /** @var User|null $user */
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['error' => 1, 'error_message' => 'Invalid credentials', 'error_type' => 'auth_failed'
            ], 400);
        }

        $response = new JsonResponse(['error' => 0, 'data' => $user->getFormattedInformation()]);
        $this->jwtUtilManager->createCredentials($response, $user);

        return $response;
    }
}
