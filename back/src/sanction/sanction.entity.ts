import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "@app/user/user.entity";

@Entity("sanctions")
export class SanctionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => UserEntity)
    @JoinTable()
    target: UserEntity;

    @CreateDateColumn()
    create_at: Date;

    @Column()
    expiry_at: Date;
}