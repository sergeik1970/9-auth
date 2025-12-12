import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
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
    schoolId?: number;
    regionId?: number;
    settlementId?: number;
}

@Injectable()
export class TestService {
    private readonly logger = new Logger(TestService.name);

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

    private isStudentInClass(
        studentNumber: number | null | undefined,
        studentLetter: string | null | undefined,
        scheduleNumber: number | string | null | undefined,
        scheduleLetter: string | null | undefined,
        studentSchoolId?: number | null,
        scheduleSchoolId?: number | null,
        studentRegionId?: number | null,
        scheduleRegionId?: number | null,
        studentSettlementId?: number | null,
        scheduleSettlementId?: number | null,
    ): boolean {
        // Защита от null/undefined для класса
        if (
            studentNumber === null ||
            studentNumber === undefined ||
            studentLetter === null ||
            studentLetter === undefined ||
            scheduleNumber === null ||
            scheduleNumber === undefined ||
            scheduleLetter === null ||
            scheduleLetter === undefined
        ) {
            return false;
        }

        // Нормализуем числитель класса
        const normalizedStudentNumber = Number(studentNumber);
        const normalizedScheduleNumber = Number(scheduleNumber);

        // Проверяем, что числа валидные
        if (isNaN(normalizedStudentNumber) || isNaN(normalizedScheduleNumber)) {
            return false;
        }

        // Нормализуем букву класса
        const normalizedStudentLetter = String(studentLetter)
            .trim()
            .toUpperCase();
        const normalizedScheduleLetter = String(scheduleLetter)
            .trim()
            .toUpperCase();

        // Проверяем не пустые ли буквы
        if (
            normalizedStudentLetter.length === 0 ||
            normalizedScheduleLetter.length === 0
        ) {
            return false;
        }

        // Проверяем числовую часть
        if (normalizedStudentNumber !== normalizedScheduleNumber) {
            return false;
        }

        // Проверяем буквенную часть
        if (normalizedStudentLetter !== normalizedScheduleLetter) {
            return false;
        }

        // Проверяем школу - ОБЯЗАТЕЛЬНО требуется
        if (
            scheduleSchoolId === undefined ||
            scheduleSchoolId === null ||
            studentSchoolId === undefined ||
            studentSchoolId === null ||
            studentSchoolId !== scheduleSchoolId
        ) {
            return false;
        }

        // Проверяем регион - ОБЯЗАТЕЛЬНО требуется
        if (
            scheduleRegionId === undefined ||
            scheduleRegionId === null ||
            studentRegionId === undefined ||
            studentRegionId === null ||
            studentRegionId !== scheduleRegionId
        ) {
            return false;
        }

        // Проверяем город/поселение - ОБЯЗАТЕЛЬНО требуется
        if (
            scheduleSettlementId === undefined ||
            scheduleSettlementId === null ||
            studentSettlementId === undefined ||
            studentSettlementId === null ||
            studentSettlementId !== scheduleSettlementId
        ) {
            return false;
        }

        return true;
    }

    private async checkAndUpdateTestStatus(test: Test): Promise<Test> {
        try {
            if (!test.classSchedules || test.classSchedules.length === 0) {
                return test;
            }

            const now = new Date();
            const nowUtc = now.getTime();

            let maxDueDateMs = -Infinity;

            for (const schedule of test.classSchedules) {
                const dueDate = new Date(schedule.dueDate);
                const dueDateMs = dueDate.getTime();

                if (!isNaN(dueDateMs)) {
                    maxDueDateMs = Math.max(maxDueDateMs, dueDateMs);
                }
            }

            if (maxDueDateMs === -Infinity) {
                return test;
            }

            this.logger.log(`[Test ${test.id}] Status check:`, {
                currentTimeUTC: new Date(nowUtc).toISOString(),
                maxDueDateUTC: new Date(maxDueDateMs).toISOString(),
                isExpired: nowUtc > maxDueDateMs,
                testStatus: test.status,
                testTitle: test.title,
            });

            if (
                nowUtc > maxDueDateMs &&
                test.status !== TestStatus.COMPLETED &&
                test.status !== TestStatus.ARCHIVED
            ) {
                this.logger.log(
                    `[Test ${test.id}] Deadline has passed. Updating status from ${test.status} to COMPLETED`,
                );
                test.status = TestStatus.COMPLETED;
                await this.testRepository.update(test.id, {
                    status: TestStatus.COMPLETED,
                });
            }

            return test;
        } catch (error) {
            this.logger.error(
                `Error checking status for test ${test.id}: ${error.message}`,
                error.stack,
            );
            return test;
        }
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
        console.log("getAllTests called with user:", {
            sub: user?.sub,
            role: user?.role,
            classNumber: user?.classNumber,
            classLetter: user?.classLetter,
        });

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
            // Студенту нужен класс для просмотра тестов
            if (!user.classNumber || !user.classLetter) {
                this.logger.log(`[Student ${user.sub}] No class assigned`, {
                    classNumber: user.classNumber,
                    classLetter: user.classLetter,
                });
                return [];
            }

            // Студентам показываем только активные тесты, доступные для их класса
            const allActiveTests = await this.testRepository.find({
                where: { status: TestStatus.ACTIVE },
                relations: ["creator", "questions", "questions.options"],
                order: {
                    createdAt: "DESC",
                },
            });

            this.logger.log(
                `[Student ${user.sub}] Loaded ${allActiveTests.length} ACTIVE tests`,
                {
                    studentClass: `${user.classNumber}${user.classLetter}`,
                    firstTestSchedules:
                        allActiveTests.length > 0
                            ? JSON.stringify(allActiveTests[0].classSchedules)
                            : "no tests",
                },
            );

            // Фильтруем по классам ученика
            tests = allActiveTests.filter((test) => {
                // Нормализуем classSchedules если это строка
                let classSchedules = test.classSchedules;
                if (typeof classSchedules === "string") {
                    try {
                        classSchedules = JSON.parse(classSchedules);
                    } catch (e) {
                        classSchedules = [];
                    }
                }

                if (!classSchedules || classSchedules.length === 0) {
                    this.logger.debug(
                        `[Test ${test.id}] Filtered out: no classSchedules`,
                        {
                            classSchedules: classSchedules,
                        },
                    );
                    return false;
                }

                // Проверяем, есть ли класс ученика в classSchedules
                const studentSchedule = classSchedules.find((schedule: any) =>
                    this.isStudentInClass(
                        user.classNumber,
                        user.classLetter,
                        schedule.classNumber,
                        schedule.classLetter,
                        user.schoolId,
                        schedule.schoolId,
                        user.regionId,
                        schedule.regionId,
                        user.settlementId,
                        schedule.settlementId,
                    ),
                );

                if (!studentSchedule) {
                    this.logger.debug(
                        `[Test ${test.id}] Filtered out: class mismatch`,
                        {
                            testTitle: test.title,
                            studentClass: `${user.classNumber}${user.classLetter}`,
                            scheduleClasses: classSchedules.map(
                                (s: any) => `${s.classNumber}${s.classLetter}`,
                            ),
                        },
                    );
                    return false;
                }

                // Проверяем, не просрочен ли срок выполнения для этого класса
                const now = new Date();
                const dueDate = new Date(studentSchedule.dueDate);

                // Проверяем, валидна ли дата
                if (isNaN(dueDate.getTime())) {
                    this.logger.log(
                        `[Test ${test.id}] Filtered out: invalid date`,
                        {
                            testTitle: test.title,
                            studentClass: `${user.classNumber}${user.classLetter}`,
                            invalidDate: studentSchedule.dueDate,
                        },
                    );
                    return false;
                }

                if (now > dueDate) {
                    this.logger.log(
                        `[Test ${test.id}] Filtered out: deadline passed`,
                        {
                            testTitle: test.title,
                            studentClass: `${user.classNumber}${user.classLetter}`,
                            dueDate: dueDate.toISOString(),
                            currentTime: now.toISOString(),
                        },
                    );
                    return false;
                }

                this.logger.log(`[Test ${test.id}] Available for student`, {
                    testTitle: test.title,
                    studentClass: `${user.classNumber}${user.classLetter}`,
                    dueDate: dueDate.toISOString(),
                });

                return true;
            });

            console.log(`[Student filtering] Results:`, {
                userId: user.sub,
                totalLoadedTests: allActiveTests.length,
                availableTests: tests.length,
                studentClass: `${user.classNumber}${user.classLetter}`,
                availableTestIds: tests.map((t) => ({
                    id: t.id,
                    title: t.title,
                })),
            });

            this.logger.log(
                `[Student ${user.sub}] Filtered to ${tests.length} available tests`,
            );

            // Для студентов показываем только их расписание в каждом тесте
            tests = tests.map((test) => {
                let classSchedules = test.classSchedules;
                if (typeof classSchedules === "string") {
                    try {
                        classSchedules = JSON.parse(classSchedules);
                    } catch (e) {
                        classSchedules = [];
                    }
                }

                const studentSchedule = classSchedules.find((schedule: any) =>
                    this.isStudentInClass(
                        user.classNumber,
                        user.classLetter,
                        schedule.classNumber,
                        schedule.classLetter,
                        user.schoolId,
                        schedule.schoolId,
                        user.regionId,
                        schedule.regionId,
                        user.settlementId,
                        schedule.settlementId,
                    ),
                );

                if (studentSchedule) {
                    test.classSchedules = [studentSchedule];
                }

                return test;
            });
        } else {
            // Неавторизованные пользователи не видят тесты
            tests = [];
        }

        return await Promise.all(
            tests.map((test) => this.checkAndUpdateTestStatus(test)),
        );
    }

    // Получение теста по ID
    async getTestById(id: number, user?: JwtPayload): Promise<Test> {
        const test = await this.testRepository.findOne({
            where: { id },
            relations: ["creator", "questions", "questions.options"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${id} не найден`);
        }

        // Проверяем доступ для студентов
        if (user && user.role === "student") {
            // Студент должен иметь класс
            if (!user.classNumber || !user.classLetter) {
                this.logger.log(
                    `[getTestById] Student ${user.sub} denied access to test ${id}: no class assigned`,
                    {
                        classNumber: user.classNumber,
                        classLetter: user.classLetter,
                    },
                );
                throw new NotFoundException(`Тест с ID ${id} не найден`);
            }

            // Нормализуем classSchedules если это строка
            let classSchedules = test.classSchedules;
            if (typeof classSchedules === "string") {
                try {
                    classSchedules = JSON.parse(classSchedules);
                } catch (e) {
                    classSchedules = [];
                }
            }

            // Проверяем, есть ли у студента активная попытка на этот тест
            const hasActiveAttempt = await this.attemptRepository.findOne({
                where: { testId: id, userId: user.sub, status: AttemptStatus.IN_PROGRESS },
            });

            // Студент может видеть активные тесты или тесты, на которые у него есть активная попытка
            if (test.status !== TestStatus.ACTIVE && !hasActiveAttempt) {
                this.logger.log(
                    `[getTestById] Student ${user.sub} denied access to test ${id}: not active and no active attempt`,
                    {
                        status: test.status,
                        studentClass: `${user.classNumber}${user.classLetter}`,
                        hasActiveAttempt: !!hasActiveAttempt,
                    },
                );
                throw new NotFoundException(`Тест с ID ${id} не найден`);
            }

            // Проверяем, есть ли класс студента в расписании
            if (!classSchedules || classSchedules.length === 0) {
                this.logger.log(
                    `[getTestById] Student ${user.sub} denied access to test ${id}: no schedules`,
                    {
                        studentClass: `${user.classNumber}${user.classLetter}`,
                    },
                );
                throw new NotFoundException(`Тест с ID ${id} не найден`);
            }

            const studentSchedule = classSchedules.find((schedule: any) =>
                this.isStudentInClass(
                    user.classNumber,
                    user.classLetter,
                    schedule.classNumber,
                    schedule.classLetter,
                    user.schoolId,
                    schedule.schoolId,
                    user.regionId,
                    schedule.regionId,
                    user.settlementId,
                    schedule.settlementId,
                ),
            );

            if (!studentSchedule) {
                this.logger.log(
                    `[getTestById] Student ${user.sub} denied access to test ${id}: class not in schedules`,
                    {
                        studentClass: `${user.classNumber}${user.classLetter}`,
                        scheduleClasses: classSchedules.map(
                            (s: any) => `${s.classNumber}${s.classLetter}`,
                        ),
                    },
                );
                throw new NotFoundException(`Тест с ID ${id} не найден`);
            }

            // Проверяем, не просрочен ли срок (но позволяем продолжить, если есть активная попытка)
            const now = new Date();
            const dueDate = new Date(studentSchedule.dueDate);

            if (!isNaN(dueDate.getTime()) && now > dueDate && !hasActiveAttempt) {
                this.logger.log(
                    `[getTestById] Student ${user.sub} denied access to test ${id}: deadline passed`,
                    {
                        studentClass: `${user.classNumber}${user.classLetter}`,
                        dueDate: dueDate.toISOString(),
                        currentTime: now.toISOString(),
                    },
                );
                throw new NotFoundException(`Тест с ID ${id} не найден`);
            }

            // Для студентов показываем только его расписание
            test.classSchedules = [studentSchedule];
        }

        this.logger.log(`[getTestById] Test ${id} loaded:`, {
            title: test.title,
            classSchedulesLength: test.classSchedules?.length || 0,
            classSchedules: JSON.stringify(test.classSchedules),
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
            this.logger.log(`[Test ${id}] updateTest called with:`, {
                hasClassSchedules: !!updateData.classSchedules,
                classSchedules: JSON.stringify(updateData.classSchedules),
                classSchedulesLength: updateData.classSchedules?.length || 0,
                updateDataKeys: Object.keys(updateData || {}),
            });

            const test = await this.getTestById(id);

            // Проверка, что пользователь - создатель теста
            if (test.creatorId !== user.sub) {
                throw new ForbiddenException(
                    "Вы можете редактировать только свои тесты",
                );
            }

            const { questions, ...testUpdateData } = updateData;

            console.log(`[DIRECT LOG] Test ${id} - After destructuring:`, {
                updateDataKeys: Object.keys(updateData),
                updateDataHasClassSchedules: !!updateData.classSchedules,
                classSchedulesInUpdateData: updateData.classSchedules,
                testUpdateDataKeys: Object.keys(testUpdateData),
                testUpdateDataHasClassSchedules:
                    !!testUpdateData.classSchedules,
                classSchedulesInTestUpdateData: testUpdateData.classSchedules,
            });

            this.logger.log(`[Test ${id}] After destructuring:`, {
                hasClassSchedulesInUpdateData: !!updateData.classSchedules,
                hasClassSchedulesInTestUpdateData:
                    !!testUpdateData.classSchedules,
                classSchedules: JSON.stringify(testUpdateData.classSchedules),
                testUpdateDataKeys: Object.keys(testUpdateData),
            });

            // Обновляем вопросы если они были переданы
            if (questions && questions.length > 0) {
                // Получаем все вопросы текущего теста
                const oldQuestions = await this.questionRepository.find({
                    where: { testId: id },
                });

                this.logger.debug(
                    `[Test ${id}] Old questions: ${oldQuestions.length}, New questions: ${questions.length}`,
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
                        await this.questionRepository.update(
                            existingQuestion.id,
                            {
                                text: questionDto.text,
                                type: questionDto.type as QuestionType,
                                correctTextAnswer:
                                    questionDto.correctTextAnswer,
                            },
                        );

                        // Проверяем изменились ли варианты ответа (текст или флаг isCorrect)
                        const oldOptions =
                            await this.questionOptionRepository.find({
                                where: { questionId: existingQuestion.id },
                                order: { order: "ASC" },
                            });

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
                                            opt.text ===
                                            answer.selectedOptionText,
                                    );
                                    if (matchingOption) {
                                        await this.answerRepository.update(
                                            { id: answer.id },
                                            {
                                                selectedOptionId:
                                                    matchingOption.id,
                                            },
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

                        if (
                            questionDto.options &&
                            questionDto.options.length > 0
                        ) {
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

            this.logger.log(`[Test ${id}] Before update - testUpdateData:`, {
                hasClassSchedules: !!testUpdateData.classSchedules,
                classSchedulesLength:
                    testUpdateData.classSchedules?.length || 0,
                classSchedules: JSON.stringify(testUpdateData.classSchedules),
                title: testUpdateData.title,
                updateDataKeys: Object.keys(testUpdateData),
            });

            const updateObject: any = { ...testUpdateData };
            if (
                testUpdateData.classSchedules &&
                testUpdateData.classSchedules.length > 0
            ) {
                updateObject.classSchedules = testUpdateData.classSchedules.map(
                    (schedule: any) => {
                        const dueDate = new Date(schedule.dueDate);
                        // Проверяем корректность даты
                        if (isNaN(dueDate.getTime())) {
                            this.logger.warn(
                                `[Test ${id}] Invalid date in classSchedules for class ${schedule.classNumber}${schedule.classLetter}: ${schedule.dueDate}`,
                            );
                        }
                        return {
                            ...schedule,
                            classLetter: schedule.classLetter?.toUpperCase(),
                            dueDate: dueDate.toISOString(),
                            schoolId: user.schoolId,
                            regionId: user.regionId,
                            settlementId: user.settlementId,
                        };
                    },
                );
            }

            console.log(`[DIRECT LOG] Test ${id} - updateObject before DB:`, {
                keys: Object.keys(updateObject),
                hasClassSchedules: !!updateObject.classSchedules,
                classSchedulesValue: updateObject.classSchedules,
                classSchedulesJSON: JSON.stringify(updateObject.classSchedules),
            });

            this.logger.log(`[Test ${id}] Sending to update:`, {
                updateObjectKeys: Object.keys(updateObject),
                classSchedulesExists: updateObject.classSchedules !== undefined,
                classSchedules: JSON.stringify(updateObject.classSchedules),
            });

            // Используем save вместо update для надежного сохранения complexных объектов
            const testToUpdate = await this.testRepository.findOne({
                where: { id },
                relations: ["questions", "questions.options"],
            });

            if (!testToUpdate) {
                throw new NotFoundException(`Тест ${id} не найден`);
            }

            Object.assign(testToUpdate, updateObject);
            const savedTest = await this.testRepository.save(testToUpdate);

            console.log(`[DIRECT LOG] Test ${id} - Saved:`, {
                classSchedulesJSON: JSON.stringify(savedTest.classSchedules),
            });

            this.logger.log(`[Test ${id}] Test saved:`, {
                classSchedulesLength: savedTest.classSchedules?.length || 0,
                classSchedules: JSON.stringify(savedTest.classSchedules),
            });

            const updatedTest = await this.getTestById(id);

            this.logger.log(`[Test ${id}] After update - database:`, {
                title: updatedTest.title,
                classSchedulesLength: updatedTest.classSchedules?.length || 0,
                classSchedules: JSON.stringify(updatedTest.classSchedules),
                status: updatedTest.status,
            });

            return updatedTest;
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

        this.logger.log(`[Test ${id}] Publishing test`, {
            title: test.title,
            classSchedules: test.classSchedules,
        });

        await this.testRepository.update(id, { status: TestStatus.ACTIVE });

        const updatedTest = await this.getTestById(id);

        this.logger.log(`[Test ${id}] Test published successfully`, {
            title: updatedTest.title,
            status: updatedTest.status,
            classSchedules: updatedTest.classSchedules,
        });

        return updatedTest;
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

    // Получение доступных тестов для студента по его школе, региону, городу и классу
    async getAvailableTests(user: JwtPayload): Promise<Test[]> {
        this.logger.log(`[getAvailableTests] Student ${user.sub}:`, {
            schoolId: user.schoolId,
            regionId: user.regionId,
            settlementId: user.settlementId,
            classNumber: user.classNumber,
            classLetter: user.classLetter,
        });

        // Проверяем что у студента есть все необходимые параметры
        if (
            !user.schoolId ||
            !user.regionId ||
            !user.settlementId ||
            !user.classNumber ||
            !user.classLetter
        ) {
            this.logger.log(
                `[getAvailableTests] Student ${user.sub} missing required parameters`,
            );
            return [];
        }

        // Получаем все активные тесты
        const allActiveTests = await this.testRepository.find({
            where: { status: TestStatus.ACTIVE },
            relations: ["creator", "questions", "questions.options"],
            order: {
                createdAt: "DESC",
            },
        });

        this.logger.log(
            `[getAvailableTests] Found ${allActiveTests.length} active tests`,
        );

        // Фильтруем тесты по параметрам студента
        const availableTests = allActiveTests.filter((test) => {
            if (!test.classSchedules || test.classSchedules.length === 0) {
                return false;
            }

            if (test.dueDate) {
                const dueDate = new Date(test.dueDate);
                const now = new Date();
                if (dueDate < now) {
                    this.logger.debug(
                        `[getAvailableTests] Test ${test.id}: Skipped - due date expired (${test.dueDate})`,
                    );
                    return false;
                }
            }

            // Ищем расписание которое совпадает со всеми параметрами студента
            const matchingSchedule = test.classSchedules.find(
                (schedule: any) => {
                    const scheduleSchoolId = Number(schedule.schoolId);
                    const scheduleRegionId = Number(schedule.regionId);
                    const scheduleSettlementId = Number(schedule.settlementId);
                    const scheduleClassNumber = Number(schedule.classNumber);
                    const scheduleClassLetter = String(schedule.classLetter)
                        .trim()
                        .toUpperCase();

                    const normalizedStudentLetter = String(user.classLetter)
                        .trim()
                        .toUpperCase();

                    const matches =
                        scheduleSchoolId === user.schoolId &&
                        scheduleRegionId === user.regionId &&
                        scheduleSettlementId === user.settlementId &&
                        scheduleClassNumber === user.classNumber &&
                        scheduleClassLetter === normalizedStudentLetter;

                    if (matches) {
                        this.logger.debug(
                            `[getAvailableTests] Test ${test.id}: Found matching schedule for student`,
                        );
                    }

                    return matches;
                },
            );

            return !!matchingSchedule;
        });

        this.logger.log(
            `[getAvailableTests] Returning ${availableTests.length} available tests for student`,
        );

        return availableTests;
    }
}
