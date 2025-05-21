<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class TestController extends AbstractController
{
    #[Route('/test-json', name: 'test_json')]
    public function testJson(): JsonResponse
    {
        return $this->json([
            'message' => 'This is a test JSON response',
            'time' => new \DateTime(),
            'symfony_environment' => $_SERVER['APP_ENV'] ?? 'unknown',
        ]);
    }
}