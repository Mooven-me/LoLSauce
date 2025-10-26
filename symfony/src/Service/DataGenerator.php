<?php


namespace App\Service;

use App\Entity\Questions;
use App\Service\enums\QuestionsTypes;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use PharData;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class DataGenerator
{
    private HttpClientInterface $httpClient;
    private Filesystem $filesystem;
    private ImageEffect $imageEffect;
    private EntityManagerInterface $em;
    private string $version;
    private string $mainPath = '/app/files';
    private array $championsMapping = 
        array(
            'Fiddlesticks' => 'FiddleSticks',
        );
        

    public function __construct(
            HttpClientInterface $httpClient, 
            Filesystem $filesystem,
            ImageEffect $imageEffect,
            EntityManagerInterface $em,
        ){
        $this->httpClient = $httpClient;
        $this->filesystem = $filesystem;
        $this->imageEffect = $imageEffect;
        $this->em = $em;
    }

    private function updateVersion(){
        $response = $this->httpClient->request('GET', 'https://ddragon.leagueoflegends.com/api/versions.json');
        $this->version = $response->toArray()[0];
    }

    public function getVersion(){
        if(!$this->version){
            $this->updateVersion();
        }
        return $this->version;
    }

    /**
     * create a version file at the mentionned path.
     * 
     * @param string $path the path where the file version will be created
     * @return void
     */
    private function createVersionFile(string $path){
        $path = ($path[strlen($path)-1] == '/' ? $path.'version.txt' : $path.'/version.txt');

        if($this->filesystem->exists($path)){
            $this->filesystem->remove($path);
        }
        $this->filesystem->dumpFile($path, $this->getVersion());
    }

    /**
     * tell if the current path is upd to date
     * 
     * @param string $path
     * @return string
     */
    private function isVersionFileUpToDate(string $path): bool{
        $path = ($path[strlen($path)-1] == '/' ? $path.'version.txt' : $path.'/version.txt');
        
        return $this->filesystem->exists($path) ? $this->filesystem->readFile($path) === $this->getVersion() : false;
    }

        public function removeAccentsAndUpper($string) {
        // Convert accented characters to ASCII equivalents
        $string = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $string);

        // Convert to uppercase in a multibyte-safe way
        $string = mb_strtoupper($string, 'UTF-8');
    
        return $string;
    }

    private function getOriginalChampionName(string $filesystemName): string {
        static $reverseMapping = null;
        
        if ($reverseMapping === null) {
            $reverseMapping = array_flip($this->championsMapping);
        }
        
        return $reverseMapping[$filesystemName] ?? $filesystemName;
    }

    public function getChampionData(string $championName) {
        $version = $this->getVersion();

        $originalChampionName = $this->getOriginalChampionName($championName);

        $fileContent = file_get_contents($this->mainPath.'/dragontail-'.$version.'/'.$version.'/data/fr_FR/champion/'.$originalChampionName.'.json');
        
        return json_decode($fileContent, true)['data'][$originalChampionName];
    }

    public function getChampions(): array {
        static $champions = null;
        
        if ($champions !== null) {
            return $champions;
        }
        
        $version = $this->getVersion();
        $fileContent = file_get_contents($this->mainPath.'/dragontail-'.$version.'/'.$version.'/data/fr_FR/champion.json');
        $content = json_decode($fileContent, true);
        $result = array_keys($content['data']);
        
        foreach ($result as $key => $champion) {
            if (isset($this->championsMapping[$champion])) {
                $result[$key] = $this->championsMapping[$champion];
            }
        }
        
        $champions = $result;
        return $champions;
    }

    /**
     * handle all the generation file and download file process
     * @throws \Symfony\Component\Process\Exception\ProcessFailedException
     * @return void
     */
    public function generateDataProcess(): void {
        set_time_limit(-1);
        ini_set('memory_limit', '-1'); 

        // check if we have the newest version of the file
        $this->updateVersion();

        if(!$this->filesystem->exists($this->mainPath)){
            $this->filesystem->mkdir($this->mainPath);
        }
        
        $upToDate = $this->isVersionFileUpToDate($this->mainPath.'/assets');

        // to download the latest part of the file if needed
        if(!$upToDate){

            $fileName = 'dragontail-'.$this->getVersion();
            $fullFilePath = $this->mainPath.'/'.$fileName;

            // clear the old data
            $files = scandir($this->mainPath);
            foreach($files as $file){
                if(str_contains($file, 'dragon')){
                    $this->filesystem->remove($this->mainPath.'/'.$file);
                }
            }

            $response = $this->httpClient->request('GET', 'https://ddragon.leagueoflegends.com/cdn/'.$fileName.'.tgz');
            
            // store the new file (this method allow streaming directly)
            $fileHandle = fopen($fullFilePath.'.tgz', 'w');
            foreach ($this->httpClient->stream($response) as $chunk) {
                if ($chunk->isTimeout() || $chunk->isFirst()) {
                    continue;
                }
                if ($chunk->isLast()) {
                    break;
                }
                fwrite($fileHandle, $chunk->getContent());
            }

            fclose($fileHandle);

            $this->filesystem->mkdir($fullFilePath);

            // using tar because it handles permissions and problematic filenames better
            $process = Process::fromShellCommandline('tar -xzf ' . escapeshellarg($fullFilePath.'.tgz') . ' -C ' . escapeshellarg($fullFilePath) . ' --no-same-owner --no-same-permissions');
            $process->setTimeout(3600);
            $process->run();
            
            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            unlink($fullFilePath.'.tgz');


            // set the new updateVersion
            $this->createVersionFile($this->mainPath.'/assets');
        }

        // generate questions
        $this->generateChampionPixelImages();

        $this->generateChampionSkins();

        $this->generateChampionSpellsIcons();

        $this->generateChampionPassive();

        $this->generateChampionLore();
    }



    public function generateChampionPixelImages(){

        $targetFolder = $this->mainPath.'/assets/'.QuestionsTypes::pixel_image->value;
        $questionsRepository = $this->em->getRepository(Questions::class);

        // check if it is up to date and not database empty
        if($this->isVersionFileUpToDate($targetFolder) && $questionsRepository->countByType(QuestionsTypes::pixel_image->value) > 0){
            return;
        }

        $questionsRepository->deleteByType(QuestionsTypes::pixel_image->value);

        $fullFilePath = $this->mainPath.'/dragontail-'.$this->getVersion();

        if($this->filesystem->exists($targetFolder)){
            $this->filesystem->remove($targetFolder);
        }
        $this->filesystem->mkdir($targetFolder);

        $imagesDirectory = $fullFilePath.'/'.$this->getVersion().'/img/champion/';
        $champions = $this->getChampions();

        foreach($champions as $champion){
            
            $championData = $this->getChampionData($champion);

            // create new folder name
            $folderPath = $targetFolder.'/'.$champion;
            $image = $championData['image']['full']; 

            $this->filesystem->mkdir($folderPath);

            // to create pixelated images
            foreach(array(4,8,12,16) as $pixel){
                $this->imageEffect->createPixelatedImage($imagesDirectory.$image, $folderPath.'/'.$champion.'_'.$pixel.'.png', $pixel);
            }

            // create a new Questions object to the data base
            $question = new Questions();
            $question->setContent($folderPath);
            $question->setTitle('Qui est ce champion ?');
            $question->setType(QuestionsTypes::pixel_image->value);
            $question->setData1($champion);
            $question->setAnswer($this->removeAccentsAndUpper($championData['name']));

            $this->em->persist($question);
        }

        $this->createVersionFile($targetFolder);

        $this->em->flush();
    }

    public function generateChampionSkins(){

        $targetFolder = $this->mainPath.'/assets/'.QuestionsTypes::skin_image->value;
        $questionsRepository = $this->em->getRepository(Questions::class);

        // check if it is up to date and not database empty
        if($this->isVersionFileUpToDate($targetFolder) && $questionsRepository->countByType(QuestionsTypes::skin_image->value) > 0){
            return;
        }

        $questionsRepository->deleteByType(QuestionsTypes::skin_image->value);

        $fullFilePath = $this->mainPath.'/dragontail-'.$this->getVersion();

        $imagesDirectory = $fullFilePath.'/img/champion/splash/';
        $champs = $this->getChampions();

        if($this->filesystem->exists($targetFolder)){
            $this->filesystem->remove($targetFolder);
        }
        $this->filesystem->mkdir($targetFolder);

        foreach($champs as $champion){

            $championData = $this->getChampionData($champion);

            $championFolderPath = $targetFolder.'/'.$champion;
            $this->filesystem->mkdir($championFolderPath);

            foreach($championData['skins'] as $skin){
                if($skin['name'] !== 'default'){

                    $fileName = $champion.'_'.$skin['num'].'.jpg';
                    $this->filesystem->copy($imagesDirectory.$fileName, $championFolderPath.'/'.$fileName);

                    // create a new Questions object to the data base
                    $question = new Questions();
                    $question->setContent($championFolderPath.'/'.$fileName);
                    $question->setTitle('Quel est ce skin ?');
                    $question->setType(QuestionsTypes::skin_image->value);
                    $question->setAnswer($this->removeAccentsAndUpper($skin['name']));

                    $this->em->persist($question);
                }
            }
        }
        $this->createVersionFile($targetFolder);

        $this->em->flush();
    }

    public function generateChampionSpellsIcons(){

        $targetFolder = $this->mainPath.'/assets/'.QuestionsTypes::spell_image->value;
        $questionsRepository = $this->em->getRepository(Questions::class);

        // check if it is up to date and not database empty
        if($this->isVersionFileUpToDate($targetFolder) && $questionsRepository->countByType(QuestionsTypes::spell_image->value) > 0){
            return;
        }

        $questionsRepository->deleteByType(QuestionsTypes::spell_image->value);

        $version = $this->getVersion();
        $fullFilePath = $this->mainPath.'/dragontail-'.$version;

        $imagesDirectory = $fullFilePath.'/'.$version.'/img/spell/';
        $champs = $this->getChampions();

        if($this->filesystem->exists($targetFolder)){
            $this->filesystem->remove($targetFolder);
        }
        $this->filesystem->mkdir($targetFolder);

        foreach($champs as $champion){

            $championData = $this->getChampionData($champion);
            $championFolderPath = $targetFolder.'/'.$champion;
            $this->filesystem->mkdir($championFolderPath);

            foreach($championData['spells'] as $spell){

                $fileName = $spell['id'].'.png';
                $this->filesystem->copy($imagesDirectory.$fileName, $championFolderPath.'/'.$fileName);

                $this->filesystem->mkdir($championFolderPath.'/difficult');
                foreach(array(0,90,180,270) as $rotation){
                    $this->imageEffect->createImageRotation($imagesDirectory.$fileName, $championFolderPath.'/difficult/'.$spell['id'].'_'.$rotation.'.png', $rotation);
                
                    // create a new Questions object to the data base
                    $question = new Questions();
                    $question->setContent($championFolderPath.'/difficult/'.$spell['id'].'_'.$rotation.'.png');
                    $question->setTitle('Quel champion à cette compétence ?');
                    $question->setType(QuestionsTypes::spell_image->value);
                    $question->setAnswer($this->removeAccentsAndUpper($championData['name']));

                    $this->em->persist($question);
                }

                // create a new Questions object to the data base
                $question = new Questions();
                $question->setContent($championFolderPath.'/'.$fileName);
                $question->setTitle('Quel champion à cette compétence ?');
                $question->setType(QuestionsTypes::spell_image->value);
                $question->setAnswer($this->removeAccentsAndUpper($championData['name']));

                $this->em->persist($question);
            }
        }

        $this->createVersionFile($targetFolder);
        
        $this->em->flush();
    }

    public function generateChampionPassive(){

        $targetFolder = $this->mainPath.'/assets/'.QuestionsTypes::passive_image->value;

        $questionsRepository = $this->em->getRepository(Questions::class);

        // check if it is up to date and not database empty
        if($this->isVersionFileUpToDate($targetFolder) && $questionsRepository->countByType(QuestionsTypes::passive_image->value) > 0){
            return;
        }

        $questionsRepository->deleteByType(QuestionsTypes::passive_image->value);

        $version = $this->getVersion();

        $fullFilePath = $this->mainPath.'/dragontail-'.$version;

        $imagesDirectory = $fullFilePath.'/'.$version.'/img/passive/';
        $champs = $this->getChampions();

        if($this->filesystem->exists($targetFolder)){
            $this->filesystem->remove($targetFolder);
        }
        $this->filesystem->mkdir($targetFolder);

        foreach($champs as $champion){

            $championData = $this->getChampionData($champion);

            $championFolderPath = $targetFolder.'/'.$champion;
            $this->filesystem->mkdir($championFolderPath);

            $fileName = $championData['passive']['image']['full'];
            $this->filesystem->copy($imagesDirectory.$fileName, $championFolderPath.'/'.$fileName);

            $this->filesystem->mkdir($championFolderPath.'/difficult');
            foreach(array(0,90,180,270) as $rotation){
                $this->imageEffect->createImageRotation($imagesDirectory.$fileName, $championFolderPath.'/difficult/'.(substr($fileName, 0 -4)).'_'.$rotation.'.png', $rotation);
            
                // create a new Questions object to the data base
                $question = new Questions();
                $question->setContent($championFolderPath.'/difficult/'.(substr($fileName, 0 -4)).'_'.$rotation.'.png');
                $question->setTitle('Quel champion à ce passif ?');
                $question->setType(QuestionsTypes::passive_image->value);
                $question->setAnswer($this->removeAccentsAndUpper($championData['name']));

                $this->em->persist($question);
            }

            // create a new Questions object to the data base
            $question = new Questions();
            $question->setContent($championFolderPath.'/'.$fileName);
            $question->setTitle('Quel champion à ce passif ?');
            $question->setType(QuestionsTypes::passive_image->value);
            $question->setAnswer($this->removeAccentsAndUpper($championData['name']));

            $this->em->persist($question);
            
        }
        $this->createVersionFile($targetFolder);

        $this->em->flush();
    }

    public function generateChampionLore(){

        $targetFolder = $this->mainPath.'/assets/';

        // check if it is up to date
        //if($this->isVersionFileUpToDate($targetFolder)){
        //    return;
        //}

        $questionsRepository = $this->em->getRepository(Questions::class);
        $questionsRepository->deleteByType(QuestionsTypes::lore->value);

        $champs = $this->getChampions();

        foreach($champs as $champion){

            $championData = $this->getChampionData($champion);

            $lore = $championData['blurb'];

            $lore = str_replace($championData['name'],str_repeat('*',6), $lore);

            // create a new Questions object to the data base
            $question = new Questions();
            $question->setContent($lore);
            $question->setTitle('Quel champion à ce lore ?');
            $question->setType(QuestionsTypes::lore->value);
            $question->setAnswer($this->removeAccentsAndUpper($championData['name']));

            $this->em->persist($question);
            
        }

        $this->em->flush();
    }
}
