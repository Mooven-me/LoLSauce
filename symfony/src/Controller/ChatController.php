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
            'http://localhost/chat', // The topic - must match what's in the React code
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
}