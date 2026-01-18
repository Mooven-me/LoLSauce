<?php

namespace App\Service;

use App\Entity\User;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class JWTUtilManager
{
    public function __construct(
        private RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private RefreshTokenManagerInterface $refreshTokenManager,
        private JWTTokenManagerInterface $JWTTokenManager,
        private UserProviderInterface $userProvider
    ){

    }

    public function createCredentials(Response $response, User $user, ?RefreshTokenInterface $refreshToken = null): void
    {
        $token = $this->JWTTokenManager->create($user);

        // jwt cookie
        $JWTCookie = Cookie::create('jwt_lolsauce')
            ->withValue($token)
            ->withExpires(new \DateTime('+1 hour'))
            ->withSameSite('lax');

        // creation du refresh token
        if(empty($refreshToken)){
            $refreshToken = $this->refreshTokenGenerator->createForUserWithTtl($user, 2592000);
            $this->refreshTokenManager->save($refreshToken);
        }

        // refresh token
        $refreshTokenCookie = Cookie::create('rt_lolsauce')
            ->withValue($refreshToken->getRefreshToken())
            ->withExpires($refreshToken->getValid())
            ->withPath('/')
            ->withSameSite('lax');

        // to attach both to the request
        $response->headers->setCookie($JWTCookie);
        $response->headers->setCookie($refreshTokenCookie);
    }

    public function clearCredentials(Response $response): void{
        $response->headers->clearCookie('jwt_lolsauce', '/', null, true, true, 'lax');
        $response->headers->clearCookie('rt_lolsauce', '/', null, true, true, 'lax');
    }

    public function getUserFromRefreshToken(?RefreshTokenInterface $refreshToken): ?User
    {
        if (!$refreshToken || !$refreshToken->isValid()) {
            return null;
        }

        $username = $refreshToken->getUsername();

        if (!$username) {
            return null;
        }

        try {
            $user = $this->userProvider->loadUserByIdentifier($username);

            return $user instanceof User ? $user : null;

        } catch (UserNotFoundException $e) {
            return null;
        }
    }

    /**
     * Retourne l'objet RefreshToken complet si valide
     */
    public function getRefreshToken(Request $request): ?RefreshTokenInterface
    {
        $refreshTokenString = $request->cookies->get('rt_lolsauce');

        if (!$refreshTokenString) {
            return null;
        }

        /** @var RefreshTokenInterface|null $refreshToken */
        $refreshToken = $this->refreshTokenManager->get($refreshTokenString);

        if (!$refreshToken || !$refreshToken->isValid()) {
            return null;
        }

        return $refreshToken;
    }
}
