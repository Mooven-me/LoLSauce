<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DataGenerationController extends AbstractController
{
    #[Route('/data/generation', name: 'app_data_generation')]
    public function index(): Response
    {
        return $this->render('data_generation/index.html.twig', [
            'controller_name' => 'DataGenerationController',
        ]);
    }
}
