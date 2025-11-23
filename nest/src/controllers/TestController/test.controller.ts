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
    getAllTests() {
        return this.testService.getAllTests();
    }

    @Get("active-attempts")
    @UseGuards(JwtAuthGuard)
    getActiveAttempts(@Req() req: any) {
        return this.attemptService.getActiveAttempts(req.user);
    }

    @Get(":id")
    getTestById(@Param("id", ParseIntPipe) id: number) {
        return this.testService.getTestById(id);
    }

    @Post("create")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createTest(@Body() createTestDto: CreateTestDto, @Req() req: any) {
        return this.testService.createTest(createTestDto, req.user);
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
