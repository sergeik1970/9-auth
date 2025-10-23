import { Module } from "@nestjs/common";
import { TestService } from "src/services/TestService/test.service";
import { TestController } from "src/controllers/TestController/test.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Test } from "src/entities/Test/test.entity";
import { Question } from "src/entities/Question/question.entity";
import { QuestionOption } from "src/entities/QuestionOption/questionOption.entity";
import { TestAttempt } from "src/entities/TestAttempt/testAttempt.entity";
import { TestAnswer } from "src/entities/TestAnswer/testAnswer.entity";
import { AuthModule } from "../AuthModule/auth.module";
import { QuestionModule } from "../QuestionModule/question.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Test, Question, QuestionOption, TestAttempt, TestAnswer]),
        AuthModule,
        QuestionModule,
    ],
    controllers: [TestController],
    providers: [TestService],
})
export class TestModule {}