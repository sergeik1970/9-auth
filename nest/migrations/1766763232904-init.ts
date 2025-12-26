import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766763232904 implements MigrationInterface {
    name = 'Init1766763232904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_options" ("id" SERIAL NOT NULL, "text" text NOT NULL, "isCorrect" boolean NOT NULL DEFAULT false, "order" integer NOT NULL, "questionId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_13be20e51c0738def32f00cf7d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."test_attempts_status_enum" AS ENUM('in_progress', 'completed', 'abandoned')`);
        await queryRunner.query(`CREATE TABLE "test_attempts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "testId" integer NOT NULL, "status" "public"."test_attempts_status_enum" NOT NULL DEFAULT 'in_progress', "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, "score" numeric(5,2), "correctAnswers" integer, "totalQuestions" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d40272f8162c607f12e76c0a18e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "test_answers" ("id" SERIAL NOT NULL, "attemptId" integer NOT NULL, "questionId" integer NOT NULL, "selectedOptionId" integer, "selectedOptionIds" text, "textAnswer" text, "selectedOptionText" text, "isCorrect" boolean, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da470ae2a8b940780d0cd6211f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."questions_type_enum" AS ENUM('single_choice', 'multiple_choice', 'text_input')`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" SERIAL NOT NULL, "text" text NOT NULL, "type" "public"."questions_type_enum" NOT NULL, "order" integer NOT NULL, "correctTextAnswer" text, "testId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tests_status_enum" AS ENUM('draft', 'active', 'completed', 'archived')`);
        await queryRunner.query(`CREATE TABLE "tests" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "timeLimit" integer, "dueDate" TIMESTAMP, "status" "public"."tests_status_enum" NOT NULL DEFAULT 'draft', "creatorId" integer NOT NULL, "classSchedules" json NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4301ca51edf839623386860aed2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "school" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "settlementId" integer NOT NULL, CONSTRAINT "PK_57836c3fe2f2c7734b20911755e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "settlement" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "regionId" integer NOT NULL, CONSTRAINT "PK_23997ae6972574beb45af0177ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "region" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_8d766fc1d4d2e72ecd5f6567a02" UNIQUE ("name"), CONSTRAINT "PK_5f48ffc3af96bc486f5f3f3a6da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('teacher', 'student', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "lastName" character varying, "patronymic" character varying, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'student', "avatar" text, "gradingCriteria" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "regionId" integer, "settlementId" integer, "schoolId" integer, "educationalInstitutionCustom" text, "classNumber" integer, "classLetter" character varying(1), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deals" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "done" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8c66f03b250f613ff8615940b4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_options" ADD CONSTRAINT "FK_c654af7759a681f1b1addbe35bf" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_c2d6de3ee467f1b42f22a30d5a4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_117d71338d1aad502bf5927b1e6" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_answers" ADD CONSTRAINT "FK_6bc1a0f671e47fd7780492444c1" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_answers" ADD CONSTRAINT "FK_f0ae0118e4b142f5bfc8b352009" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_answers" ADD CONSTRAINT "FK_b29188fdf527f05ccb962310310" FOREIGN KEY ("selectedOptionId") REFERENCES "question_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_94296641072b0f034d14e272cc6" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tests" ADD CONSTRAINT "FK_c78c65b756bcdf99c9361089d9c" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "school" ADD CONSTRAINT "FK_1c94466a3e27925840380d9afb5" FOREIGN KEY ("settlementId") REFERENCES "settlement"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "settlement" ADD CONSTRAINT "FK_aa30b56629fd475276b8e580b5e" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_f1a2565b8f2580a146871cf1142" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9a5839879e1d0900099ed82f1f2" FOREIGN KEY ("settlementId") REFERENCES "settlement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_709e51110daa2b560f0fc32367b" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_709e51110daa2b560f0fc32367b"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9a5839879e1d0900099ed82f1f2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f1a2565b8f2580a146871cf1142"`);
        await queryRunner.query(`ALTER TABLE "settlement" DROP CONSTRAINT "FK_aa30b56629fd475276b8e580b5e"`);
        await queryRunner.query(`ALTER TABLE "school" DROP CONSTRAINT "FK_1c94466a3e27925840380d9afb5"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP CONSTRAINT "FK_c78c65b756bcdf99c9361089d9c"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_94296641072b0f034d14e272cc6"`);
        await queryRunner.query(`ALTER TABLE "test_answers" DROP CONSTRAINT "FK_b29188fdf527f05ccb962310310"`);
        await queryRunner.query(`ALTER TABLE "test_answers" DROP CONSTRAINT "FK_f0ae0118e4b142f5bfc8b352009"`);
        await queryRunner.query(`ALTER TABLE "test_answers" DROP CONSTRAINT "FK_6bc1a0f671e47fd7780492444c1"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_117d71338d1aad502bf5927b1e6"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_c2d6de3ee467f1b42f22a30d5a4"`);
        await queryRunner.query(`ALTER TABLE "question_options" DROP CONSTRAINT "FK_c654af7759a681f1b1addbe35bf"`);
        await queryRunner.query(`DROP TABLE "deals"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "region"`);
        await queryRunner.query(`DROP TABLE "settlement"`);
        await queryRunner.query(`DROP TABLE "school"`);
        await queryRunner.query(`DROP TABLE "tests"`);
        await queryRunner.query(`DROP TYPE "public"."tests_status_enum"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
        await queryRunner.query(`DROP TABLE "test_answers"`);
        await queryRunner.query(`DROP TABLE "test_attempts"`);
        await queryRunner.query(`DROP TYPE "public"."test_attempts_status_enum"`);
        await queryRunner.query(`DROP TABLE "question_options"`);
    }

}
