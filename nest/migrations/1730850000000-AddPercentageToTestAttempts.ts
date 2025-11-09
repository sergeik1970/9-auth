import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPercentageToTestAttempts1730850000000 implements MigrationInterface {
    name = "AddPercentageToTestAttempts1730850000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_attempts" ADD COLUMN "percentage" decimal(5,2) DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP COLUMN "percentage"`);
    }
}
