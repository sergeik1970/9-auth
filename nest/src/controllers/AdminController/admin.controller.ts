import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Req,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { AdminService } from "src/services/AdminService/admin.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";
import { AdminGuard } from "src/modules/AuthModule/admin.guard";

@Controller("admin")
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get("users")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getAllUsers(@Req() req: any) {
        return this.adminService.getAllUsers(req.user);
    }

    @Get("users/:id")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getUserById(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.getUserById(id, req.user);
    }

    @Put("users/:id")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    updateUser(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateData: any,
        @Req() req: any,
    ) {
        return this.adminService.updateUser(id, updateData, req.user);
    }

    @Delete("users/:id")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    deleteUser(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.deleteUser(id, req.user);
    }
}
