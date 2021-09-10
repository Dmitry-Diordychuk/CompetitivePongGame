import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";
import {ProfileEntity} from "@app/profile/profile.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    ft_id: number

    @Column({unique: true})
    username: string

    @Column({ nullable: true })
    twoFactorAuthenticationsSecret?: string;

    @ManyToMany(() => ChannelEntity, {cascade: true})
    @JoinTable()
    connections: ChannelEntity[];

    @OneToMany(() => ChannelEntity, channel => channel.owner)
    possessions: ChannelEntity[];

    @OneToOne(() => ProfileEntity, {cascade: true, nullable: false})
    @JoinColumn()
    profile: ProfileEntity;
}