import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'users'})
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    ft_id: number

    @Column()
    username: string

    @Column()
    image: string

    @Column()
    victories: number

    @Column()
    losses: number

    @Column()
    level: number

    //@Column
}