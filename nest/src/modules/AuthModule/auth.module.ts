import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { User } from "src/entities/User/user.entity";
import { AuthService } from "src/services/AuthService/auth.service";
import { AuthController } from "src/controllers/AuthController/auth.controller";
import { JwtAuthGuard } from "./jwt-auth.guard";
// import { AdminGuard } from "./admin.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || "your-secret-key",
            signOptions: { expiresIn: "7d" },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard],
    exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
