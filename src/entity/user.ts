import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    whatsappId!: string

    @Column()
    group: string = 'guest'

    @Column('simple-array')
    permissions: string[] = []
}