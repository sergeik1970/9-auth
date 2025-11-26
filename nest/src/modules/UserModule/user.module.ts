import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/User/user.entity";
import { UserController } from "src/controllers/UserController/user.controller";
import { UserService } from "src/services/UserService/user.service";
import { AuthModule } from "../AuthModule/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([User]), AuthModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
