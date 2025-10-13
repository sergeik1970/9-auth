import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Test } from "src/entities/Test/test.entity";
import { Repository } from "typeorm";

export interface CreateTestDto {
    title: string;
    description?: string;
    timeLimit?: number;
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}

@Injectable()
export class TestService {
    constructor(
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
    ) {}

    // Создание нового теста
    async createTest(createTestDto: CreateTestDto, user: JwtPayload): Promise<Test> {
        // Проверка роли учителя
        if (user.role !== "teacher") {
            throw new ForbiddenException("Только учителя могут создавать тесты");
        }

        const test = this.testRepository.create({
            ...createTestDto,
            creatorId: user.sub,
            status: "draft",
        });

        const savedTest = await this.testRepository.save(test);
        
        // Загружаем тест с creator
        return this.getTestById(savedTest.id);
    }

    // Получение всех тестов
    async getAllTests(): Promise<Test[]> {
        return this.testRepository.find({
            order: {
                createdAt: "DESC",
            },
        });
    }

    // Получение теста по ID
    async getTestById(id: number): Promise<Test> {
        const test = await this.testRepository.findOne({
            where: { id },
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${id} не найден`);
        }

        return test;
    }

    // Обновление теста
    async updateTest(id: number, updateData: Partial<CreateTestDto>, user: JwtPayload): Promise<Test> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException("Вы можете редактировать только свои тесты");
        }

        await this.testRepository.update(id, updateData);
        return this.getTestById(id);
    }

    // Удаление теста
    async deleteTest(id: number, user: JwtPayload): Promise<void> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException("Вы можете удалять только свои тесты");
        }

        await this.testRepository.delete(id);
    }
}