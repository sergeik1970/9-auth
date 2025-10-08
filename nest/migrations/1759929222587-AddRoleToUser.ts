import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUser1759929222587 implements MigrationInterface {
    name = 'AddRoleToUser1759929222587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'student'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    }

}
