import {MigrationInterface, QueryRunner} from "typeorm";

export class UserIsTwoFactorEnable1631282848992 implements MigrationInterface {
    name = 'UserIsTwoFactorEnable1631282848992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "isTwoFactorAuthenticationEnable" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "isTwoFactorAuthenticationEnable"`);
    }

}
