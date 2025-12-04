import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelectedOptionTextToTestAnswers1733358746000 implements MigrationInterface {
    name = "AddSelectedOptionTextToTestAnswers1733358746000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_answers" ADD COLUMN "selectedOptionText" text DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_answers" DROP COLUMN "selectedOptionText"`);
    }
}
