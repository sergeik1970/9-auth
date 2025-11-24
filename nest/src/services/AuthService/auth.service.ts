import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole } from "src/entities/User/user.entity";
import * as bcrypt from "bcrypt";

export interface RegisterDto {
    email: string;
    password: string;
    name: string;
    role: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface UpdateProfileDto {
    name?: string;
    avatar?: string;
    password?: string;
    currentPassword?: string;
}

export interface GradingCriteria {
    excellent: number;
    good: number;
    satisfactory: number;
    poor: number;
}

export interface UpdateGradingCriteriaDto {
    gradingCriteria: GradingCriteria;
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
        const { email, password, name, role } = registerDto;
        console.log("Data:", {
            email,
            name,
            role,
            passwordLength: password?.length,
        });

        // Валидация роли
        if (!["student", "teacher"].includes(role)) {
            throw new ConflictException("Роль должна быть student или teacher");
        }

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
            role: role as UserRole,
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

    async getUserByToken(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException("Пользователь не найден");
        }

        return user;
    }

    generateToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }

    async updateProfile(
        userId: number,
        updateDto: UpdateProfileDto,
    ): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException("Пользователь не найден");
        }

        if (updateDto.password) {
            if (!updateDto.currentPassword) {
                throw new ConflictException(
                    "Требуется текущий пароль для изменения пароля",
                );
            }

            const isPasswordValid = await bcrypt.compare(
                updateDto.currentPassword,
                user.password,
            );
            if (!isPasswordValid) {
                throw new UnauthorizedException("Неверный текущий пароль");
            }

            const saltRounds = 10;
            user.password = await bcrypt.hash(updateDto.password, saltRounds);
        }

        if (updateDto.name) {
            user.name = updateDto.name;
        }

        if (updateDto.avatar !== undefined) {
            user.avatar = updateDto.avatar;
        }

        return this.userRepository.save(user);
    }

    async updateGradingCriteria(
        userId: number,
        updateDto: UpdateGradingCriteriaDto,
    ): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException("Пользователь не найден");
        }

        const criteria = updateDto.gradingCriteria;

        if (
            criteria.excellent <= 0 ||
            criteria.good <= 0 ||
            criteria.satisfactory <= 0 ||
            criteria.poor <= 0
        ) {
            throw new ConflictException("Все критерии должны быть > 0");
        }

        if (
            criteria.excellent > 100 ||
            criteria.good > 100 ||
            criteria.satisfactory > 100 ||
            criteria.poor > 100
        ) {
            throw new ConflictException("Все критерии должны быть <= 100");
        }

        if (
            !(
                criteria.excellent > criteria.good &&
                criteria.good > criteria.satisfactory &&
                criteria.satisfactory > criteria.poor
            )
        ) {
            throw new ConflictException(
                "Критерии должны быть в порядке убывания: excellent > good > satisfactory > poor",
            );
        }

        user.gradingCriteria = criteria;
        return this.userRepository.save(user);
    }
}
