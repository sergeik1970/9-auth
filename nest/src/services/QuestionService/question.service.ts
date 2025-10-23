import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Question, QuestionType } from "src/entities/Question/question.entity";
import { QuestionOption } from "src/entities/QuestionOption/questionOption.entity";
import { Test } from "src/entities/Test/test.entity";

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}

export interface CreateQuestionOptionDto {
    text: string;
    isCorrect: boolean;
    order: number;
}

export interface CreateQuestionDto {
    text: string;
    type: QuestionType;
    order: number;
    options?: CreateQuestionOptionDto[];
    correctTextAnswer?: string;
}

export interface UpdateQuestionDto {
    text?: string;
    type?: QuestionType;
    order?: number;
    options?: CreateQuestionOptionDto[];
    correctTextAnswer?: string;
}

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption)
        private readonly questionOptionRepository: Repository<QuestionOption>,
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
    ) {}

    // Создание вопроса
    async createQuestion(
        testId: number,
        createQuestionDto: CreateQuestionDto,
        user: JwtPayload,
    ): Promise<Question> {
        // Проверка, что тест существует
        const test = await this.testRepository.findOne({
            where: { id: testId },
        });
        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете добавлять вопросы только к своим тестам",
            );
        }

        const question = this.questionRepository.create({
            text: createQuestionDto.text,
            type: createQuestionDto.type,
            order: createQuestionDto.order,
            correctTextAnswer: createQuestionDto.correctTextAnswer,
            testId: testId,
        });

        const savedQuestion = await this.questionRepository.save(question);

        // Если есть варианты ответов, создаём их
        if (createQuestionDto.options && createQuestionDto.options.length > 0) {
            const options = createQuestionDto.options.map((opt) =>
                this.questionOptionRepository.create({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    order: opt.order,
                    questionId: savedQuestion.id,
                }),
            );
            await this.questionOptionRepository.save(options);
            savedQuestion.options = options;
        }

        return savedQuestion;
    }

    // Получение всех вопросов теста
    async getQuestionsByTestId(testId: number): Promise<Question[]> {
        return this.questionRepository.find({
            where: { testId },
            relations: ["options"],
            order: { order: "ASC" },
        });
    }

    // Получение вопроса по ID
    async getQuestionById(id: number): Promise<Question> {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ["options"],
        });

        if (!question) {
            throw new NotFoundException(`Вопрос с ID ${id} не найден`);
        }

        return question;
    }

    // Обновление вопроса
    async updateQuestion(
        id: number,
        updateQuestionDto: UpdateQuestionDto,
        user: JwtPayload,
    ): Promise<Question> {
        const question = await this.getQuestionById(id);

        // Проверка доступа
        const test = await this.testRepository.findOne({
            where: { id: question.testId },
        });
        if (!test || test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете редактировать только вопросы своих тестов",
            );
        }

        // Обновляем базовые поля
        if (updateQuestionDto.text !== undefined) {
            question.text = updateQuestionDto.text;
        }
        if (updateQuestionDto.type !== undefined) {
            question.type = updateQuestionDto.type;
        }
        if (updateQuestionDto.order !== undefined) {
            question.order = updateQuestionDto.order;
        }
        if (updateQuestionDto.correctTextAnswer !== undefined) {
            question.correctTextAnswer = updateQuestionDto.correctTextAnswer;
        }

        const updatedQuestion = await this.questionRepository.save(question);

        // Если переданы варианты ответов, обновляем их
        if (updateQuestionDto.options !== undefined) {
            // Удаляем старые варианты
            await this.questionOptionRepository.delete({ questionId: id });

            // Создаём новые
            if (updateQuestionDto.options.length > 0) {
                const newOptions = updateQuestionDto.options.map((opt) =>
                    this.questionOptionRepository.create({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        order: opt.order,
                        questionId: id,
                    }),
                );
                await this.questionOptionRepository.save(newOptions);
                updatedQuestion.options = newOptions;
            } else {
                updatedQuestion.options = [];
            }
        } else {
            // Загружаем существующие варианты если их не обновляли
            updatedQuestion.options = await this.questionOptionRepository.find({
                where: { questionId: id },
            });
        }

        return updatedQuestion;
    }

    // Удаление вопроса
    async deleteQuestion(id: number, user: JwtPayload): Promise<void> {
        const question = await this.getQuestionById(id);

        // Проверка доступа
        const test = await this.testRepository.findOne({
            where: { id: question.testId },
        });
        if (!test || test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете удалять только вопросы своих тестов",
            );
        }

        await this.questionRepository.delete(id);
    }

    // Массовое создание вопросов при создании теста
    async createBulkQuestions(
        testId: number,
        questions: CreateQuestionDto[],
    ): Promise<Question[]> {
        const createdQuestions: Question[] = [];

        for (const questionDto of questions) {
            const question = this.questionRepository.create({
                text: questionDto.text,
                type: questionDto.type,
                order: questionDto.order,
                correctTextAnswer: questionDto.correctTextAnswer,
                testId: testId,
            });

            const savedQuestion = await this.questionRepository.save(question);

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
                savedQuestion.options = options;
            }

            createdQuestions.push(savedQuestion);
        }

        return createdQuestions;
    }
}
