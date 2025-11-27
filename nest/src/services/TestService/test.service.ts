import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Test, TestStatus } from "src/entities/Test/test.entity";
import { Question, QuestionType } from "src/entities/Question/question.entity";
import { QuestionOption } from "src/entities/QuestionOption/questionOption.entity";
import { Repository } from "typeorm";

export interface CreateQuestionOptionDto {
    text: string;
    isCorrect: boolean;
    order: number;
}

export interface CreateQuestionForTestDto {
    text: string;
    type: "single_choice" | "multiple_choice" | "text_input";
    order: number;
    options?: CreateQuestionOptionDto[];
    correctTextAnswer?: string;
}

export interface CreateTestDto {
    title: string;
    description?: string;
    timeLimit?: number;
    questions?: CreateQuestionForTestDto[];
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
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption)
        private readonly questionOptionRepository: Repository<QuestionOption>,
    ) {}

    // Создание нового теста
    async createTest(
        createTestDto: CreateTestDto,
        user: JwtPayload,
    ): Promise<Test> {
        // Проверка роли учителя
        if (user.role !== "teacher") {
            throw new ForbiddenException(
                "Только учителя могут создавать тесты",
            );
        }

        const { questions, ...testData } = createTestDto;

        const test = this.testRepository.create({
            ...testData,
            creatorId: user.sub,
            status: TestStatus.DRAFT,
        });

        const savedTest = await this.testRepository.save(test);

        // Если переданы вопросы, создаём их
        if (questions && questions.length > 0) {
            for (const questionDto of questions) {
                const question = this.questionRepository.create({
                    text: questionDto.text,
                    type: questionDto.type as QuestionType,
                    order: questionDto.order,
                    correctTextAnswer: questionDto.correctTextAnswer,
                    testId: savedTest.id,
                });

                const savedQuestion =
                    await this.questionRepository.save(question);

                // Если есть варианты ответов
                if (questionDto.options && questionDto.options.length > 0) {
                    const options = questionDto.options.map((opt) =>
                        this.questionOptionRepository.create({
                            text: opt.text,
                            isCorrect: opt.isCorrect,
                            order: opt.order,
                            questionId: savedQuestion.id,
                        }),
                    );
                    await this.questionOptionRepository.save(options);
                }
            }
        }

        // Загружаем тест с вопросами
        return this.getTestById(savedTest.id);
    }

    // Получение всех тестов
    async getAllTests(user?: JwtPayload): Promise<Test[]> {
        // Если пользователь преподаватель, показываем его собственные тесты
        if (user && user.role === "teacher") {
            return this.testRepository.find({
                where: { creatorId: user.sub },
                relations: ["creator", "questions", "questions.options"],
                order: {
                    createdAt: "DESC",
                },
            });
        }

        // Студентам и неавторизованным пользователям показываем только активные тесты
        return this.testRepository.find({
            where: { status: TestStatus.ACTIVE },
            relations: ["creator", "questions", "questions.options"],
            order: {
                createdAt: "DESC",
            },
        });
    }

    // Получение теста по ID
    async getTestById(id: number): Promise<Test> {
        const test = await this.testRepository.findOne({
            where: { id },
            relations: ["questions", "questions.options"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${id} не найден`);
        }

        return test;
    }

    // Обновление теста
    async updateTest(
        id: number,
        updateData: Partial<CreateTestDto>,
        user: JwtPayload,
    ): Promise<Test> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете редактировать только свои тесты",
            );
        }

        const { questions, ...testUpdateData } = updateData;

        // Обновляем вопросы если они были переданы
        if (questions && questions.length > 0) {

            // Получаем все вопросы текущего теста
            const oldQuestions = await this.questionRepository.find({
                where: { testId: id },
            });

            // Удаляем ответы на все вопросы этого теста перед удалением вопросов
            for (const question of oldQuestions) {
                await this.questionRepository
                    .createQueryBuilder()
                    .delete()
                    .from("test_answers")
                    .where("questionId = :questionId", {
                        questionId: question.id,
                    })
                    .execute();
            }

            // Удаляем старые вопросы и их варианты
            await this.questionRepository.delete({ testId: id });

            // Создаём новые вопросы
            for (const questionDto of questions) {
                const question = this.questionRepository.create({
                    text: questionDto.text,
                    type: questionDto.type as QuestionType,
                    order: questionDto.order,
                    correctTextAnswer: questionDto.correctTextAnswer,
                    testId: id,
                });

                const savedQuestion =
                    await this.questionRepository.save(question);

                // Если есть варианты ответов
                if (questionDto.options && questionDto.options.length > 0) {
                    const options = questionDto.options.map((opt) =>
                        this.questionOptionRepository.create({
                            text: opt.text,
                            isCorrect: opt.isCorrect,
                            order: opt.order,
                            questionId: savedQuestion.id,
                        }),
                    );
                    await this.questionOptionRepository.save(options);
                }
            }

            testUpdateData["status"] = TestStatus.DRAFT;
        }

        await this.testRepository.update(id, testUpdateData);

        return this.getTestById(id);
    }

    // Публикация теста (DRAFT -> ACTIVE)
    async publishTest(id: number, user: JwtPayload): Promise<Test> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете публиковать только свои тесты",
            );
        }

        // Проверка, что тест в статусе DRAFT, COMPLETED или ARCHIVED
        if (
            test.status !== TestStatus.DRAFT &&
            test.status !== TestStatus.COMPLETED &&
            test.status !== TestStatus.ARCHIVED
        ) {
            throw new ForbiddenException(
                "Тест должен быть в статусе DRAFT, COMPLETED или ARCHIVED для публикации",
            );
        }

        // Проверка, что у теста есть вопросы
        if (!test.questions || test.questions.length === 0) {
            throw new ForbiddenException(
                "Тест должен содержать хотя бы один вопрос",
            );
        }

        await this.testRepository.update(id, { status: TestStatus.ACTIVE });

        return this.getTestById(id);
    }

    // Завершение теста (ACTIVE -> COMPLETED)
    async completeTest(id: number, user: JwtPayload): Promise<Test> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете завершать только свои тесты",
            );
        }

        // Проверка, что тест в статусе ACTIVE
        if (test.status !== TestStatus.ACTIVE) {
            throw new ForbiddenException(
                "Тест должен быть в статусе ACTIVE для завершения",
            );
        }

        await this.testRepository.update(id, { status: TestStatus.COMPLETED });

        return this.getTestById(id);
    }

    // Архивирование теста (COMPLETED -> ARCHIVED)
    async archiveTest(id: number, user: JwtPayload): Promise<Test> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете архивировать только свои тесты",
            );
        }

        // Проверка, что тест в статусе COMPLETED
        if (test.status !== TestStatus.COMPLETED) {
            throw new ForbiddenException(
                "Тест должен быть в статусе COMPLETED для архивирования",
            );
        }

        await this.testRepository.update(id, { status: TestStatus.ARCHIVED });

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
