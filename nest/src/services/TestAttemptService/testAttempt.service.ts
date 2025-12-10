import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
    TestAttempt,
    AttemptStatus,
} from "src/entities/TestAttempt/testAttempt.entity";
import { TestAnswer } from "src/entities/TestAnswer/testAnswer.entity";
import { Test } from "src/entities/Test/test.entity";
import { Question } from "src/entities/Question/question.entity";
import { QuestionOption } from "src/entities/QuestionOption/questionOption.entity";

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
export class TestAttemptService {
    constructor(
        @InjectRepository(TestAttempt)
        private readonly attemptRepository: Repository<TestAttempt>,
        @InjectRepository(TestAnswer)
        private readonly answerRepository: Repository<TestAnswer>,
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption)
        private readonly questionOptionRepository: Repository<QuestionOption>,
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

    async createAttempt(testId: number, user: JwtPayload): Promise<any> {
        console.log("createAttempt called - testId:", testId);
        console.log("User data:", {
            sub: user.sub,
            email: user.email,
            role: user.role,
            classNumber: user.classNumber,
            classLetter: user.classLetter,
        });

        const test = await this.testRepository.findOne({
            where: { id: testId },
        });
        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
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

        console.log("Test loaded:", {
            testId: test.id,
            status: test.status,
            classSchedules: classSchedules,
            classSchedulesJSON: JSON.stringify(classSchedules),
        });

        if (test.status !== "active") {
            throw new ForbiddenException(
                `Тест должен быть активным для прохождения. Текущий статус: ${test.status}`,
            );
        }

        // Проверка доступа для студентов
        if (user.role === "student") {
            // Студент должен иметь класс
            if (!user.classNumber || !user.classLetter) {
                console.log("Denying access: student has no class");
                throw new ForbiddenException(
                    `У вас не установлен класс. Обратитесь к администратору.`,
                );
            }

            console.log("Student attempting to take test:", {
                userId: user.sub,
                studentClass: `${user.classNumber}${user.classLetter}`,
                classSchedules: JSON.stringify(classSchedules),
            });

            // Проверяем, есть ли класс студента в расписании
            if (!classSchedules || classSchedules.length === 0) {
                console.log("Denying access: no schedules");
                throw new ForbiddenException(
                    `У этого теста нет расписания. Вы не можете его пройти.`,
                );
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
                console.log("Denying access: class not in schedules");
                throw new ForbiddenException(
                    `Этот тест не предназначен для вашего класса.`,
                );
            }

            console.log("Student schedule found:", studentSchedule);

            // Проверяем, не просрочен ли срок
            const now = new Date();
            const dueDate = new Date(studentSchedule.dueDate);

            if (!isNaN(dueDate.getTime()) && now > dueDate) {
                console.log("Denying access: deadline passed");
                throw new ForbiddenException(
                    `Срок прохождения этого теста истек.`,
                );
            }

            console.log("Access granted to student");
        }

        const attempt = this.attemptRepository.create({
            testId,
            userId: user.sub,
            status: AttemptStatus.IN_PROGRESS,
            startedAt: new Date(),
        });

        console.log("Creating attempt with userId:", user.sub);
        const savedAttempt = await this.attemptRepository.save(attempt);
        console.log("Attempt created:", savedAttempt);

        return {
            ...savedAttempt,
            serverTime: new Date().getTime(),
        };
    }

    async getAttempt(
        testId: number,
        attemptId: number,
        user?: JwtPayload,
        validateStatus: boolean = true,
        skipTimeCheck: boolean = false,
    ): Promise<any> {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId, testId },
            relations: ["answers", "test"],
        });

        if (!attempt) {
            throw new NotFoundException(
                `Попытка с ID ${attemptId} для теста ${testId} не найдена`,
            );
        }

        // Проверяем собственность попытки
        if (user && attempt.userId !== user.sub) {
            throw new ForbiddenException(
                `Вы не можете просмотреть эту попытку`,
            );
        }

        if (validateStatus && !skipTimeCheck) {
            this.checkAttemptTimeLimit(attempt);
        }

        return {
            ...attempt,
            serverTime: new Date().getTime(),
        };
    }

    private checkAttemptTimeLimit(attempt: TestAttempt): void {
        if (attempt.status === AttemptStatus.COMPLETED) {
            throw new HttpException(
                "Эта попытка уже завершена. Вы можете просмотреть результаты.",
                HttpStatus.GONE,
            );
        }

        const test = attempt.test as any;
        const timeLimitMinutes = test?.timeLimit || 60;
        const timeLimitMs = timeLimitMinutes * 60 * 1000;
        const elapsedMs =
            new Date().getTime() - new Date(attempt.startedAt).getTime();

        if (elapsedMs > timeLimitMs) {
            throw new HttpException(
                "Время прохождения теста истекло. Попытка больше недоступна.",
                HttpStatus.GONE,
            );
        }
    }

    async getActiveAttempts(user: JwtPayload): Promise<any[]> {
        console.log("getActiveAttempts called with user:", user);

        const attempts = await this.attemptRepository.find({
            where: { userId: user.sub, status: AttemptStatus.IN_PROGRESS },
            relations: ["test"],
        });

        console.log("Found attempts:", attempts.length, attempts);

        const now = new Date().getTime();
        const activeAttempts = attempts.filter((attempt) => {
            const test = attempt.test as any;
            const timeLimitMinutes = test?.timeLimit || 60;
            const timeLimitMs = timeLimitMinutes * 60 * 1000;
            const elapsedMs = now - new Date(attempt.startedAt).getTime();
            return elapsedMs <= timeLimitMs;
        });

        console.log(
            "Active attempts after time validation:",
            activeAttempts.length,
        );

        return activeAttempts.map((attempt) => ({
            id: attempt.id,
            testId: attempt.testId,
            test: attempt.test,
            startedAt: attempt.startedAt,
            serverTime: new Date().getTime(),
        }));
    }

    async getAttemptsByTestId(
        testId: number,
        user: JwtPayload,
    ): Promise<any[]> {
        const test = await this.testRepository.findOne({
            where: { id: testId, creatorId: user.sub },
        });

        if (!test) {
            throw new ForbiddenException(
                "Вы не можете просмотреть результаты для этого теста",
            );
        }

        const attempts = await this.attemptRepository.find({
            where: { testId, status: AttemptStatus.COMPLETED },
            relations: ["user"],
            order: { completedAt: "DESC" },
        });

        return attempts.map((attempt) => ({
            id: attempt.id,
            studentName: attempt.user
                ? `${attempt.user.lastName || ""} ${attempt.user.name || ""}`.trim() ||
                  "Unknown"
                : "Unknown",
            classNumber: attempt.user?.classNumber || null,
            classLetter: attempt.user?.classLetter || null,
            correctAnswers: Number(attempt.correctAnswers ?? 0),
            totalQuestions: Number(attempt.totalQuestions ?? 0),
            percentage: Number(attempt.score ?? 0),
            timeSpent:
                attempt.completedAt && attempt.startedAt
                    ? Math.floor(
                          (new Date(attempt.completedAt).getTime() -
                              new Date(attempt.startedAt).getTime()) /
                              1000,
                      )
                    : 0,
            status: attempt.status,
            completedAt: attempt.completedAt,
        }));
    }

    async saveAnswer(
        testId: number,
        attemptId: number,
        questionId: number,
        selectedOptionId?: number,
        selectedOptionIds?: number[],
        textAnswer?: string,
        user?: JwtPayload,
    ): Promise<TestAnswer> {
        await this.getAttempt(testId, attemptId, user);

        // Проверяем доступ на текущий момент (на случай смены класса)
        if (user && user.role === "student") {
            // Студент должен иметь класс
            if (!user.classNumber || !user.classLetter) {
                throw new ForbiddenException(
                    `У вас не установлен класс. Вы не можете отвечать на тесты.`,
                );
            }

            const test = await this.testRepository.findOne({
                where: { id: testId },
            });

            if (test) {
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

                if (!studentSchedule) {
                    throw new ForbiddenException(
                        `Вы больше не можете отвечать на этот тест.`,
                    );
                }
            }
        }

        let answer = await this.answerRepository.findOne({
            where: { attemptId, questionId },
        });

        // Если установлен selectedOptionId, получаем текст варианта
        let selectedOptionText: string | null = null;
        if (selectedOptionId) {
            const option = await this.questionOptionRepository.findOne({
                where: { id: selectedOptionId },
            });
            selectedOptionText = option?.text || null;
        }

        if (!answer) {
            answer = this.answerRepository.create({
                attemptId,
                questionId,
                selectedOptionId,
                selectedOptionText,
                selectedOptionIds: selectedOptionIds
                    ? JSON.stringify(selectedOptionIds)
                    : null,
                textAnswer,
            });
        } else {
            answer.selectedOptionId = selectedOptionId;
            answer.selectedOptionText = selectedOptionText;
            answer.selectedOptionIds = selectedOptionIds
                ? JSON.stringify(selectedOptionIds)
                : null;
            answer.textAnswer = textAnswer;
        }

        const saved = await this.answerRepository.save(answer);
        console.log(
            `[SaveAnswer] Attempt ${attemptId}, Question ${questionId}: saved, ID=${saved.id}`,
        );
        return saved;
    }

    async submitTest(testId: number, attemptId: number, user: JwtPayload) {
        const attempt = await this.getAttempt(
            testId,
            attemptId,
            user,
            true,
            true,
        );

        console.log(`[SubmitTest] Starting submit for attempt ${attemptId}`);

        if (attempt.userId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете завершить только свои попытки",
            );
        }

        const test = await this.testRepository.findOne({
            where: { id: testId },
            relations: ["questions", "questions.options"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        // Повторная проверка доступа для студентов (на случай смены класса во время теста)
        if (user.role === "student") {
            // Студент должен иметь класс
            if (!user.classNumber || !user.classLetter) {
                throw new ForbiddenException(
                    `У вас не установлен класс. Вы не можете завершить тест.`,
                );
            }

            let classSchedules = test.classSchedules;
            if (typeof classSchedules === "string") {
                try {
                    classSchedules = JSON.parse(classSchedules);
                } catch (e) {
                    classSchedules = [];
                }
            }

            if (!classSchedules || classSchedules.length === 0) {
                throw new ForbiddenException(
                    `Этот тест больше не предназначен для вашего класса.`,
                );
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
                throw new ForbiddenException(
                    `Этот тест больше не предназначен для вашего класса.`,
                );
            }
        }

        const answers = await this.answerRepository.find({
            where: { attemptId },
        });

        console.log(
            `[SubmitTest] Attempt ${attemptId}: Status=${attempt.status}, Found ${answers.length} answers`,
        );

        let correctAnswers = 0;
        const totalQuestions = test.questions.length;

        for (const answer of answers) {
            const question = test.questions.find(
                (q) => q.id === answer.questionId,
            );
            if (!question) continue;

            if (
                question.type === "single_choice" ||
                question.type === "multiple_choice"
            ) {
                const correctOptions = question.options.filter(
                    (o) => o.isCorrect,
                );
                const correctOptionIds = correctOptions.map((o) => o.id);

                if (question.type === "single_choice") {
                    if (
                        answer.selectedOptionId &&
                        correctOptionIds.includes(answer.selectedOptionId)
                    ) {
                        correctAnswers++;
                        answer.isCorrect = true;
                    } else {
                        answer.isCorrect = false;
                    }
                } else {
                    const selectedIds = answer.selectedOptionIds
                        ? JSON.parse(answer.selectedOptionIds)
                        : [];
                    if (
                        JSON.stringify(selectedIds.sort()) ===
                        JSON.stringify(correctOptionIds.sort())
                    ) {
                        correctAnswers++;
                        answer.isCorrect = true;
                    } else {
                        answer.isCorrect = false;
                    }
                }
            } else if (question.type === "text_input") {
                if (
                    answer.textAnswer &&
                    answer.textAnswer.toLowerCase() ===
                        question.correctTextAnswer?.toLowerCase()
                ) {
                    correctAnswers++;
                    answer.isCorrect = true;
                } else {
                    answer.isCorrect = false;
                }
            }
        }

        const percentage = (correctAnswers / totalQuestions) * 100;

        attempt.status = AttemptStatus.COMPLETED;
        attempt.completedAt = new Date();
        attempt.correctAnswers = correctAnswers;
        attempt.totalQuestions = totalQuestions;
        attempt.score = Math.round(percentage * 100) / 100;

        await this.answerRepository.save(answers);
        const savedAttempt = await this.attemptRepository.save(attempt);

        console.log(`[SubmitTest] Attempt ${attemptId} saved successfully:`, {
            status: savedAttempt.status,
            correctAnswers: savedAttempt.correctAnswers,
            totalQuestions: savedAttempt.totalQuestions,
            score: savedAttempt.score,
        });

        const answerMap = new Map(answers.map((a) => [a.questionId, a]));

        return {
            attemptId: savedAttempt.id,
            testId,
            percentage: savedAttempt.score,
            score: correctAnswers,
            totalQuestions,
            correctAnswers,
            timeSpent: Math.floor(
                (new Date().getTime() -
                    new Date(savedAttempt.startedAt).getTime()) /
                    1000,
            ),
            answers: [...test.questions]
                .sort((a, b) => a.order - b.order)
                .map((question) => {
                    const answer = answerMap.get(question.id);

                    let isCorrect = false;
                    let isPartiallyCorrect = false;
                    let options = [];
                    let userAnswerText = "";

                    if (
                        question.type === "single_choice" ||
                        question.type === "multiple_choice"
                    ) {
                        const correctOptionIds = question.options
                            .filter((o) => o.isCorrect)
                            .map((o) => o.id);

                        let userSelectedIds: number[] = [];
                        if (answer) {
                            if (
                                question.type === "single_choice" &&
                                answer.selectedOptionId
                            ) {
                                userSelectedIds = [answer.selectedOptionId];
                            } else if (
                                question.type === "multiple_choice" &&
                                answer.selectedOptionIds
                            ) {
                                userSelectedIds = JSON.parse(
                                    answer.selectedOptionIds,
                                );
                            }
                        }

                        isCorrect = answer?.isCorrect || false;

                        if (
                            question.type === "multiple_choice" &&
                            !isCorrect &&
                            userSelectedIds.length > 0
                        ) {
                            const correctSelected = userSelectedIds.filter(
                                (id) => correctOptionIds.includes(id),
                            );
                            if (correctSelected.length > 0) {
                                isPartiallyCorrect = true;
                            }
                        }

                        options = question.options.map((option) => ({
                            id: option.id,
                            text: option.text,
                            isCorrect: option.isCorrect,
                            isUserSelected: userSelectedIds.includes(option.id),
                        }));

                        userAnswerText = question.options
                            .filter((o) => userSelectedIds.includes(o.id))
                            .map((o) => o.text)
                            .join(", ");
                    } else if (question.type === "text_input") {
                        isCorrect = answer?.isCorrect || false;
                        userAnswerText = answer?.textAnswer || "";
                    }

                    const correctAnswerText =
                        question.type === "text_input"
                            ? question.correctTextAnswer || ""
                            : question.options
                                  .filter((o) => o.isCorrect)
                                  .map((o) => o.text)
                                  .join(", ");

                    return {
                        questionId: question.id,
                        questionText: question.text || "",
                        questionType: question.type || "",
                        isCorrect,
                        isPartiallyCorrect,
                        userAnswer: userAnswerText,
                        correctAnswer: correctAnswerText,
                        options,
                    };
                }),
        };
    }

    async completeAttempt(testId: number, attemptId: number, user: JwtPayload) {
        const attempt = await this.getAttempt(testId, attemptId, user);

        console.log(`[CompleteAttempt] Initial attempt times:`, {
            startedAt: attempt.startedAt,
            startedAtType: typeof attempt.startedAt,
            startedAtString: String(attempt.startedAt),
            completedAt: attempt.completedAt,
            completedAtType: typeof attempt.completedAt,
        });

        if (!attempt.startedAt) {
            console.error(
                `[CompleteAttempt] ERROR: startedAt is null or undefined for attempt ${attemptId}`,
            );
            throw new HttpException(
                "Ошибка: время начала теста не установлено",
                HttpStatus.BAD_REQUEST,
            );
        }

        if (attempt.userId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете завершить только свои попытки",
            );
        }

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new HttpException(
                "Попытка уже завершена",
                HttpStatus.BAD_REQUEST,
            );
        }

        const test = await this.testRepository.findOne({
            where: { id: testId },
            relations: ["questions", "questions.options"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        console.log(
            `[CompleteAttempt] Test ${testId} loaded with ${test.questions?.length || 0} questions`,
        );
        test.questions?.forEach((q) => {
            console.log(
                `[CompleteAttempt] Q${q.id}: ${q.type} with ${q.options?.length || 0} options`,
            );
        });

        const answers = await this.answerRepository.find({
            where: { attemptId },
        });

        console.log(
            `[CompleteAttempt] Attempt ${attemptId}: found ${answers.length} answers`,
        );

        let correctAnswers = 0;
        const totalQuestions = test.questions.length;

        for (const answer of answers) {
            const question = test.questions.find(
                (q) => q.id === answer.questionId,
            );
            if (!question) {
                console.log(
                    `[CompleteAttempt] Question ${answer.questionId} not found`,
                );
                continue;
            }

            console.log(
                `[CompleteAttempt] Checking answer for question ${question.id} (${question.type}):`,
                {
                    selectedOptionId: answer.selectedOptionId,
                    selectedOptionIds: answer.selectedOptionIds,
                    textAnswer: answer.textAnswer,
                },
            );

            if (
                question.type === "single_choice" ||
                question.type === "multiple_choice"
            ) {
                if (!question.options || question.options.length === 0) {
                    console.log(
                        `[CompleteAttempt] ERROR: Q${question.id} has no options loaded!`,
                    );
                    continue;
                }

                const correctOptions = question.options.filter(
                    (o) => o.isCorrect,
                );
                const correctOptionIds = correctOptions.map((o) => o.id);

                console.log(
                    `[CompleteAttempt] Q${question.id} has ${question.options.length} options, ${correctOptionIds.length} correct`,
                );
                console.log(
                    `[CompleteAttempt] Correct option IDs: ${correctOptionIds}`,
                );

                if (question.type === "single_choice") {
                    if (
                        answer.selectedOptionId &&
                        correctOptionIds.includes(answer.selectedOptionId)
                    ) {
                        correctAnswers++;
                        answer.isCorrect = true;
                        console.log(
                            `[CompleteAttempt] Single choice correct for Q${question.id}`,
                        );
                    } else {
                        answer.isCorrect = false;
                    }
                } else {
                    const selectedIds = answer.selectedOptionIds
                        ? JSON.parse(answer.selectedOptionIds)
                        : [];
                    console.log(
                        `[CompleteAttempt] Selected IDs: ${selectedIds}, Correct IDs: ${correctOptionIds}`,
                    );
                    if (
                        JSON.stringify(selectedIds.sort()) ===
                        JSON.stringify(correctOptionIds.sort())
                    ) {
                        correctAnswers++;
                        answer.isCorrect = true;
                        console.log(
                            `[CompleteAttempt] Multiple choice correct for Q${question.id}`,
                        );
                    } else {
                        answer.isCorrect = false;
                    }
                }
            } else if (question.type === "text_input") {
                if (
                    answer.textAnswer &&
                    answer.textAnswer.toLowerCase() ===
                        question.correctTextAnswer?.toLowerCase()
                ) {
                    correctAnswers++;
                    answer.isCorrect = true;
                    console.log(
                        `[CompleteAttempt] Text input correct for Q${question.id}`,
                    );
                } else {
                    answer.isCorrect = false;
                }
            }
        }

        console.log(
            `[CompleteAttempt] Final result: ${correctAnswers}/${totalQuestions} correct`,
        );

        const percentage = (correctAnswers / totalQuestions) * 100;

        attempt.status = AttemptStatus.COMPLETED;
        attempt.completedAt = new Date();
        attempt.correctAnswers = correctAnswers;
        attempt.totalQuestions = totalQuestions;
        attempt.score = Math.round(percentage * 100) / 100;

        console.log(`[CompleteAttempt] Before save:`, {
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            timeDiffMs:
                new Date(attempt.completedAt).getTime() -
                new Date(attempt.startedAt).getTime(),
        });

        await this.answerRepository.save(answers);
        await this.attemptRepository.save(attempt);

        return {
            attemptId: attempt.id,
            status: attempt.status,
            completedAt: attempt.completedAt,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            score: attempt.score,
        };
    }

    async getResults(testId: number, attemptId: number, user: JwtPayload) {
        let attempt = await this.getAttempt(testId, attemptId, user, false);

        console.log(`[GetResults] Attempt ${attemptId}:`, {
            status: attempt.status,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            score: attempt.score,
            completedAt: attempt.completedAt,
            startedAt: attempt.startedAt,
        });

        if (attempt.userId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете просмотреть только свои результаты",
            );
        }

        if (
            attempt.status === AttemptStatus.IN_PROGRESS &&
            attempt.completedAt
        ) {
            console.log(`[GetResults] Auto-completing attempt ${attemptId}`);
            attempt.status = AttemptStatus.COMPLETED;
            attempt = await this.attemptRepository.save(attempt);
        }

        const test = await this.testRepository.findOne({
            where: { id: testId },
            relations: ["questions", "questions.options", "creator"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        // Повторная проверка доступа для студентов (на случай смены класса)
        if (user.role === "student") {
            // Студент должен иметь класс
            if (!user.classNumber || !user.classLetter) {
                throw new ForbiddenException(
                    `У вас не установлен класс. Вы не можете просмотреть результаты.`,
                );
            }

            let classSchedules = test.classSchedules;
            if (typeof classSchedules === "string") {
                try {
                    classSchedules = JSON.parse(classSchedules);
                } catch (e) {
                    classSchedules = [];
                }
            }

            if (!classSchedules || classSchedules.length === 0) {
                throw new ForbiddenException(
                    `Этот тест больше не предназначен для вашего класса.`,
                );
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
                throw new ForbiddenException(
                    `Этот тест больше не предназначен для вашего класса.`,
                );
            }
        }

        const answers = await this.answerRepository.find({
            where: { attemptId },
        });

        const answerMap = new Map(answers.map((a) => [a.questionId, a]));

        const correctAnswers = attempt.correctAnswers ?? 0;
        const totalQuestions = attempt.totalQuestions ?? test.questions.length;
        const percentage = attempt.score ?? 0;

        const startedAtMs = new Date(attempt.startedAt).getTime();
        const completedAtMs = new Date(attempt.completedAt).getTime();
        const timeDiffMs = completedAtMs - startedAtMs;
        const timeSpent = Math.floor(timeDiffMs / 1000);

        console.log(`[GetResults] Time calculation:`, {
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            startedAtMs,
            completedAtMs,
            timeDiffMs,
            timeSpent,
        });

        return {
            attemptId: attempt.id,
            testId,
            percentage: Math.round(percentage * 100) / 100,
            score: correctAnswers,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            timeSpent: timeSpent,
            gradingCriteria: test.creator?.gradingCriteria || null,
            answers: [...test.questions]
                .sort((a, b) => a.order - b.order)
                .map((question) => {
                    const answer = answerMap.get(question.id);

                    let isCorrect = false;
                    let isPartiallyCorrect = false;
                    let options = [];
                    let userAnswerText = "";

                    if (
                        question.type === "single_choice" ||
                        question.type === "multiple_choice"
                    ) {
                        const correctOptionIds = question.options
                            .filter((o) => o.isCorrect)
                            .map((o) => o.id);

                        let userSelectedIds: number[] = [];
                        if (answer) {
                            if (
                                question.type === "single_choice" &&
                                answer.selectedOptionId
                            ) {
                                userSelectedIds = [answer.selectedOptionId];
                            } else if (
                                question.type === "multiple_choice" &&
                                answer.selectedOptionIds
                            ) {
                                userSelectedIds = JSON.parse(
                                    answer.selectedOptionIds,
                                );
                            }
                        }

                        if (question.type === "single_choice") {
                            isCorrect =
                                (answer?.selectedOptionId &&
                                    correctOptionIds.includes(
                                        answer.selectedOptionId,
                                    )) ||
                                false;
                        } else {
                            isCorrect =
                                JSON.stringify(userSelectedIds.sort()) ===
                                JSON.stringify(correctOptionIds.sort());
                            if (!isCorrect && userSelectedIds.length > 0) {
                                const correctSelected = userSelectedIds.filter(
                                    (id) => correctOptionIds.includes(id),
                                );
                                if (correctSelected.length > 0) {
                                    isPartiallyCorrect = true;
                                }
                            }
                        }

                        options = question.options.map((option) => ({
                            id: option.id,
                            text: option.text,
                            isCorrect: option.isCorrect,
                            isUserSelected: userSelectedIds.includes(option.id),
                        }));

                        userAnswerText = question.options
                            .filter((o) => userSelectedIds.includes(o.id))
                            .map((o) => o.text)
                            .join(", ");
                    } else if (question.type === "text_input") {
                        isCorrect =
                            (answer?.textAnswer &&
                                answer.textAnswer.toLowerCase() ===
                                    question.correctTextAnswer?.toLowerCase()) ||
                            false;
                        userAnswerText = answer?.textAnswer || "";
                    }

                    const correctAnswerText =
                        question.type === "text_input"
                            ? question.correctTextAnswer || ""
                            : question.options
                                  .filter((o) => o.isCorrect)
                                  .map((o) => o.text)
                                  .join(", ");

                    return {
                        questionId: question.id,
                        questionText: question.text || "",
                        questionType: question.type || "",
                        isCorrect,
                        isPartiallyCorrect,
                        userAnswer: userAnswerText,
                        correctAnswer: correctAnswerText,
                        options,
                    };
                }),
        };
    }
}
