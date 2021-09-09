import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {AchievementEntity} from "@app/achievement/achievement.entity";

@Entity('profiles')
export class ProfileEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({default: 0, nullable: false})
    victories: number

    @Column({default: 0, nullable: false})
    losses: number

    @Column({default: 1, nullable: false})
    level: number

    @Column({nullable: false})
    ft_profile: string

    @Column({nullable: false})
    image: string

    @ManyToMany(() => AchievementEntity, {eager: true, nullable: true})
    @JoinTable()
    achievements: AchievementEntity[]
}