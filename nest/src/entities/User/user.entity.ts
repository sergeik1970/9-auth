import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Test } from "../Test/test.entity";
import { TestAttempt } from "../TestAttempt/testAttempt.entity";
import { Region } from "../Region/region.entity";
import { Settlement } from "../Settlement/settlement.entity";
import { School } from "../School/school.entity";

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

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    patronymic: string;

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

    @Column({ type: "text", nullable: true })
    avatar: string;

    @Column({ type: "jsonb", nullable: true, default: null })
    gradingCriteria: {
        excellent: number;
        good: number;
        satisfactory: number;
        poor: number;
    };

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

    @Column({ nullable: true })
    regionId: number;

    @ManyToOne(() => Region, { nullable: true })
    @JoinColumn({ name: "regionId" })
    region: Region;

    @Column({ nullable: true })
    settlementId: number;

    @ManyToOne(() => Settlement, { nullable: true })
    @JoinColumn({ name: "settlementId" })
    settlement: Settlement;

    @Column({ nullable: true })
    schoolId: number;

    @ManyToOne(() => School, { nullable: true })
    @JoinColumn({ name: "schoolId" })
    school: School;

    @Column({ type: "text", nullable: true })
    educationalInstitutionCustom: string;

    @Column({ type: "int", nullable: true })
    classNumber: number;

    @Column({ type: "varchar", length: 1, nullable: true })
    classLetter: string;
}
