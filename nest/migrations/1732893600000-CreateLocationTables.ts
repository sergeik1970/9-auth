import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLocationTables1732893600000 implements MigrationInterface {
    name = 'CreateLocationTables1732893600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "region" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_3a9a5c3db3d0fc46f23d5e9e13" UNIQUE ("name"), CONSTRAINT "PK_12ea3fac99f81474ce7713bfcc6" PRIMARY KEY ("id"))`);
        
        await queryRunner.query(`CREATE TABLE "settlement" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "regionId" integer NOT NULL, CONSTRAINT "PK_55ac2c0eef76c036dd31c12b1be" PRIMARY KEY ("id"))`);
        
        await queryRunner.query(`CREATE TABLE "school" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "settlementId" integer NOT NULL, CONSTRAINT "PK_270bff1a2e9bff5ff207e22bcc0" PRIMARY KEY ("id"))`);
        
        await queryRunner.query(`ALTER TABLE "settlement" ADD CONSTRAINT "FK_region_settlement" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE CASCADE`);
        
        await queryRunner.query(`ALTER TABLE "school" ADD CONSTRAINT "FK_settlement_school" FOREIGN KEY ("settlementId") REFERENCES "settlement"("id") ON DELETE CASCADE`);
        
        await queryRunner.query(`ALTER TABLE "user" ADD "regionId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "settlementId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "schoolId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "educationalInstitutionCustom" text`);
        
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_region_user" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_settlement_user" FOREIGN KEY ("settlementId") REFERENCES "settlement"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_school_user" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_school_user"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_settlement_user"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_region_user"`);
        
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "educationalInstitutionCustom"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "schoolId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "settlementId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "regionId"`);
        
        await queryRunner.query(`ALTER TABLE "school" DROP CONSTRAINT "FK_settlement_school"`);
        await queryRunner.query(`ALTER TABLE "settlement" DROP CONSTRAINT "FK_region_settlement"`);
        
        await queryRunner.query(`DROP TABLE "school"`);
        await queryRunner.query(`DROP TABLE "settlement"`);
        await queryRunner.query(`DROP TABLE "region"`);
    }
}
