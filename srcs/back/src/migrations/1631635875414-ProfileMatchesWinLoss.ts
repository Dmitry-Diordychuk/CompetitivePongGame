import {MigrationInterface, QueryRunner} from "typeorm";

export class ProfileMatchesWinLoss1631635875414 implements MigrationInterface {
    name = 'ProfileMatchesWinLoss1631635875414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "matches" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "winnerId" integer, "loserId" integer, CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_eb5e9984be5b3bd5c8e3ef2d9ec" FOREIGN KEY ("winnerId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_cef9e772b8aa94040d5d9ce518a" FOREIGN KEY ("loserId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_cef9e772b8aa94040d5d9ce518a"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_eb5e9984be5b3bd5c8e3ef2d9ec"`);
        await queryRunner.query(`DROP TABLE "matches"`);
    }

}
