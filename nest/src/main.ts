import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix("api");

    if (process.env.NODE_ENV == "dev")
        app.enableCors({
            origin: [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
            ],
            credentials: true,
        });
    await app.listen(3001);
}
bootstrap();
