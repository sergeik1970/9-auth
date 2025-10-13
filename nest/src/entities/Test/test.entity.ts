import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../User/user.entity";

@Entity()
export class Test {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "int", nullable: true })
    timeLimit: number;

    @Column({ type: "varchar", default: "draft" })
    status: string; // draft, active, completed

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: "creatorId" })
    creator: User;

    @Column()
    creatorId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
