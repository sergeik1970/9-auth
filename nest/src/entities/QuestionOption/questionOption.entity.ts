import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Question } from "../Question/question.entity";

// Таблица с вариантами ответов на вопросы
@Entity("question_options")
export class QuestionOption {
    @PrimaryGeneratedColumn()
    // ID варианта ответа
    id: number;

    // Текст варианта ответа
    @Column({ type: "text" })
    text: string;

    // Правильный ли вариант ответа
    @Column({ type: "boolean", default: false })
    isCorrect: boolean;

    // Порядок вывода вариантов ответов
    @Column({ type: "int" })
    order: number;

    // ID вопроса, к которому относится вариант ответа
    @Column({ type: "int" })
    questionId: number;

    // Связь с вопросом
    @ManyToOne(() => Question, (question) => question.options, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "questionId" })
    question: Question;

    // Даты создания и обновления записи
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
