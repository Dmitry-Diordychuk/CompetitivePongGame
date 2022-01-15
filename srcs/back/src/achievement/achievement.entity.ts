import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("achievements")
export class AchievementEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    title: string

    @Column({nullable: false})
    description: string
}