import { Module } from "@nestjs/common";
import { TestService } from "src/services/TestService/test.service";
import { TestController } from "src/controllers/TestController/test.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Test } from "src/entities/Test/test.entity";
import { AuthModule } from "../AuthModule/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([Test]), AuthModule],
    controllers: [TestController],
    providers: [TestService],
})
export class TestModule {}