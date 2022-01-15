import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteProfileInfoFromUser1631034830402 implements MigrationInterface {
    name = 'DeleteProfileInfoFromUser1631034830402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "victories"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "losses"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "level"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "level" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "losses" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "victories" integer NOT NULL DEFAULT '0'`);
    }

}
