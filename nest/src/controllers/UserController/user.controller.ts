import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { UserService } from "../../services/UserService/user.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("students")
    @UseGuards(JwtAuthGuard)
    getAllStudents(@Req() req: any) {
        return this.userService.getAllStudents(req.user);
    }
}
