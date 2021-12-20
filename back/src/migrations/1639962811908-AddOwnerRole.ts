import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOwnerRole1639962811908 implements MigrationInterface {
    name = 'AddOwnerRole1639962811908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('User', 'Admin', 'Owner')`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'User'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('User', 'Admin')`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'User'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
    }

}
