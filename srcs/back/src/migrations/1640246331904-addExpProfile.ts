import {MigrationInterface, QueryRunner} from "typeorm";

export class addExpProfile1640246331904 implements MigrationInterface {
    name = 'addExpProfile1640246331904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."profiles" ADD "exp" double precision NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."profiles" DROP COLUMN "exp"`);
    }

}
