import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarAndGradingCriteriaToUser1761350000000
  implements MigrationInterface
{
  name = "AddAvatarAndGradingCriteriaToUser1761350000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "avatar" text DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "gradingCriteria" jsonb DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "gradingCriteria"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
  }
}
