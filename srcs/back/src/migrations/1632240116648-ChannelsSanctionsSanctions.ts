import {MigrationInterface, QueryRunner} from "typeorm";

export class ChannelsSanctionsSanctions1632240116648 implements MigrationInterface {
    name = 'ChannelsSanctionsSanctions1632240116648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channels_sanctions_sanctions" ("channelsId" integer NOT NULL, "sanctionsId" integer NOT NULL, CONSTRAINT "PK_3bcc72ca4e7770fb7ea09976919" PRIMARY KEY ("channelsId", "sanctionsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e473ab87d597e8a0c8c5bb1fd4" ON "channels_sanctions_sanctions" ("channelsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e3a5c1f3842d7541ec58aafd8" ON "channels_sanctions_sanctions" ("sanctionsId") `);
        await queryRunner.query(`ALTER TABLE "channels_sanctions_sanctions" ADD CONSTRAINT "FK_e473ab87d597e8a0c8c5bb1fd40" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channels_sanctions_sanctions" ADD CONSTRAINT "FK_0e3a5c1f3842d7541ec58aafd81" FOREIGN KEY ("sanctionsId") REFERENCES "sanctions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels_sanctions_sanctions" DROP CONSTRAINT "FK_0e3a5c1f3842d7541ec58aafd81"`);
        await queryRunner.query(`ALTER TABLE "channels_sanctions_sanctions" DROP CONSTRAINT "FK_e473ab87d597e8a0c8c5bb1fd40"`);
        await queryRunner.query(`DROP INDEX "IDX_0e3a5c1f3842d7541ec58aafd8"`);
        await queryRunner.query(`DROP INDEX "IDX_e473ab87d597e8a0c8c5bb1fd4"`);
        await queryRunner.query(`DROP TABLE "channels_sanctions_sanctions"`);
    }

}
