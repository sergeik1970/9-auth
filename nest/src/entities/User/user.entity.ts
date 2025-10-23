import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Test } from "../Test/test.entity";
import { TestAttempt } from "../TestAttempt/testAttempt.entity";

export enum UserRole {
    // PUPIL = "pupil",
    TEACHER = "teacher",
    STUDENT = "student",
    // PROFESSOR = "professor",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({
        //  Одно из заранее определенных значений
        type: "enum",
        // Значения, они в UserRole
        enum: UserRole,
        // По умолчанию ученик
        default: UserRole.STUDENT,
    })
    role: UserRole;

    @Column("boolean", { default: false })
    isAdmin: boolean = false;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Test, (test) => test.creator)
    // В createdTests будут записаны все созданные тесты
    createdTests: Test[];

    @OneToMany(() => TestAttempt, (attempt) => attempt.user)
    // // В testAttempts будут записаны все попытки
    testAttempts: TestAttempt[];
}
