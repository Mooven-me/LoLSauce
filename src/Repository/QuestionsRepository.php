<?php

namespace App\Repository;

use App\Entity\Questions;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Questions>
 */
class QuestionsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Questions::class);
    }

    

    public function deleteAll(){
            $query = $this->createQueryBuilder('q')
                    ->delete()
                    ->getQuery()
                    ->execute();
            return $query;
    }

    public function deleteByType(string $type){
            $query = $this->createQueryBuilder('q')
                    ->andWhere('q.type = :type')
                    ->setParameter('type', $type)
                    ->delete()
                    ->getQuery()
                    ->execute();
            return $query;
    }

    public function countByType(string $type): int
    {
        return $this->createQueryBuilder('q')
            ->select('COUNT(q)')
            ->andWhere('q.type = :type')
            ->setParameter('type', $type)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findOneRandomly(){

        return $this->createQueryBuilder('q')
        ->orderBy('RAND()')
        ->setMaxResults(1)
        ->getQuery()
        ->getOneOrNullResult();
    }

    public function findOneRandomEqualy(){
        $type = $this->createQueryBuilder('q')
                ->select('q.type')
                ->groupBy('q.type')
                ->orderBy('RAND()')
                ->setMaxResults(1)
                ->getQuery()
                ->getOneOrNullResult();
        
        return $this->createQueryBuilder('q')
                ->orderBy('RAND()')
                ->andWhere('q.type = :type')
                ->setParameter('type', $type)
                ->setMaxResults(1)
                ->getQuery()
                ->getOneOrNullResult();

    }

}
