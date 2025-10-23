// Типы вопросов
export type QuestionType = "single_choice" | "multiple_choice" | "text_input";

// Вариант ответа (с ID — из бэка)
export interface QuestionOption {
    id?: number;
    text: string;
    isCorrect: boolean;
    order: number;
}

// Вариант ответа для формы (без ID до сохранения)
export type QuestionOptionFormData = Omit<QuestionOption, "id">;

// Полный вопрос (как приходит с бэка / после сохранения)
export interface Question {
    id?: number;
    text: string;
    type: QuestionType;
    options: QuestionOption[];
    correctTextAnswer?: string;
    order: number;
    testId?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Черновик вопроса (в процессе создания/редактирования)
export interface QuestionFormData {
    text: string;
    type: QuestionType;
    options: QuestionOptionFormData[]; // без ID до сохранения
    correctTextAnswer?: string;
    order: number;
}

// Payload для отправки на бэк
export type CreateQuestionData = QuestionFormData;
