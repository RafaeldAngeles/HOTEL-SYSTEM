import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToRoom1781122139366 implements MigrationInterface {
    name = 'AddImageUrlToRoom1781122139366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room\` ADD \`image_url\` varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room\` DROP COLUMN \`image_url\``);
    }

}
