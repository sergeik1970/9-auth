import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Question } from "src/entities/Question/question.entity";
import { QuestionOption } from "src/entities/QuestionOption/questionOption.entity";
import { Test } from "src/entities/Test/test.entity";
import { QuestionService } from "src/services/QuestionService/question.service";
import { QuestionController } from "src/controllers/QuestionController/question.controller";
import { AuthModule } from "../AuthModule/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Question, QuestionOption, Test]),
        AuthModule,
    ],
    controllers: [QuestionController],
    providers: [QuestionService],
    exports: [QuestionService],
})
export class QuestionModule {}
