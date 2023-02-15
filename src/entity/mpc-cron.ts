import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MPCCron extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    registeredChat!: string
}