import {BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {hash} from "bcrypt"
import {UsersEntity} from "@app/users/users.entity";

@Entity({name: 'rooms'})
export class ChannelEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({select: false, nullable: true})
    password: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password)
            this.password = await hash(this.password, 10);
    }

    @ManyToOne(() => UsersEntity, user => user.possession, {eager: true})
    owner: UsersEntity;
}