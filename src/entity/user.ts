import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    whatsappId!: string

    @Column()
    group: string = 'guest'

    @Column('simple-array')
    permissions: string[] = []
}