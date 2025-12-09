import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    HttpStatus,
    UseGuards,
    Patch,
} from "@nestjs/common";
import { Response, Request } from "express";
import {
    AuthService,
    RegisterDto,
    LoginDto,
    UpdateProfileDto,
    UpdateGradingCriteriaDto,
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

            const token = this.authService.generateToken(user);

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie("userId", user.id.toString(), {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            const { password, ...userWithoutPassword } = user;

            return res.status(HttpStatus.CREATED).json({
                message: "Пользователь успешно зарегистрирован",
                token,
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
            console.log("\n=== LOGIN START ===");
            const user = await this.authService.login(loginDto);
            console.log("User logged in:", user.id);

            const token = this.authService.generateToken(user);
            console.log("Token generated, length:", token.length);

            console.log("Setting cookie with options:", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie("userId", user.id.toString(), {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            console.log("Cookies set, sending response");
            const { password, ...userWithoutPassword } = user;

            return res.status(HttpStatus.OK).json({
                message: "Успешный вход в систему",
                token,
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("=== LOGIN ERROR ===", error);
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
            res.clearCookie("userId", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            });

            res.clearCookie("token", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
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

    @Patch("profile")
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Body() updateDto: UpdateProfileDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const userId = req["user"].sub;
            const user = await this.authService.updateProfile(
                userId,
                updateDto,
            );

            // Перегенерируем токен если изменили класс
            const classChanged =
                updateDto.classNumber !== undefined ||
                updateDto.classLetter !== undefined;

            if (classChanged) {
                const newToken = this.authService.generateToken(user);
                res.cookie("token", newToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });

                const { password, ...userWithoutPassword } = user;
                return res.status(HttpStatus.OK).json({
                    message: "Профиль успешно обновлён",
                    user: userWithoutPassword,
                    token: newToken,
                });
            }

            const { password, ...userWithoutPassword } = user;
            return res.status(HttpStatus.OK).json({
                message: "Профиль успешно обновлён",
                user: userWithoutPassword,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message,
            });
        }
    }

    @Patch("grading-criteria")
    async updateGradingCriteria(
        @Body() updateDto: UpdateGradingCriteriaDto & { userId?: string },
        @Res() res: Response,
    ) {
        try {
            console.log("=== GRADING-CRITERIA PATCH ===");
            console.log("Body:", updateDto);

            const userId = updateDto.userId ? parseInt(updateDto.userId) : null;
            if (!userId) {
                console.log("❌ No userId provided");
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "UserId не предоставлен",
                });
            }

            console.log("Updating grading criteria for userId:", userId);
            const user = await this.authService.updateGradingCriteria(
                userId,
                updateDto,
            );
            console.log("✅ Grading criteria updated successfully");
            const { password, ...userWithoutPassword } = user;
            return res.status(HttpStatus.OK).json({
                message: "Критерии оценок успешно обновлены",
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("Error updating grading criteria:", error);
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message,
            });
        }
    }
}
