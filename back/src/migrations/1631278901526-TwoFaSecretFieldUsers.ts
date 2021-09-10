import {MigrationInterface, QueryRunner} from "typeorm";

export class TwoFaSecretFieldUsers1631278901526 implements MigrationInterface {
    name = 'TwoFaSecretFieldUsers1631278901526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "twoFactorAuthenticationsSecret" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "twoFactorAuthenticationsSecret"`);
    }

}
