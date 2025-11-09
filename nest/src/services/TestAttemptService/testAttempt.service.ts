import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TestAttempt, AttemptStatus } from "src/entities/TestAttempt/testAttempt.entity";
import { TestAnswer } from "src/entities/TestAnswer/testAnswer.entity";
import { Test } from "src/entities/Test/test.entity";
import { Question } from "src/entities/Question/question.entity";

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
    ) {}

    async createAttempt(testId: number, user: JwtPayload): Promise<TestAttempt> {
        const test = await this.testRepository.findOne({ where: { id: testId } });
        if (!test) {
            throw new NotFoundException(`Тест с ID ${testId} не найден`);
        }

        const attempt = this.attemptRepository.create({
            testId,
            userId: user.sub,
            status: AttemptStatus.IN_PROGRESS,
            startedAt: new Date(),
        });

        return this.attemptRepository.save(attempt);
    }

    async getAttempt(testId: number, attemptId: number): Promise<TestAttempt> {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId, testId },
            relations: ["answers"],
        });

        if (!attempt) {
            throw new NotFoundException(
                `Попытка с ID ${attemptId} для теста ${testId} не найдена`,
            );
        }

        return attempt;
    }

    async saveAnswer(
        testId: number,
        attemptId: number,
        questionId: number,
        selectedOptionId?: number,
        selectedOptionIds?: number[],
        textAnswer?: string,
    ): Promise<TestAnswer> {
        const attempt = await this.getAttempt(testId, attemptId);

        let answer = await this.answerRepository.findOne({
            where: { attemptId, questionId },
        });

        if (!answer) {
            answer = this.answerRepository.create({
                attemptId,
                questionId,
                selectedOptionId,
                selectedOptionIds: selectedOptionIds ? JSON.stringify(selectedOptionIds) : null,
                textAnswer,
            });
        } else {
            answer.selectedOptionId = selectedOptionId;
            answer.selectedOptionIds = selectedOptionIds ? JSON.stringify(selectedOptionIds) : null;
            answer.textAnswer = textAnswer;
        }

        return this.answerRepository.save(answer);
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

        let correctAnswers = 0;
        const totalQuestions = test.questions.length;

        for (const answer of answers) {
            const question = test.questions.find((q) => q.id === answer.questionId);
            if (!question) continue;

            if (question.type === "single_choice" || question.type === "multiple_choice") {
                const correctOptions = question.options.filter((o) => o.isCorrect);
                const correctOptionIds = correctOptions.map((o) => o.id);

                if (question.type === "single_choice") {
                    if (answer.selectedOptionId && correctOptionIds.includes(answer.selectedOptionId)) {
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
                    answer.textAnswer.toLowerCase() === question.correctTextAnswer?.toLowerCase()
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

        return {
            attemptId: savedAttempt.id,
            testId,
            percentage: savedAttempt.score,
            score: correctAnswers,
            totalQuestions,
            correctAnswers,
            timeSpent: Math.floor(
                (new Date().getTime() - new Date(savedAttempt.startedAt).getTime()) / 1000,
            ),
            answers: answers.map((answer) => {
                const question = test.questions.find((q) => q.id === answer.questionId);
                return {
                    questionId: answer.questionId,
                    questionText: question?.text || "",
                    questionType: question?.type || "",
                    isCorrect: answer.isCorrect,
                    userAnswer: answer.textAnswer || "",
                    correctAnswer: question?.correctTextAnswer || "",
                };
            }),
        };
    }

    async getResults(testId: number, attemptId: number, user: JwtPayload) {
        const attempt = await this.getAttempt(testId, attemptId);

        if (attempt.userId !== user.sub) {
            throw new ForbiddenException("Вы можете просмотреть только свои результаты");
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
            answers: answers.map((answer) => {
                const question = test.questions.find((q) => q.id === answer.questionId);
                return {
                    questionId: answer.questionId,
                    questionText: question?.text || "",
                    questionType: question?.type || "",
                    isCorrect: answer.isCorrect,
                    userAnswer: answer.textAnswer || "",
                    correctAnswer: question?.correctTextAnswer || "",
                };
            }),
        };
    }
}
