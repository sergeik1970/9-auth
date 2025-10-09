import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromCookie(request);

        if (!token) {
            throw new UnauthorizedException("Токен не предоставлен");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || "your-secret-key",
            });

            // Добавляем данные пользователя в request
            request["user"] = payload;
        } catch (error) {
            throw new UnauthorizedException("Невалидный токен");
        }

        return true;
    }

    // private extractTokenFromHeader(request: Request): string | undefined {
    //     const [type, token] = request.headers.authorization?.split(" ") ?? [];
    //     return type === "Bearer" ? token : undefined;
    // }
    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.token;
    }
}
