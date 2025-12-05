import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAllowedClassesToTest1764939020849 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "tests",
            new TableColumn({
                name: "allowedClasses",
                type: "json",
                isNullable: false,
                default: "json_array()",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("tests", "allowedClasses");
    }
}
