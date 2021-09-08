import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

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

    @Column({nullable: false})
    ft_profile: string

    @Column({nullable: false})
    image: string
}