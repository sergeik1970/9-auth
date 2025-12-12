import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRoleToEnum1734107400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" ADD VALUE 'admin' AFTER 'student'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "user_role_enum" WHERE enumlabel = 'admin'`);
    }
}
