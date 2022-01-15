import {MigrationInterface, QueryRunner} from "typeorm";

export class UsersSanctions1632323478717 implements MigrationInterface {
    name = 'UsersSanctions1632323478717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sanctions" ADD "targetId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."sanctions" ADD CONSTRAINT "FK_f041f73e0d50d235bd486baffc9" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sanctions" DROP CONSTRAINT "FK_f041f73e0d50d235bd486baffc9"`);
        await queryRunner.query(`ALTER TABLE "public"."sanctions" DROP COLUMN "targetId"`);
    }

}
