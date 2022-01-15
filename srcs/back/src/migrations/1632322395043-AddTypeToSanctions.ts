import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTypeToSanctions1632322395043 implements MigrationInterface {
    name = 'AddTypeToSanctions1632322395043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sanctions" ADD "type" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sanctions" DROP COLUMN "type"`);
    }

}
