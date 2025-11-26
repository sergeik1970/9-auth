import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "src/entities/User/user.entity";

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getAllStudents(user: JwtPayload): Promise<Partial<User>[]> {
        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException(
                "Только учителя могут просматривать список студентов",
            );
        }

        const students = await this.userRepository.find({
            where: { role: UserRole.STUDENT },
            select: ["id", "name", "email", "createdAt"],
            order: { name: "ASC" },
        });

        return students;
    }
}
