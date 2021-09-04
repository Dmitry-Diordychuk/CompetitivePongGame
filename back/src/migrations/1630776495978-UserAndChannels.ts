import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAndChannels1630776495978 implements MigrationInterface {
    name = 'UserAndChannels1630776495978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "ft_id" integer NOT NULL, "username" character varying NOT NULL, "image" character varying, "victories" integer NOT NULL DEFAULT '0', "losses" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_f0c815fe0b78bec847227710c17" UNIQUE ("ft_id"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channels" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "password" character varying, "ownerId" integer, CONSTRAINT "UQ_d01dd8a8e614e01b6ee24664661" UNIQUE ("name"), CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_connections_channels" ("usersId" integer NOT NULL, "channelsId" integer NOT NULL, CONSTRAINT "PK_c3e53440fae607431e6b51e733f" PRIMARY KEY ("usersId", "channelsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_464b72c18cf5ca2d092b099ff5" ON "users_connections_channels" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6f90de55cb3f04b69a7f33bd9b" ON "users_connections_channels" ("channelsId") `);
        await queryRunner.query(`ALTER TABLE "channels" ADD CONSTRAINT "FK_a8ad228e741ef741a3f6183a9c0" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_connections_channels" ADD CONSTRAINT "FK_464b72c18cf5ca2d092b099ff5b" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_connections_channels" ADD CONSTRAINT "FK_6f90de55cb3f04b69a7f33bd9b5" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_connections_channels" DROP CONSTRAINT "FK_6f90de55cb3f04b69a7f33bd9b5"`);
        await queryRunner.query(`ALTER TABLE "users_connections_channels" DROP CONSTRAINT "FK_464b72c18cf5ca2d092b099ff5b"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP CONSTRAINT "FK_a8ad228e741ef741a3f6183a9c0"`);
        await queryRunner.query(`DROP INDEX "IDX_6f90de55cb3f04b69a7f33bd9b"`);
        await queryRunner.query(`DROP INDEX "IDX_464b72c18cf5ca2d092b099ff5"`);
        await queryRunner.query(`DROP TABLE "users_connections_channels"`);
        await queryRunner.query(`DROP TABLE "channels"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
