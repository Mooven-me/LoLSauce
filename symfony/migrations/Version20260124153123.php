<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260124153123 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD avatar_link VARCHAR(255) DEFAULT NULL, CHANGE username username VARCHAR(32) NOT NULL, CHANGE user_room_id discord_id VARCHAR(255) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_8D93D64943349DE ON user (discord_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_8D93D64943349DE ON user
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD user_room_id VARCHAR(255) DEFAULT NULL, DROP discord_id, DROP avatar_link, CHANGE username username VARCHAR(15) NOT NULL
        SQL);
    }
}
