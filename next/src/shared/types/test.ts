import { User } from "./auth";
import { QuestionFormData, Question } from "./question";

export interface Test {
    id?: number;
    title: string;
    description?: string;
    timeLimit?: number;
    status: "draft" | "active" | "completed";
    questions?: Question[];
    creator?: User;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTestData {
    title: string;
    description?: string;
    timeLimit?: number;
    questions: QuestionFormData[];
}

export interface TestAttempt {
    id: number;
    testId: number;
    userId: number;
    status: "in_progress" | "completed";
    score?: number;
    percentage?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    timeSpent?: number;
    startedAt: string;
    completedAt?: string;
    answers?: TestAnswer[];
}

export interface TestAnswer {
    id: number;
    attemptId: number;
    questionId: number;
    selectedOptionId?: number;
    selectedOptionIds?: number[];
    textAnswer?: string;
    isCorrect?: boolean;
}

export interface TestResults {
    attemptId: number;
    testId: number;
    percentage: number;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    answers: AnswerResult[];
}

export interface AnswerResult {
    questionId: number;
    questionText: string;
    questionType: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
}
