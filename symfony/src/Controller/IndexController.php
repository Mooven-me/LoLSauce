<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class IndexController extends AbstractController
{

    public function __construct(
        private EntityManagerInterface $em,
    ){

    }
    #[Route('/{reactRouting}', name: 'app_index', requirements: ['reactRouting' => '^(?!api/).*'], defaults: ['reactRouting' => null], priority: -1)]
    public function index(Request $request, JWTTokenManagerInterface $JWTTokenManager): Response
    {
        $response = $this->render('index/index.html.twig');

        // if user already logged in, we send him the page, otherwise we create cookies.
        if ($this->getUser()) {
            return $response;
        }

        $user = new User();
        $user->setEmail('guest_' . uniqid() . '@no_account.com');
        $user->setUsername('anonymous');
        $user->setAnonymous(true);

        $this->em->persist($user);
        $this->em->flush();

        $token = $JWTTokenManager->create($user);

        $cookie = Cookie::create('LOLSAUCE_JWT_COOKIE')
            ->withValue($token)
            ->withExpires(new \DateTime('+1 hour'))
            ->withPath('/')
            ->withSecure(true)
            ->withHttpOnly(true)
            ->withSameSite('lax');

        $response->headers->setCookie($cookie);

        return $response;
    }
}
