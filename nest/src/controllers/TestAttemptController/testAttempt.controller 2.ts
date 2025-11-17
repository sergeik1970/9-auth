import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { TestAttemptService } from "src/services/TestAttemptService/testAttempt.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("tests")
export class TestAttemptController {
    constructor(private readonly attemptService: TestAttemptService) {}

    @Post(":testId/attempts")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createAttempt(@Param("testId") testId: string, @Req() req: any) {
        return this.attemptService.createAttempt(Number(testId), req.user);
    }

    @Get(":testId/attempts/:attemptId")
    @UseGuards(JwtAuthGuard)
    getAttempt(
        @Param("testId") testId: string,
        @Param("attemptId") attemptId: string,
    ) {
        return this.attemptService.getAttempt(
            Number(testId),
            Number(attemptId),
        );
    }

    @Post(":testId/attempts/:attemptId/answers")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    saveAnswer(
        @Param("testId") testId: string,
        @Param("attemptId") attemptId: string,
        @Body()
        body: {
            questionId: number;
            selectedOptionId?: number;
            selectedOptionIds?: number[];
            textAnswer?: string;
        },
    ) {
        return this.attemptService.saveAnswer(
            Number(testId),
            Number(attemptId),
            body.questionId,
            body.selectedOptionId,
            body.selectedOptionIds,
            body.textAnswer,
        );
    }

    @Post(":testId/attempts/:attemptId/submit")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    submitTest(
        @Param("testId") testId: string,
        @Param("attemptId") attemptId: string,
        @Req() req: any,
    ) {
        return this.attemptService.submitTest(
            Number(testId),
            Number(attemptId),
            req.user,
        );
    }

    @Get(":testId/attempts/:attemptId/results")
    @UseGuards(JwtAuthGuard)
    getResults(
        @Param("testId") testId: string,
        @Param("attemptId") attemptId: string,
        @Req() req: any,
    ) {
        return this.attemptService.getResults(
            Number(testId),
            Number(attemptId),
            req.user,
        );
    }
}
