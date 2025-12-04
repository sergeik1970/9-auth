import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDueDateToTests1734101600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "tests",
            new TableColumn({
                name: "dueDate",
                type: "timestamp",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("tests", "dueDate");
    }
}
