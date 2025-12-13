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

    @Post("settlements")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    createSettlement(@Body() body: any, @Req() req: any) {
        return this.adminService.createSettlement(body.regionId, body.name, req.user);
    }

    @Get("settlements")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getSettlements(@Req() req: any) {
        return this.adminService.getSettlements(undefined, req.user);
    }

    @Get("regions/:regionId/settlements")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getSettlementsByRegion(
        @Param("regionId", ParseIntPipe) regionId: number,
        @Req() req: any,
    ) {
        return this.adminService.getSettlements(regionId, req.user);
    }

    @Post("schools")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    createSchool(@Body() body: any, @Req() req: any) {
        return this.adminService.createSchool(body.regionId, body.settlementId, body.name, req.user);
    }

    @Get("schools")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getSchools(@Req() req: any) {
        return this.adminService.getSchools(undefined, req.user);
    }

    @Get("settlements/:settlementId/schools")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getSchoolsBySettlement(
        @Param("settlementId", ParseIntPipe) settlementId: number,
        @Req() req: any,
    ) {
        return this.adminService.getSchools(settlementId, req.user);
    }

    @Get("schools/:id")
    @UseGuards(JwtAuthGuard, AdminGuard)
    getSchoolById(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.getSchoolById(id, req.user);
    }

    @Put("schools/:id")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    updateSchool(@Param("id", ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
        return this.adminService.updateSchool(
            id,
            body.regionId,
            body.settlementId,
            body.name,
            req.user,
        );
    }

    @Delete("schools/:id")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    deleteSchool(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.deleteSchool(id, req.user);
    }
}
