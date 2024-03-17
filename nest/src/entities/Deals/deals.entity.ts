import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Deals {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;
}
