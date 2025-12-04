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

    async createAttempt(testId: number, user: JwtPayload): Promise<any> {
        console.log("createAttempt called - testId:", testId, "user:", user);

        const test = await this.testRepository.findOne({
            where: { id: testId },
        });
        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        if (test.status !== "active") {
            throw new ForbiddenException(
                `Тест должен быть активным для прохождения. Текущий статус: ${test.status}`,
            );
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
        validateStatus: boolean = true,
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

        if (validateStatus) {
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
    ): Promise<TestAnswer> {
        await this.getAttempt(testId, attemptId);

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
        const attempt = await this.getAttempt(testId, attemptId);

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

        const answers = await this.answerRepository.find({
            where: { attemptId },
        });

        console.log(
            `[SubmitTest] Attempt ${attemptId}: found ${answers.length} answers`,
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

    async getResults(testId: number, attemptId: number, user: JwtPayload) {
        const attempt = await this.getAttempt(testId, attemptId, false);

        if (attempt.userId !== user.sub) {
            throw new ForbiddenException(
                "Вы можете просмотреть только свои результаты",
            );
        }

        const test = await this.testRepository.findOne({
            where: { id: testId },
            relations: ["questions", "questions.options", "creator"],
        });

        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        const answers = await this.answerRepository.find({
            where: { attemptId },
        });

        const answerMap = new Map(answers.map((a) => [a.questionId, a]));

        return {
            attemptId: attempt.id,
            testId,
            percentage: attempt.score,
            score: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            correctAnswers: attempt.correctAnswers,
            timeSpent: Math.floor(
                (new Date(attempt.completedAt).getTime() -
                    new Date(attempt.startedAt).getTime()) /
                    1000,
            ),
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
