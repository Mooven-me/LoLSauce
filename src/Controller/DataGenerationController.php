<?php

namespace App\Controller;

use App\Service\Questions\DataGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class DataGenerationController extends AbstractController
{
    private $dataGenerator;

    public function __construct(DataGenerator $dataGenerator)
    {
        $this->dataGenerator = $dataGenerator;
    }


    #[Route('/generateData', name: 'data_generation')]
    public function generateData(DataGenerator $dataGenerator): JsonResponse
    {
        set_time_limit(0);
        ini_set('max_execution_time', '0');
        $result = array('error' => 0);
        try {
            $dataGenerator->generateDataProcess();
        } catch (\Exception $e) {
            $result = array(
                'error' => 1,
                'error_message' => 'A problem occured : '.$e->getMessage(). ' \nstack trace : '.$e->getTraceAsString()
            );
        }

        return new JsonResponse($result);
    }
}
