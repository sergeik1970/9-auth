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
import { TestService, CreateTestDto } from "../../services/TestService/test.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("tests")
export class TestController {
    constructor(private readonly testService: TestService) {}

    @Get()
    getAllTests() {
        return this.testService.getAllTests();
    }

    @Get(":id")
    getTestById(@Param("id") id: string) {
        return this.testService.getTestById(Number(id));
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
        @Param("id") id: string,
        @Body() updateData: Partial<CreateTestDto>,
        @Req() req: any,
    ) {
        return this.testService.updateTest(Number(id), updateData, req.user);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTest(@Param("id") id: string, @Req() req: any) {
        return this.testService.deleteTest(Number(id), req.user);
    }
}