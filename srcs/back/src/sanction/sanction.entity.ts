import {Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "@app/user/user.entity";

@Entity("sanctions")
export class SanctionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, user => user.sanctions, {eager: true})
    target: UserEntity;

    @Column()
    type: string;

    @CreateDateColumn()
    create_at: Date;

    @Column()
    expiry_at: Date;
}