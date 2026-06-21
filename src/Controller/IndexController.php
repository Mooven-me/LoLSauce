<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\JWT\JWTUtilManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class IndexController extends AbstractController
{

    public function __construct(
        private EntityManagerInterface $em,
        private JWTUtilManager $jwtUtilManager,
    ){

    }
    #[Route('/{reactRouting}', name: 'app_index', requirements: ['reactRouting' => '^(?!api/).*'], defaults: ['reactRouting' => null], priority: -1)]
    public function index(Request $request): Response
    {

        // if user already logged in, we send him the page, otherwise we create cookies.
        if ($this->getUser()) {
            return $this->render('index/index.html.twig', array('user' => $this->getUser()->getFormattedInformation()));
        }

        $refreshToken = $this->jwtUtilManager->getRefreshToken($request);

        $user = $this->jwtUtilManager->getUserFromRefreshToken($refreshToken);

        // no valid jwt and refresh token
        // we create an anonymous user
        if (!$user) {
            $user = new User();
            $user->setEmail('guest_' . uniqid() . '@no_account.com');
            $user->setUsername('anonymous');
            $user->setAnonymous(true);

            $this->em->persist($user);
            $this->em->flush();
        }

        $response= $this->render('index/index.html.twig', array('user' => $user->getFormattedInformation()));

        $this->jwtUtilManager->createCredentials($response, $user, $refreshToken);

        return $response;
    }
}
