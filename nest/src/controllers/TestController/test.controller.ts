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
    ParseIntPipe,
} from "@nestjs/common";
import {
    TestService,
    CreateTestDto,
} from "../../services/TestService/test.service";
import { TestAttemptService } from "src/services/TestAttemptService/testAttempt.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("tests")
export class TestController {
    constructor(
        private readonly testService: TestService,
        private readonly attemptService: TestAttemptService,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    getAllTests(@Req() req: any) {
        return this.testService.getAllTests(req.user);
    }

    @Get("active-attempts")
    @UseGuards(JwtAuthGuard)
    getActiveAttempts(@Req() req: any) {
        return this.attemptService.getActiveAttempts(req.user);
    }

    @Get(":id/attempts")
    @UseGuards(JwtAuthGuard)
    getTestAttempts(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.attemptService.getAttemptsByTestId(id, req.user);
    }

    @Post("create")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createTest(@Body() createTestDto: CreateTestDto, @Req() req: any) {
        return this.testService.createTest(createTestDto, req.user);
    }

    @Post(":id/publish")
    @UseGuards(JwtAuthGuard)
    publishTest(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.testService.publishTest(id, req.user);
    }

    @Post(":id/complete")
    @UseGuards(JwtAuthGuard)
    completeTest(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.testService.completeTest(id, req.user);
    }

    @Post(":id/archive")
    @UseGuards(JwtAuthGuard)
    archiveTest(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.testService.archiveTest(id, req.user);
    }

    @Post(":id/recalculate")
    @UseGuards(JwtAuthGuard)
    recalculateAttempts(
        @Param("id", ParseIntPipe) id: number,
        @Body("timeRangeHours") timeRangeHours: number,
        @Req() req: any,
    ) {
        return this.testService.recalculateAttempts(
            id,
            timeRangeHours,
            req.user,
        );
    }

    @Get(":id")
    getTestById(@Param("id", ParseIntPipe) id: number) {
        return this.testService.getTestById(id);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    updateTest(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateData: Partial<CreateTestDto>,
        @Req() req: any,
    ) {
        return this.testService.updateTest(id, updateData, req.user);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTest(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.testService.deleteTest(id, req.user);
    }
}
