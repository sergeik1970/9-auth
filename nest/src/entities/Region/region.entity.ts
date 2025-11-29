import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Settlement } from "../Settlement/settlement.entity";

@Entity()
export class Region {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => Settlement, (settlement) => settlement.region)
    settlements: Settlement[];
}
