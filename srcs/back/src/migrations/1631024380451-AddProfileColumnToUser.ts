import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProfileColumnToUser1631024380451 implements MigrationInterface {
    name = 'AddProfileColumnToUser1631024380451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "ft_profile" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "UQ_f0c815fe0b78bec847227710c17"`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "image" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "image" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD CONSTRAINT "UQ_f0c815fe0b78bec847227710c17" UNIQUE ("ft_id")`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "ft_profile"`);
    }

}
