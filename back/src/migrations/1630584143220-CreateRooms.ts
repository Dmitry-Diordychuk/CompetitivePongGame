import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateRooms1630584143220 implements MigrationInterface {
    name = 'CreateRooms1630584143220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rooms" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "token"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "token" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "rooms"`);
    }

}
