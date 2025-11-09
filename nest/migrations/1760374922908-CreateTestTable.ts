import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTestTable1760374922908 implements MigrationInterface {
    name = 'CreateTestTable1760374922908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "test" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "timeLimit" integer, "status" character varying NOT NULL DEFAULT 'draft', "creatorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5417af0062cf987495b611b59c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "test" ADD CONSTRAINT "FK_ab6d476e7698322a3a35b5fdb12" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test" DROP CONSTRAINT "FK_ab6d476e7698322a3a35b5fdb12"`);
        await queryRunner.query(`DROP TABLE "test"`);
    }

}
