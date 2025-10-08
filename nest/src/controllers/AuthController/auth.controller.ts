import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    HttpStatus,
    UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";
import {
    AuthService,
    RegisterDto,
    LoginDto,
} from "src/services/AuthService/auth.service";
import { JwtAuthGuard } from "src/modules/AuthModule/jwt-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
        try {
            console.log("=== REGISTER START ===");
            console.log("Received data:", registerDto);

            const user = await this.authService.register(registerDto);
            console.log("User created successfully:", user.id);

            res.cookie("userId", user.id.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            const { password, ...userWithoutPassword } = user;

            return res.status(HttpStatus.CREATED).json({
                message: "Пользователь успешно зарегистрирован",
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("=== REGISTER ERROR ===");
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);

            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message,
            });
        }
    }

    @Post("login")
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        try {
            const user = await this.authService.login(loginDto);

            const token = this.authService.generateToken(user);

            res.cookie("userId", user.id.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            const { password, ...userWithoutPassword } = user;

            return res.status(HttpStatus.OK).json({
                message: "Успешный вход в систему",
                user: userWithoutPassword,
                token: token,
            });
        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: error.message,
            });
        }
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req: Request, @Res() res: Response) {
        try {
            // Получаем userId из payload токена (добавлен в request через JwtAuthGuard)
            const userId = req["user"].sub;

            const user = await this.authService.getUserByToken(userId);

            const { password, ...userWithoutPassword } = user;

            return res.status(HttpStatus.OK).json({
                user: userWithoutPassword,
            });
        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: error.message,
            });
        }
    }

    @Post("logout")
    async logout(@Res() res: Response) {
        try {
            // Очищаем cookie userId
            res.clearCookie("userId", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });

            return res.status(HttpStatus.OK).json({
                message: "Успешный выход из системы",
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Ошибка при выходе из системы",
            });
        }
    }
}
