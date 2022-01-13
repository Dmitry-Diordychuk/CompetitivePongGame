import {MigrationInterface, QueryRunner} from "typeorm";

export class UserRole1639915382200 implements MigrationInterface {
    name = 'UserRole1639915382200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('User', 'Admin')`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'User'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
