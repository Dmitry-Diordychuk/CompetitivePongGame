import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    ft_id: number

    @Column({unique: true})
    username: string

    @Column({nullable: false})
    image: string

    @Column({nullable: false})
    ft_profile: string

    // @Column({default: 0})
    // victories: number
    //
    // @Column({default: 0})
    // losses: number
    //
    // @Column({default: 1})
    // level: number

    @ManyToMany(() => ChannelEntity, {cascade: true})
    @JoinTable()
    connections: ChannelEntity[];

    @OneToMany(() => ChannelEntity, channel => channel.owner)
    possessions: ChannelEntity[];
}