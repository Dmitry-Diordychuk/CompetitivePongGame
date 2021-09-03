import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";
import {channel} from "diagnostics_channel";

@Entity({name: 'users'})
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    ft_id: number

    @Column({unique: true})
    username: string

    @Column({nullable: true})
    image: string

    @Column({default: 0})
    victories: number

    @Column({default: 0})
    losses: number

    @Column({default: 1})
    level: number

    @ManyToMany(() => ChannelEntity)
    @JoinTable()
    rooms: ChannelEntity[];

    @OneToMany(() => ChannelEntity, channel => channel.owner)
    possession: ChannelEntity[];
}