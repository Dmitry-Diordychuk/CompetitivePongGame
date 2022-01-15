import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveBanListAndMuteListChannelsEntity1632239943720 implements MigrationInterface {
    name = 'RemoveBanListAndMuteListChannelsEntity1632239943720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sanctions" ("id" SERIAL NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "expiry_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_29bef7647676bb7ec707f29b18f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sanctions_target_users" ("sanctionsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_ee48d59758ebb1bcfea2ebcfd04" PRIMARY KEY ("sanctionsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_682460d78d46dc3b5119d2707e" ON "sanctions_target_users" ("sanctionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_316336646f71dc6a8e027096f4" ON "sanctions_target_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "sanctions_target_users" ADD CONSTRAINT "FK_682460d78d46dc3b5119d2707e4" FOREIGN KEY ("sanctionsId") REFERENCES "sanctions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "sanctions_target_users" ADD CONSTRAINT "FK_316336646f71dc6a8e027096f45" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sanctions_target_users" DROP CONSTRAINT "FK_316336646f71dc6a8e027096f45"`);
        await queryRunner.query(`ALTER TABLE "sanctions_target_users" DROP CONSTRAINT "FK_682460d78d46dc3b5119d2707e4"`);
        await queryRunner.query(`DROP INDEX "IDX_316336646f71dc6a8e027096f4"`);
        await queryRunner.query(`DROP INDEX "IDX_682460d78d46dc3b5119d2707e"`);
        await queryRunner.query(`DROP TABLE "sanctions_target_users"`);
        await queryRunner.query(`DROP TABLE "sanctions"`);
    }

}
