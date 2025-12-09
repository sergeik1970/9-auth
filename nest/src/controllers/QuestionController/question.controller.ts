import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import {
    QuestionService,
    CreateQuestionDto,
    UpdateQuestionDto,
} from "src/services/QuestionService/question.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("questions")
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    // Создание вопроса для теста
    @Post("test/:testId")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createQuestion(
        @Param("testId") testId: string,
        @Body() createQuestionDto: CreateQuestionDto,
        @Req() req: any,
    ) {
        return this.questionService.createQuestion(
            Number(testId),
            createQuestionDto,
            req.user,
        );
    }

    // Получение всех вопросов для теста
    @Get("test/:testId")
    @UseGuards(JwtAuthGuard)
    getQuestionsByTestId(@Param("testId") testId: string, @Req() req: any) {
        return this.questionService.getQuestionsByTestId(
            Number(testId),
            req.user,
        );
    }

    // Получение конкретного вопроса
    @Get(":id")
    @UseGuards(JwtAuthGuard)
    getQuestionById(@Param("id") id: string, @Req() req: any) {
        return this.questionService.getQuestionById(Number(id), req.user);
    }

    // Обновление вопроса
    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    updateQuestion(
        @Param("id") id: string,
        @Body() updateQuestionDto: UpdateQuestionDto,
        @Req() req: any,
    ) {
        return this.questionService.updateQuestion(
            Number(id),
            updateQuestionDto,
            req.user,
        );
    }

    // Удаление вопроса
    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteQuestion(@Param("id") id: string, @Req() req: any) {
        return this.questionService.deleteQuestion(Number(id), req.user);
    }
}
