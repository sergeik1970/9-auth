import { Injectable } from "@nestjs/common";

// Благодаря @injectable() мы можем использовать AppService в других модулях
@Injectable()
export class AppService {
    // Метод getHello() для проверки
    getHello(): string {
        return "Hello World!asda";
    }
}
