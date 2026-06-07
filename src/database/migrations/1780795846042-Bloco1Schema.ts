import { MigrationInterface, QueryRunner } from "typeorm";

export class Bloco1Schema1780795846042 implements MigrationInterface {
    name = 'Bloco1Schema1780795846042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`revoked_token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`jti\` varchar(64) NOT NULL, \`user_id\` int NOT NULL, \`expires_at\` datetime NOT NULL, \`revoked_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_51805a32c382d2841b953c1688\` (\`jti\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`payment_id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(10,2) NOT NULL, \`method\` enum ('credit_card', 'pix', 'invoice') NOT NULL, \`status\` enum ('pending', 'paid', 'refunded', 'failed') NOT NULL DEFAULT 'pending', \`installments\` int NOT NULL DEFAULT '1', \`card_token\` varchar(255) NULL, \`pix_code\` text NULL, \`pix_key\` varchar(120) NULL, \`pix_expires_at\` datetime NULL, \`paid_at\` datetime NULL, \`created\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reservation_id\` int NULL, PRIMARY KEY (\`payment_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD \`status\` enum ('available', 'occupied', 'cleaning', 'maintenance') NOT NULL DEFAULT 'available'`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD \`floor\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guests\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guest_name\` varchar(120) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guest_email\` varchar(120) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guest_phone\` varchar(30) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guest_cpf\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` CHANGE \`status\` \`status\` enum ('reservado', 'disponivel', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'reservado'`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_fc0069dbffe962f7b1604c14104\` FOREIGN KEY (\`reservation_id\`) REFERENCES \`reservation\`(\`id_reservation\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_fc0069dbffe962f7b1604c14104\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` CHANGE \`status\` \`status\` enum ('reservado', 'disponivel') NOT NULL DEFAULT 'reservado'`);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guest_cpf\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guest_phone\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guest_email\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guest_name\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guests\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP COLUMN \`floor\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP COLUMN \`status\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP INDEX \`IDX_51805a32c382d2841b953c1688\` ON \`revoked_token\``);
        await queryRunner.query(`DROP TABLE \`revoked_token\``);
    }

}
