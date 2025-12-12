import { Module } from "@nestjs/common";
import { DealsModule } from "./modules/DealsModule/deal.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/AuthModule/auth.module";
import { TestModule } from "./modules/TestModule/test.module";
import { QuestionModule } from "./modules/QuestionModule/question.module";
import { UserModule } from "./modules/UserModule/user.module";
import { RegionModule } from "./modules/RegionModule/region.module";
import { AdminModule } from "./modules/AdminModule/admin.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.NODE_ENV == "dev" ? "127.0.0.1" : "db",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            autoLoadEntities: true,
            synchronize: false,
        }),
        DealsModule,
        AuthModule,
        TestModule,
        QuestionModule,
        UserModule,
        RegionModule,
        AdminModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
