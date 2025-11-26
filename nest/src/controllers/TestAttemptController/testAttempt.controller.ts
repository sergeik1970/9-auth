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
    ParseIntPipe,
} from "@nestjs/common";
import { TestAttemptService } from "src/services/TestAttemptService/testAttempt.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("tests")
export class TestAttemptController {
    constructor(private readonly attemptService: TestAttemptService) {}

    @Post(":testId/attempts")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createAttempt(
        @Param("testId", ParseIntPipe) testId: number,
        @Req() req: any,
    ) {
        return this.attemptService.createAttempt(testId, req.user);
    }

    @Get(":testId/attempts/:attemptId")
    @UseGuards(JwtAuthGuard)
    getAttempt(
        @Param("testId", ParseIntPipe) testId: number,
        @Param("attemptId", ParseIntPipe) attemptId: number,
    ) {
        return this.attemptService.getAttempt(testId, attemptId);
    }

    @Post(":testId/attempts/:attemptId/answers")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    saveAnswer(
        @Param("testId", ParseIntPipe) testId: number,
        @Param("attemptId", ParseIntPipe) attemptId: number,
        @Body()
        body: {
            questionId: number;
            selectedOptionId?: number;
            selectedOptionIds?: number[];
            textAnswer?: string;
        },
    ) {
        return this.attemptService.saveAnswer(
            testId,
            attemptId,
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
        @Param("testId", ParseIntPipe) testId: number,
        @Param("attemptId", ParseIntPipe) attemptId: number,
        @Req() req: any,
    ) {
        return this.attemptService.submitTest(testId, attemptId, req.user);
    }

    @Get(":testId/attempts/:attemptId/results")
    @UseGuards(JwtAuthGuard)
    getResults(
        @Param("testId", ParseIntPipe) testId: number,
        @Param("attemptId", ParseIntPipe) attemptId: number,
        @Req() req: any,
    ) {
        return this.attemptService.getResults(testId, attemptId, req.user);
    }
}
