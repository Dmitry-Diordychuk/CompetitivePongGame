import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";
import {ProfileEntity} from "@app/profile/profile.entity";

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

    @ManyToMany(() => ChannelEntity, {cascade: true})
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

    @ManyToMany(() => ChannelEntity, channel => channel.visitors)
    @JoinTable()
    blacklist: UserEntity[];
}