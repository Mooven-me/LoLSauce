<?php

namespace App\Service;

use Intervention\Image\ImageManager;

class ImageEffect
{
    private ImageManager $imageManager;

    public function __construct(ImageManager $imageManager)
    {
        $this->imageManager = $imageManager;
    }

    public function createPixelatedImage(string $inputPath, string $outputPath, int $pixelNumber = 16): void
    {
        // Load the image
        $image = $this->imageManager->read($inputPath);
        
        // Convert to grayscale first
        $image->greyscale();
        
        // Resize to the desired pixel size (this creates the pixelation effect)
        $image->pixelate($image->width()/$pixelNumber);
        
        // Save the result
        $image->save($outputPath);
    }

    public function createImageRotation(string $inputPath, string $outputPath, int $degree){
        // Load the image
        $image = $this->imageManager->read($inputPath);
        
        // Convert to grayscale first
        $image->greyscale();
        
        // Resize to the desired pixel size (this creates the pixelation effect)
        $image->rotate($degree);
        
        // Save the result
        $image->save($outputPath);
    }
}