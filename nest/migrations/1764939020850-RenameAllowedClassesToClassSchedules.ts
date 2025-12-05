import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameAllowedClassesToClassSchedules1764939020850 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Получаем существующие данные
        const tests = await queryRunner.query("SELECT id, \"allowedClasses\" FROM tests");

        // Удаляем старый столбец
        await queryRunner.dropColumn("tests", "allowedClasses");

        // Создаем новый столбец
        await queryRunner.addColumn(
            "tests",
            new TableColumn({
                name: "classSchedules",
                type: "json",
                isNullable: false,
                default: "json_array()",
            }),
        );

        // Конвертируем данные: добавляем пустой dueDate к каждому классу
        for (const test of tests) {
            if (test.allowedClasses && Array.isArray(test.allowedClasses)) {
                const classSchedules = test.allowedClasses.map((cls: any) => ({
                    ...cls,
                    dueDate: "",
                }));
                await queryRunner.query(
                    `UPDATE tests SET "classSchedules" = $1 WHERE id = $2`,
                    [JSON.stringify(classSchedules), test.id],
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Получаем существующие данные
        const tests = await queryRunner.query("SELECT id, \"classSchedules\" FROM tests");

        // Удаляем новый столбец
        await queryRunner.dropColumn("tests", "classSchedules");

        // Создаем старый столбец
        await queryRunner.addColumn(
            "tests",
            new TableColumn({
                name: "allowedClasses",
                type: "json",
                isNullable: false,
                default: "json_array()",
            }),
        );

        // Конвертируем данные обратно: удаляем dueDate
        for (const test of tests) {
            if (test.classSchedules && Array.isArray(test.classSchedules)) {
                const allowedClasses = test.classSchedules.map((schedule: any) => ({
                    classNumber: schedule.classNumber,
                    classLetter: schedule.classLetter,
                }));
                await queryRunner.query(
                    `UPDATE tests SET "allowedClasses" = $1 WHERE id = $2`,
                    [JSON.stringify(allowedClasses), test.id],
                );
            }
        }
    }
}
