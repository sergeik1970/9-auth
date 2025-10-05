import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entities/User/user.entity";
import * as bcrypt from "bcrypt";

export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<User> {
        console.log("AuthService.register called");
        const { email, password, name } = registerDto;
        console.log("Data:", { email, name, passwordLength: password?.length });

        console.log("Checking for existing user...");
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        console.log("Existing user:", existingUser ? "Found" : "Not found");

        if (existingUser) {
            throw new ConflictException(
                "Пользователь с таким email уже существует",
            );
        }

        console.log("Hashing password...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed successfully");

        console.log("Creating user entity...");
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            name,
            isAdmin: false,
        });
        console.log("User entity created:", user);

        console.log("Saving user to database...");
        const savedUser = await this.userRepository.save(user);
        console.log("User saved successfully:", savedUser.id);

        return savedUser;
    }

    async login(loginDto: LoginDto): Promise<User> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException("Неверный логин или пароль");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Неверный логин или пароль");
        }

        return user;
    }

    async findUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    generateToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
        };
        return this.jwtService.sign(payload);
    }
}
