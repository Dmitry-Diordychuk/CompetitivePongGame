import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameFtFields1631875399272 implements MigrationInterface {
    name = 'RenameFtFields1631875399272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."profiles" RENAME COLUMN "ft_profile" TO "ftProfile"`);
        await queryRunner.query(`ALTER TABLE "public"."users" RENAME COLUMN "ft_id" TO "ftId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" RENAME COLUMN "ftId" TO "ft_id"`);
        await queryRunner.query(`ALTER TABLE "public"."profiles" RENAME COLUMN "ftProfile" TO "ft_profile"`);
    }

}
