import { Module } from "@nestjs/common";
import { DealsModule } from "./modules/DealsModule/deal.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/AuthModule/auth.module";
import { TestModule } from "./modules/TestModule/test.module";
import { QuestionModule } from "./modules/QuestionModule/question.module";

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
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
