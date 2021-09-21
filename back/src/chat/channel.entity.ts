import {
    BeforeInsert,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {hash} from "bcrypt"
import {UserEntity} from "@app/user/user.entity";
import {SanctionEntity} from "@app/sanction/sanction.entity";

@Entity("channels")
export class ChannelEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({select: false, nullable: true})
    password: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await hash(this.password, 10);
        }
    }

    @ManyToOne(() => UserEntity, user => user.possessions, {eager: true})
    owner: UserEntity;

    @ManyToMany(() => UserEntity, user => user.connections, {eager: true})
    visitors: UserEntity[];

    @ManyToMany(() => UserEntity, {eager: true})
    @JoinTable()
    admins: UserEntity[];

    @ManyToMany(() => SanctionEntity)
    @JoinTable()
    sanctions: SanctionEntity[];
}