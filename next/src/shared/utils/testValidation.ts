import { QuestionFormData, Question } from "@/shared/types/question";

export interface TestFormData {
    title: string;
    description?: string;
    timeLimit?: number;
    questions: QuestionFormData[] | Question[];
}

export const getTestValidationErrors = (test: TestFormData): string[] => {
    const errors: string[] = [];

    if (!test.title.trim()) {
        errors.push("Название теста");
    }
    if (!test.timeLimit || test.timeLimit <= 0) {
        errors.push("Время для прохождения теста");
    }
    if (test.questions.length === 0) {
        errors.push("Минимум один вопрос");
    }

    test.questions.forEach((question, index) => {
        if (!question.text.trim()) {
            errors.push(`Вопрос ${index + 1}: текст вопроса`);
        }

        if (question.type === "text_input") {
            if (!question.correctTextAnswer?.trim()) {
                errors.push(`Вопрос ${index + 1}: правильный ответ`);
            }
        } else {
            const filledOptions = question.options?.filter((opt) => opt.text.trim()) || [];

            if (filledOptions.length < 2) {
                errors.push(`Вопрос ${index + 1}: минимум два варианта ответа`);
            } else {
                const correctOptions = filledOptions.filter((opt) => opt.isCorrect);
                if (correctOptions.length === 0) {
                    errors.push(`Вопрос ${index + 1}: не отмечен правильный ответ`);
                } else if (question.type === "multiple_choice" && correctOptions.length < 2) {
                    errors.push(
                        `Вопрос ${index + 1}: минимум два правильных ответа для множественного выбора`,
                    );
                }
            }
        }
    });

    return errors;
};

export const isTestValid = (test: TestFormData): boolean => {
    return getTestValidationErrors(test).length === 0;
};
