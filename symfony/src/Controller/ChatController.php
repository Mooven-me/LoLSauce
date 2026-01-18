<?php
// src/Controller/ChatController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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
        $user = $this->getUser();

        if(!$user){
            return $this->json(['error' => 'User not authenticated'],Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $message = $data['message'] ?? '';

        $update = new Update(
            'https://chat.example.com/conversation',
            json_encode([
                'username' => $user->getUsername(),
                'message' => $message,
                'timestamp' => time(),
            ])
        );

        $hub->publish($update);

        return $this->json(['status' => 'message sent']);
    }
}
