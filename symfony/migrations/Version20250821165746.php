<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250821165746 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE room ADD current_question_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room ADD CONSTRAINT FK_729F519BA0F35D66 FOREIGN KEY (current_question_id) REFERENCES questions (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_729F519BA0F35D66 ON room (current_question_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE room DROP FOREIGN KEY FK_729F519BA0F35D66
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_729F519BA0F35D66 ON room
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room DROP current_question_id
        SQL);
    }
}
