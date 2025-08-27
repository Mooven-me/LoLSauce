<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250821172323 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE room_setting (room_id INT NOT NULL, setting_id INT NOT NULL, INDEX IDX_7356047854177093 (room_id), INDEX IDX_73560478EE35BD72 (setting_id), PRIMARY KEY(room_id, setting_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE setting (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, value VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room_setting ADD CONSTRAINT FK_7356047854177093 FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room_setting ADD CONSTRAINT FK_73560478EE35BD72 FOREIGN KEY (setting_id) REFERENCES setting (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE room_setting DROP FOREIGN KEY FK_7356047854177093
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room_setting DROP FOREIGN KEY FK_73560478EE35BD72
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE room_setting
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE setting
        SQL);
    }
}
