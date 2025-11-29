import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from "typeorm";
import { Region } from "../Region/region.entity";
import { School } from "../School/school.entity";

@Entity()
export class Settlement {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column()
    regionId: number;

    @ManyToOne(() => Region, (region) => region.settlements, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "regionId" })
    region: Region;

    @OneToMany(() => School, (school) => school.settlement)
    schools: School[];
}
