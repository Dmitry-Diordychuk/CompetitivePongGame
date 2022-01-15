import {MigrationInterface, QueryRunner} from "typeorm";

export class UserProfile1631107046995 implements MigrationInterface {
    name = 'UserProfile1631107046995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "victories" integer NOT NULL DEFAULT '0', "losses" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "ft_profile" character varying NOT NULL, "image" character varying NOT NULL, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "ft_profile"`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD CONSTRAINT "UQ_b1bda35cdb9a2c1b777f5541d87" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "UQ_b1bda35cdb9a2c1b777f5541d87"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "ft_profile" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "image" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "profiles"`);
    }

}
