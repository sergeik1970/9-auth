import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { User } from "../User/user.entity";
import { Question } from "../Question/question.entity";
import { TestAttempt } from "../TestAttempt/testAttempt.entity";

export enum TestStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
    ARCHIVED = "archived",
}

export interface ClassSchedule {
    classNumber: number;
    classLetter: string;
    dueDate: string;
}

@Entity("tests")
export class Test {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "int", nullable: true })
    timeLimit: number;

    @Column({ type: "timestamp", nullable: true })
    dueDate: Date;

    // Статус теста
    @Column({
        type: "enum",
        // Выбирать из этого массива
        enum: TestStatus,
        default: TestStatus.DRAFT,
    })
    status: TestStatus;

    @ManyToOne(() => User, (user) => user.createdTests)
    @JoinColumn({ name: "creatorId" })
    creator: User;

    @Column()
    creatorId: number;

    // Связь с вопросами
    @OneToMany(() => Question, (question) => question.test, { cascade: true })
    questions: Question[];

    // Связь с попытками
    @OneToMany(() => TestAttempt, (attempt) => attempt.test)
    attempts: TestAttempt[];

    @Column({ type: "json", nullable: false, default: [] })
    classSchedules: ClassSchedule[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
