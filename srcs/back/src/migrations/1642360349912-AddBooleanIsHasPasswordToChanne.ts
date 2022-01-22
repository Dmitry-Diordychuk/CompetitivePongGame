import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBooleanIsHasPasswordToChanne1642360349912 implements MigrationInterface {
    name = 'AddBooleanIsHasPasswordToChanne1642360349912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."channels" ADD "isHasPassword" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."channels" DROP COLUMN "isHasPassword"`);
    }

}
