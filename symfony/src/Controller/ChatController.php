<?php
// src/Controller/ChatController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ChatController extends AbstractController
{

    #[Route('/api/testtest', name: 'test')]
    public function test(Request $request, HubInterface $hub): JsonResponse
    {
        return $this->json(['status' => 'message sent']);
    }


    #[Route('/api/send-message', name: 'send_message', methods: ['POST', 'OPTIONS'])]
    public function sendMessage(Request $request, HubInterface $hub): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? 'anonymous';
        $message = $data['message'] ?? '';

        $update = new Update(
            'https://chat.example.com/conversation',
            json_encode([
                'username' => $username,
                'message' => $message,
                'timestamp' => time(),
            ])
        );

        $hub->publish($update);

        return $this->json(['status' => 'message sent']);
    }
}
