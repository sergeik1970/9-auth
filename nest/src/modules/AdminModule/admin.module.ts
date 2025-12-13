import { Module } from "@nestjs/common";
import { AdminService } from "src/services/AdminService/admin.service";
import { AdminController } from "src/controllers/AdminController/admin.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/User/user.entity";
import { Test } from "src/entities/Test/test.entity";
import { TestAttempt } from "src/entities/TestAttempt/testAttempt.entity";
import { Region } from "src/entities/Region/region.entity";
import { School } from "src/entities/School/school.entity";
import { Settlement } from "src/entities/Settlement/settlement.entity";
import { AuthModule } from "../AuthModule/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Test, TestAttempt, Region, School, Settlement]),
        AuthModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
