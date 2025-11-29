import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastNamePatronymicToUser1732893600002 implements MigrationInterface {
    name = 'AddLastNamePatronymicToUser1732893600002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "patronymic" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "patronymic"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    }
}
