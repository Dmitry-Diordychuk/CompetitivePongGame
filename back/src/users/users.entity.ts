import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {RoomEntity} from "@app/chat/room.entity";

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

    @ManyToMany(() => RoomEntity)
    @JoinTable()
    rooms: RoomEntity[];
}