import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "@app/user/user.entity";

@Entity("comments")
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    message: string

    @ManyToOne(() => UserEntity, user => user.comments)
    author: UserEntity
}