import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeUsersConnectionsChannelsBiDirectional1632154612556 implements MigrationInterface {
    name = 'MakeUsersConnectionsChannelsBiDirectional1632154612556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE "users_blacklist_channels" ("usersId" integer NOT NULL, "channelsId" integer NOT NULL, CONSTRAINT "PK_f4172e3938e33479cd6b19a6530" PRIMARY KEY ("usersId", "channelsId"))`);
        // await queryRunner.query(`CREATE INDEX "IDX_7d060ac9363d8ba897edefea66" ON "users_blacklist_channels" ("usersId") `);
        // await queryRunner.query(`CREATE INDEX "IDX_04a1fbd70d389e1fbefacde6b6" ON "users_blacklist_channels" ("channelsId") `);
        // await queryRunner.query(`ALTER TABLE "users_blacklist_channels" ADD CONSTRAINT "FK_7d060ac9363d8ba897edefea666" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        // await queryRunner.query(`ALTER TABLE "users_blacklist_channels" ADD CONSTRAINT "FK_04a1fbd70d389e1fbefacde6b6a" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "users_blacklist_channels" DROP CONSTRAINT "FK_04a1fbd70d389e1fbefacde6b6a"`);
        // await queryRunner.query(`ALTER TABLE "users_blacklist_channels" DROP CONSTRAINT "FK_7d060ac9363d8ba897edefea666"`);
        // await queryRunner.query(`DROP INDEX "IDX_04a1fbd70d389e1fbefacde6b6"`);
        // await queryRunner.query(`DROP INDEX "IDX_7d060ac9363d8ba897edefea66"`);
        // await queryRunner.query(`DROP TABLE "users_blacklist_channels"`);
    }

}
