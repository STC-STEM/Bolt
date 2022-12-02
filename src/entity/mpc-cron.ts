import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MPCCron {
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    registeredChat!: string
}