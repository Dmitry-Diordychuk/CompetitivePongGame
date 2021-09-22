import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";
import {ProfileEntity} from "@app/profile/profile.entity";
import {CommentEntity} from "@app/match/comment.entity";
import {SanctionEntity} from "@app/sanction/sanction.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false, select: false})
    ftId: number

    @Column({unique: true})
    username: string

    @Column({ default: false, select: false })
    isTwoFactorAuthenticationEnable: boolean;

    @Column({ nullable: true, select: false })
    twoFactorAuthenticationsSecret?: string;

    @ManyToMany(() => ChannelEntity, channel => channel.visitors, {cascade: true})
    @JoinTable()
    connections: ChannelEntity[];

    @OneToMany(() => ChannelEntity, channel => channel.owner)
    possessions: ChannelEntity[];

    @OneToOne(() => ProfileEntity, {cascade: true, nullable: false})
    @JoinColumn()
    profile: ProfileEntity;

    @ManyToMany(() => UserEntity)
    @JoinTable()
    friends: UserEntity[];

    @ManyToMany(() => UserEntity)
    @JoinTable()
    blacklist: UserEntity[];

    @OneToMany(() => CommentEntity, comment => comment.author)
    comments: CommentEntity[];

    @OneToMany(() => SanctionEntity, sanction => sanction.target)
    sanctions: SanctionEntity[];

    // TODO: Check user online or offline maybe not here.
}