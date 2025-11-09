import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelectedOptionIdsToTestAnswers1730850000001 implements MigrationInterface {
    name = "AddSelectedOptionIdsToTestAnswers1730850000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_answers" ADD COLUMN "selectedOptionIds" text DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_answers" DROP COLUMN "selectedOptionIds"`);
    }
}
