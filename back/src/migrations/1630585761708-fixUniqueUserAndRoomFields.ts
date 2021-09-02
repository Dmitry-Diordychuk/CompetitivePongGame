import {MigrationInterface, QueryRunner} from "typeorm";

export class fixUniqueUserAndRoomFields1630585761708 implements MigrationInterface {
    name = 'fixUniqueUserAndRoomFields1630585761708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."rooms" ADD CONSTRAINT "UQ_48b79438f8707f3d9ca83d85ea0" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "public"."rooms" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD CONSTRAINT "UQ_f0c815fe0b78bec847227710c17" UNIQUE ("ft_id")`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "image" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "victories" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "losses" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "level" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "level" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "losses" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "victories" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "image" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "UQ_f0c815fe0b78bec847227710c17"`);
        await queryRunner.query(`ALTER TABLE "public"."rooms" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."rooms" DROP CONSTRAINT "UQ_48b79438f8707f3d9ca83d85ea0"`);
    }

}
