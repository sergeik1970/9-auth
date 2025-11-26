import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArchievedStatus1764166029583 implements MigrationInterface {
    name = 'AddArchievedStatus1764166029583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP COLUMN "percentage"`);
        await queryRunner.query(`ALTER TYPE "public"."tests_status_enum" RENAME TO "tests_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tests_status_enum" AS ENUM('draft', 'active', 'completed', 'archived')`);
        await queryRunner.query(`ALTER TABLE "tests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tests" ALTER COLUMN "status" TYPE "public"."tests_status_enum" USING "status"::"text"::"public"."tests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tests" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."tests_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tests_status_enum_old" AS ENUM('draft', 'active', 'completed')`);
        await queryRunner.query(`ALTER TABLE "tests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tests" ALTER COLUMN "status" TYPE "public"."tests_status_enum_old" USING "status"::"text"::"public"."tests_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tests" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."tests_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tests_status_enum_old" RENAME TO "tests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD "percentage" numeric(5,2) DEFAULT NULL`);
    }

}
