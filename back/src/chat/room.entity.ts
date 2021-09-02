import {BeforeInsert, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {hash} from "bcrypt"

@Entity({name: 'rooms'})
export class RoomEntity {
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
}