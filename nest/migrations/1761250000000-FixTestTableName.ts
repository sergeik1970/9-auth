import { MigrationInterface, QueryRunner, TableExists } from "typeorm";

export class FixTestTableName1761250000000 implements MigrationInterface {
    name = 'FixTestTableName1761250000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Проверяем, существует ли таблица "test" (старое название)
        const testTableExists = await queryRunner.hasTable("test");
        const testsTableExists = await queryRunner.hasTable("tests");

        if (testTableExists && !testsTableExists) {
            // Переименовываем таблицу с "test" на "tests"
            await queryRunner.query(`ALTER TABLE "test" RENAME TO "tests"`);
            console.log("Renamed table 'test' to 'tests'");
        }

        if (testTableExists && testsTableExists) {
            // Если обе таблицы существуют, удаляем старую
            await queryRunner.query(`DROP TABLE "test"`);
            console.log("Dropped duplicate table 'test'");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Откатываем переименование
        const testsTableExists = await queryRunner.hasTable("tests");
        if (testsTableExists) {
            await queryRunner.query(`ALTER TABLE "tests" RENAME TO "test"`);
        }
    }
}