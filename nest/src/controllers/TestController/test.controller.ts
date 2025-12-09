import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
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
    private readonly logger = new Logger(TestController.name);

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
        this.logger.log(`[POST /tests/${id}/publish] publishTest called`);
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
    @UseGuards(JwtAuthGuard)
    getTestById(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.testService.getTestById(id, req.user);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    updateTest(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateData: Partial<CreateTestDto>,
        @Req() req: any,
    ) {
        console.log(`[PATCH /tests/${id}] Controller received:`, {
            bodyKeys: Object.keys(updateData),
            hasClassSchedules: !!updateData.classSchedules,
            classSchedules: updateData.classSchedules,
        });
        this.logger.log(`[PATCH /tests/${id}] updateTest called`, {
            hasClassSchedules: !!updateData.classSchedules,
            classSchedulesLength: updateData.classSchedules?.length || 0,
            classSchedules: updateData.classSchedules,
        });
        return this.testService.updateTest(id, updateData, req.user);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTest(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.testService.deleteTest(id, req.user);
    }
}
