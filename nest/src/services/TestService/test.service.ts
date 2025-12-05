import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Test, TestStatus, ClassSchedule } from "src/entities/Test/test.entity";
import { Question, QuestionType } from "src/entities/Question/question.entity";
import { QuestionOption } from "src/entities/QuestionOption/questionOption.entity";
import {
    TestAttempt,
    AttemptStatus,
} from "src/entities/TestAttempt/testAttempt.entity";
import { TestAnswer } from "src/entities/TestAnswer/testAnswer.entity";
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
    classSchedules: ClassSchedule[];
    questions?: CreateQuestionForTestDto[];
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    classNumber?: number;
    classLetter?: string;
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
        @InjectRepository(TestAttempt)
        private readonly attemptRepository: Repository<TestAttempt>,
        @InjectRepository(TestAnswer)
        private readonly answerRepository: Repository<TestAnswer>,
    ) {}

    private async checkAndUpdateTestStatus(test: Test): Promise<Test> {
        if (!test.classSchedules || test.classSchedules.length === 0) {
            return test;
        }

        const now = new Date();
        const maxDueDate = new Date(
            Math.max(
                ...test.classSchedules.map((s) =>
                    new Date(s.dueDate).getTime(),
                ),
            ),
        );

        if (
            now > maxDueDate &&
            test.status !== TestStatus.COMPLETED &&
            test.status !== TestStatus.ARCHIVED
        ) {
            test.status = TestStatus.COMPLETED;
            await this.testRepository.update(test.id, {
                status: TestStatus.COMPLETED,
            });
        }

        return test;
    }

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
        let tests: Test[] = [];

        // Если пользователь преподаватель, показываем его собственные тесты
        if (user && user.role === "teacher") {
            tests = await this.testRepository.find({
                where: { creatorId: user.sub },
                relations: ["creator", "questions", "questions.options"],
                order: {
                    createdAt: "DESC",
                },
            });
        } else if (user && user.role === "student") {
            // Студентам показываем только активные тесты, доступные для их класса
            const allActiveTests = await this.testRepository.find({
                where: { status: TestStatus.ACTIVE },
                relations: ["creator", "questions", "questions.options"],
                order: {
                    createdAt: "DESC",
                },
            });

            // Фильтруем по классам ученика
            tests = allActiveTests.filter((test) => {
                if (!test.classSchedules || test.classSchedules.length === 0) {
                    return false;
                }
                // Проверяем, есть ли класс ученика в classSchedules
                return test.classSchedules.some(
                    (schedule) =>
                        schedule.classNumber === user.classNumber &&
                        schedule.classLetter === user.classLetter,
                );
            });
        } else {
            // Неавторизованным пользователям показываем только активные тесты
            tests = await this.testRepository.find({
                where: { status: TestStatus.ACTIVE },
                relations: ["creator", "questions", "questions.options"],
                order: {
                    createdAt: "DESC",
                },
            });
        }

        return await Promise.all(
            tests.map((test) => this.checkAndUpdateTestStatus(test)),
        );
    }

    // Получение теста по ID
    async getTestById(id: number): Promise<Test> {
        const test = await this.testRepository.findOne({
            where: { id },
            relations: ["creator", "questions", "questions.options"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${id} не найден`);
        }

        console.log(`GetTestById ${id}:`, {
            dueDate: test.dueDate,
            status: test.status,
        });

        return await this.checkAndUpdateTestStatus(test);
    }

    // Обновление теста
    async updateTest(
        id: number,
        updateData: Partial<CreateTestDto>,
        user: JwtPayload,
    ): Promise<Test> {
        try {
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

                console.log(
                    `[UpdateTest] Old questions: ${oldQuestions.length}, New questions: ${questions.length}`,
                );

                // УДАЛЯЕМ ТОЛЬКО вопросы которых больше нет в новом списке
                // и которые НЕ имеют ответов от completed попыток
                for (const oldQuestion of oldQuestions) {
                    // Проверяем есть ли этот вопрос в новом списке (by order)
                    const isInNewList = questions.some(
                        (q) => q.order === oldQuestion.order,
                    );

                    if (!isInNewList) {
                        // Вопроса больше нет - проверяем есть ли на него ответы
                        const answersCount = await this.answerRepository.count({
                            where: { questionId: oldQuestion.id },
                        });

                        if (answersCount === 0) {
                            // Нет ответов - удаляем вопрос и его варианты
                            await this.questionOptionRepository.delete({
                                questionId: oldQuestion.id,
                            });
                            await this.questionRepository.delete({
                                id: oldQuestion.id,
                            });
                            console.log(
                                `[UpdateTest] Deleted old question ${oldQuestion.id} (order ${oldQuestion.order}, no answers)`,
                            );
                        } else {
                            // Есть ответы - НЕ удаляем для сохранения истории
                            console.log(
                                `[UpdateTest] Keeping old question ${oldQuestion.id} (order ${oldQuestion.order}, ${answersCount} answers)`,
                            );
                        }
                    }
                }

                // ОБНОВЛЯЕМ или ДОБАВЛЯЕМ вопросы из нового списка
                for (const questionDto of questions) {
                    // Ищем существующий вопрос по order
                    const existingQuestion = oldQuestions.find(
                        (q) => q.order === questionDto.order,
                    );

                    if (existingQuestion) {
                        // Обновляем текст вопроса
                        await this.questionRepository.update(existingQuestion.id, {
                            text: questionDto.text,
                            type: questionDto.type as QuestionType,
                            correctTextAnswer: questionDto.correctTextAnswer,
                        });

                        // Проверяем изменились ли варианты ответа (текст или флаг isCorrect)
                        const oldOptions = await this.questionOptionRepository.find(
                            {
                                where: { questionId: existingQuestion.id },
                                order: { order: "ASC" },
                            },
                        );

                        // Сравниваем текст И флаг isCorrect
                        const newOptionsSignature = (questionDto.options || [])
                            .sort((a, b) => a.text.localeCompare(b.text))
                            .map((o) => `${o.text}:${o.isCorrect}`)
                            .join("|");
                        const oldOptionsSignature = oldOptions
                            .sort((a, b) => a.text.localeCompare(b.text))
                            .map((o) => `${o.text}:${o.isCorrect}`)
                            .join("|");

                        // Если варианты изменились (текст или правильность) - обновляем их
                        if (newOptionsSignature !== oldOptionsSignature) {
                            console.log(
                                `[UpdateTest] Question ${existingQuestion.id}: options changed, updating...`,
                            );

                            // Перед удалением вариантов - сохраняем текст в selectedOptionText
                            for (const option of oldOptions) {
                                const answersWithThisOption =
                                    await this.answerRepository.find({
                                        where: { selectedOptionId: option.id },
                                    });

                                // Сохраняем текст варианта в selectedOptionText перед обнулением
                                for (const answer of answersWithThisOption) {
                                    await this.answerRepository.update(
                                        { id: answer.id },
                                        {
                                            selectedOptionText: option.text,
                                            selectedOptionId: null,
                                        },
                                    );
                                }
                            }

                            // Удаляем старые варианты и добавляем новые
                            await this.questionOptionRepository.delete({
                                questionId: existingQuestion.id,
                            });

                            const newOptions = [];
                            if (
                                questionDto.options &&
                                questionDto.options.length > 0
                            ) {
                                const options = questionDto.options.map((opt) =>
                                    this.questionOptionRepository.create({
                                        text: opt.text,
                                        isCorrect: opt.isCorrect,
                                        order: opt.order,
                                        questionId: existingQuestion.id,
                                    }),
                                );
                                newOptions.push(
                                    ...(await this.questionOptionRepository.save(
                                        options,
                                    )),
                                );
                            }

                            // Переподключаем selectedOptionId по совпадению текста
                            const answersNeedingReconnection =
                                await this.answerRepository.find({
                                    where: {
                                        questionId: existingQuestion.id,
                                        selectedOptionId: null,
                                    },
                                });

                            for (const answer of answersNeedingReconnection) {
                                if (answer.selectedOptionText) {
                                    const matchingOption = newOptions.find(
                                        (opt) =>
                                            opt.text === answer.selectedOptionText,
                                    );
                                    if (matchingOption) {
                                        await this.answerRepository.update(
                                            { id: answer.id },
                                            { selectedOptionId: matchingOption.id },
                                        );
                                        console.log(
                                            `[UpdateTest] Reconnected answer ${answer.id} to option ${matchingOption.id}`,
                                        );
                                    }
                                }
                            }
                        } else {
                            console.log(
                                `[UpdateTest] Question ${existingQuestion.id}: options unchanged, keeping them`,
                            );
                        }

                        console.log(
                            `[UpdateTest] Updated question ${existingQuestion.id} (order ${questionDto.order})`,
                        );
                    } else {
                        // Добавляем новый вопрос
                        const question = this.questionRepository.create({
                            text: questionDto.text,
                            type: questionDto.type as QuestionType,
                            order: questionDto.order,
                            correctTextAnswer: questionDto.correctTextAnswer,
                            testId: id,
                        });

                        const savedQuestion =
                            await this.questionRepository.save(question);

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

                        console.log(
                            `[UpdateTest] Added new question ${savedQuestion.id} (order ${questionDto.order})`,
                        );
                    }
                }
            }

            console.log(`Updating test ${id} with:`, {
                ...testUpdateData,
                classSchedulesType: Array.isArray(testUpdateData.classSchedules) ? "array" : typeof testUpdateData.classSchedules,
                classSchedulesValue: JSON.stringify(testUpdateData.classSchedules),
            });
            await this.testRepository.update(id, testUpdateData);

            return this.getTestById(id);
        } catch (error) {
            console.error(`[UpdateTest Error] Test ID: ${id}`, error);
            throw error;
        }
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

    // Перепроверка попыток за определённый период
    async recalculateAttempts(
        id: number,
        timeRangeHours: number,
        user: JwtPayload,
    ): Promise<{ recalculatedCount: number }> {
        const test = await this.getTestById(id);

        // Проверка, что пользователь - создатель теста
        if (test.creatorId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете перепроверять только свои тесты",
            );
        }

        // Получаем время начала диапазона
        const startTime = new Date(
            new Date().getTime() - timeRangeHours * 60 * 60 * 1000,
        );

        // Получаем все завершённые попытки за период
        const attempts = await this.attemptRepository.find({
            where: {
                testId: id,
                status: AttemptStatus.COMPLETED,
            },
            relations: ["answers"],
        });

        // Фильтруем по дате
        const filteredAttempts = attempts.filter((attempt) => {
            if (!attempt.completedAt) return false;
            return new Date(attempt.completedAt) >= startTime;
        });

        // Получаем вопросы с вариантами ответов
        const questions = await this.questionRepository.find({
            where: { testId: id },
            relations: ["options"],
        });

        let recalculatedCount = 0;

        if (questions.length === 0) {
            return { recalculatedCount: 0 };
        }

        console.log(`[Recalculate] Loaded ${questions.length} questions`);
        questions.forEach((q, i) => {
            console.log(
                `  Question ${i + 1} (ID: ${q.id}): type=${q.type}, options=${q.options?.length || 0}`,
            );
        });

        for (const attempt of filteredAttempts) {
            let answers = attempt.answers || [];

            console.log(
                `Processing attempt ${attempt.id}, loaded via relations: ${answers.length}`,
            );

            // Если answers не загружены через relations, загрузим явно
            if (answers.length === 0) {
                const dbAnswers = await this.answerRepository.find({
                    where: { attemptId: attempt.id },
                });
                console.log(
                    `  [DB Query] Found ${dbAnswers.length} answers in database`,
                );
                if (dbAnswers.length > 0) {
                    dbAnswers.forEach((a, i) => {
                        console.log(
                            `    Answer ${i + 1}: Q${a.questionId}, option=${a.selectedOptionId}, text="${a.textAnswer}"`,
                        );
                    });
                }
                answers = dbAnswers;
            }

            let correctAnswers = 0;
            // Используем totalQuestions из попытки если оно сохранено, иначе считаем по ответам
            // Это нужно потому что тест может быть изменен и иметь другое кол-во вопросов
            const totalQuestions =
                attempt.totalQuestions || answers.length || questions.length;

            console.log(
                `Processing attempt ${attempt.id}, answers: ${answers.length}, totalQuestions stored: ${attempt.totalQuestions}, using: ${totalQuestions}`,
            );

            for (const answer of answers) {
                const question = questions.find(
                    (q) => q.id === answer.questionId,
                );
                if (!question) {
                    console.log(
                        `  Answer to question ${answer.questionId}: NOT FOUND in questions`,
                    );
                    continue;
                }

                if (
                    question.type === "single_choice" ||
                    question.type === "multiple_choice"
                ) {
                    const correctOptions = (question.options || []).filter(
                        (o) => o.isCorrect,
                    );
                    const correctOptionIds = correctOptions.map((o) => o.id);
                    console.log(
                        `  Q${answer.questionId}: type=${question.type}, options count=${question.options?.length}, correct IDs=${correctOptionIds}`,
                    );

                    if (question.type === "single_choice") {
                        const isCorrect =
                            answer.selectedOptionId &&
                            correctOptionIds.includes(answer.selectedOptionId);
                        if (isCorrect) {
                            correctAnswers++;
                        }
                        console.log(
                            `    Single choice: selected=${answer.selectedOptionId}, correct=${correctOptionIds}, match=${isCorrect}`,
                        );
                    } else {
                        const selectedIds = answer.selectedOptionIds
                            ? JSON.parse(answer.selectedOptionIds)
                            : [];
                        const isCorrect =
                            JSON.stringify(selectedIds.sort()) ===
                            JSON.stringify(correctOptionIds.sort());
                        if (isCorrect) {
                            correctAnswers++;
                        }
                        console.log(
                            `    Multiple choice: selected=${JSON.stringify(selectedIds)}, correct=${JSON.stringify(correctOptionIds)}, match=${isCorrect}`,
                        );
                    }
                } else if (question.type === "text_input") {
                    const isCorrect =
                        answer.textAnswer &&
                        answer.textAnswer.toLowerCase() ===
                            question.correctTextAnswer?.toLowerCase();
                    if (isCorrect) {
                        correctAnswers++;
                    }
                    console.log(
                        `    Text input: answer="${answer.textAnswer}", correct="${question.correctTextAnswer}", match=${isCorrect}`,
                    );
                }
            }

            const percentage = (correctAnswers / totalQuestions) * 100;
            const oldScore = attempt.score;
            attempt.correctAnswers = correctAnswers;
            attempt.score = Math.round(percentage * 100) / 100;
            console.log(
                `Attempt ${attempt.id}: ${oldScore} -> ${attempt.score} (${correctAnswers}/${totalQuestions})`,
            );
            await this.attemptRepository.save(attempt);
            recalculatedCount++;
        }

        return { recalculatedCount };
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
