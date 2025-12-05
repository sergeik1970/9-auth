import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddClassNumberAndClassLetterToUser1764936746714 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "classNumber",
                type: "int",
                isNullable: true,
            }),
        );

        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "classLetter",
                type: "varchar",
                length: "1",
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "classLetter");
        await queryRunner.dropColumn("user", "classNumber");
    }
}
