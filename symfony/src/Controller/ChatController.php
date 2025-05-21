<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ChatController extends AbstractController
{
    #[Route('/chat', name: 'app_chat')]
    public function index(): Response
    {
        return $this->render('chat/index.html.twig', [
            'controller_name' => 'ChatController',
        ]);
    }
}
/**
<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Annotation\Route;

class ChatController extends AbstractController
{
    #[Route('/api/chat', name: 'api_chat', methods: ['POST'])]
    public function chat(Request $request, HubInterface $hub): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
       
        // Validate the data
        if (!isset($data['message']) || !isset($data['username'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }
       
        $update = new Update(
            'http://localhost/chat',
            json_encode([
                'message' => $data['message'],
                'username' => $data['username'],
                'timestamp' => $data['timestamp'] ?? (new \DateTime())->format(\DateTimeInterface::ISO8601)
            ])
        );
       
        // Publish the update
        $hub->publish($update);
       
        return $this->json(['status' => 'published']);
    }

    #[Route('/api/test', name: 'api_test', methods: ['POST'])]
    public function test(Request $request, HubInterface $hub): JsonResponse
    {
            return $this->json(['status' => 'published']);
    }
}

*/