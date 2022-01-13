import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ProfileEntity} from "@app/profile/profile.entity";
import {CommentEntity} from "@app/match/comment.entity";

@Entity("matches")
export class MatchEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    type: string

    @CreateDateColumn()
    create_at: Date;

    @ManyToOne(() => ProfileEntity, profile => profile.winMatches)
    winner: ProfileEntity;

    @ManyToOne(() => ProfileEntity, profile => profile.lossMatches)
    loser: ProfileEntity;

    @ManyToMany(() => CommentEntity)
    @JoinTable()
    comments: CommentEntity[]
}