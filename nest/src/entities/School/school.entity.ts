import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Settlement } from "../Settlement/settlement.entity";

@Entity()
export class School {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column()
    settlementId: number;

    @ManyToOne(() => Settlement, (settlement) => settlement.schools, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "settlementId" })
    settlement: Settlement;
}
