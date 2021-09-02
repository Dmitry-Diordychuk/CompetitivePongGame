import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUser1630422445889 implements MigrationInterface {
    name = 'CreateUser1630422445889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "ft_id" integer NOT NULL, "username" character varying NOT NULL, "image" character varying NOT NULL, "token" character varying NOT NULL, "victories" integer NOT NULL, "losses" integer NOT NULL, "level" integer NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
