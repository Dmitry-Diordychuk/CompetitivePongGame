import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {AchievementEntity} from "@app/achievement/achievement.entity";
import {MatchEntity} from "@app/match/match.entity";

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

    @Column({type: "float", default: 1.0, nullable: false})
    exp: number

    @Column({nullable: false})
    ftProfile: string

    @Column({nullable: false})
    image: string

    @ManyToMany(() => AchievementEntity, {eager: true, nullable: true})
    @JoinTable()
    achievements: AchievementEntity[]

    @OneToMany(() => MatchEntity, (match) => match.winner)
    winMatches: MatchEntity[];

    @OneToMany(() => MatchEntity, (match) => match.loser)
    lossMatches: MatchEntity[];
}