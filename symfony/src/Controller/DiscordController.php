<?php

namespace App\Controller;

use App\Entity\Room;
use App\Entity\User;
use App\Service\JWT\JWTUtilManager;
use App\Service\Room\RoomUtilManager;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/discord')]
class DiscordController extends AbstractController
{
    #[Route('/login', name: 'api_discord_login', methods: ['POST'])]
    public function login(Request $request, HttpClientInterface $httpClient, EntityManagerInterface $em, JWTUtilManager $jwtUtilManager, RoomUtilManager $roomUtilManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $code = $data['code'] ?? null;
        // identifiant du channel discord nou permettant de créer une partie
        $instanceId = $data['instance_id'] ?? null;

        if (!$code) return $this->json(['error' => 'No code'], 400);

        $response = $httpClient->request('POST', 'https://discord.com/api/oauth2/token', [
            'body' => [
                'client_id' => $_ENV['DISCORD_CLIENT_ID'],
                'client_secret' => $_ENV['DISCORD_CLIENT_SECRET'],
                'grant_type' => 'authorization_code',
                'code' => $code,
            ]
        ]);

        $tokens = $response->toArray(false);
        if (!isset($tokens['access_token'])) return $this->json(['error' => 'Discord auth failed'], 400);

        $userResponse = $httpClient->request('GET', 'https://discord.com/api/users/@me', [
            'headers' => ['Authorization' => 'Bearer ' . $tokens['access_token']]
        ]);
        $discordUser = $userResponse->toArray();

        $repo = $em->getRepository(User::class);

        /** @var User $user */
        $user = $repo->findOneBy(['discordId' => $discordUser['id']]);

        if (!$user) {
            /** @var User $user */
            $user = $this->getUser();
            $user->setDiscordId($discordUser['id']);
            $user->setUsername($discordUser['username']);
            $user->setAvatarLink($discordUser['avatar']);
            $em->persist($user);
            $em->flush();
        }

        // création / rejoindre la salle
        $room = $em->getRepository(Room::class)->findOneBy(['id' => $instanceId]);
        if (empty($room)) {
            $room = $roomUtilManager->createRoom($user);
            $room->setId($instanceId);
            $em->flush();
        }else{
            $roomUtilManager->joinRoom($user, $room);
        }

        $response = new JsonResponse([
            'error' => 0,
            'data' => [
                'user' => $user->getFormattedUser(),
                'room_id' => $room->getId(),
            ]
        ]);

        $jwtUtilManager->createCredentials($response, $user);
        return $response;
    }
}
