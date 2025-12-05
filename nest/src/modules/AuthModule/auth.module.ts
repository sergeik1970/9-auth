import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { User } from "src/entities/User/user.entity";
import { School } from "src/entities/School/school.entity";
import { AuthService } from "src/services/AuthService/auth.service";
import { AuthController } from "src/controllers/AuthController/auth.controller";
import { JwtAuthGuard } from "./jwt-auth.guard";
// import { AdminGuard } from "./admin.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, School]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || "your-secret-key",
            signOptions: { expiresIn: "30d" },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard],
    exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
