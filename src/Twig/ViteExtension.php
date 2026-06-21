<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ViteExtension extends AbstractExtension
{
    private ?array $manifest = null;
    private string $publicDir;

    public function __construct(string $publicDir)
    {
        $this->publicDir = $publicDir;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('vite_entry_js', [$this, 'getEntryJs'], ['is_safe' => ['html']]),
            new TwigFunction('vite_entry_css', [$this, 'getEntryCss'], ['is_safe' => ['html']]),
        ];
    }

    public function getEntryJs(string $entry): string
    {
        $manifest = $this->getManifest();
        
        // Debug output
        error_log("ViteExtension: Looking for entry: " . $entry);
        error_log("ViteExtension: Manifest contents: " . json_encode($manifest));
        
        if (isset($manifest[$entry]['file'])) {
            $file = '/build/' . $manifest[$entry]['file'];
            error_log("ViteExtension: Found JS file: " . $file);
            return '<script type="module" src="' . $file . '"></script>';
        }

        error_log("ViteExtension: No JS file found for entry: " . $entry);
        return '';
    }

    public function getEntryCss(string $entry): string
    {
        $manifest = $this->getManifest();
        $html = '';
        
        if (isset($manifest[$entry]['css'])) {
            foreach ($manifest[$entry]['css'] as $css) {
                $file = '/build/' . $css;
                $html .= '<link rel="stylesheet" href="' . $file . '">';
            }
            error_log("ViteExtension: Found CSS files for entry: " . $entry);
        } else {
            error_log("ViteExtension: No CSS files found for entry: " . $entry . " at : " . $this->publicDir);
        }

        return $html;
    }

    private function getManifest(): array
    {
        if ($this->manifest === null) {
            $manifestPath = $this->publicDir . '/build/.vite/manifest.json';
            
            if (file_exists($manifestPath)) {
                $content = file_get_contents($manifestPath);
                $this->manifest = json_decode($content, true) ?: [];
            } else {
                $this->manifest = [];
            }
        }

        return $this->manifest;
    }
}