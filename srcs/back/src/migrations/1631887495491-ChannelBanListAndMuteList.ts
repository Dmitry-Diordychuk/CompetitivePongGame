import {MigrationInterface, QueryRunner} from "typeorm";

export class ChannelBanListAndMuteList1631887495491 implements MigrationInterface {
    name = 'ChannelBanListAndMuteList1631887495491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE "channels_ban_list_users" ("channelsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_3cfae8d51ed1739126dcd31301a" PRIMARY KEY ("channelsId", "usersId"))`);
        // await queryRunner.query(`CREATE INDEX "IDX_a357dce18afe6dff43e8e39598" ON "channels_ban_list_users" ("channelsId") `);
        // await queryRunner.query(`CREATE INDEX "IDX_67783696aea5587532c572e9b2" ON "channels_ban_list_users" ("usersId") `);
        // await queryRunner.query(`CREATE TABLE "channels_mute_list_users" ("channelsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_b6db580786c2ef0121f8abed080" PRIMARY KEY ("channelsId", "usersId"))`);
        // await queryRunner.query(`CREATE INDEX "IDX_c8383c832439aca26f6baa9d8e" ON "channels_mute_list_users" ("channelsId") `);
        // await queryRunner.query(`CREATE INDEX "IDX_c476474d583d8cbeab8a02aaf4" ON "channels_mute_list_users" ("usersId") `);
        // await queryRunner.query(`ALTER TABLE "channels_ban_list_users" ADD CONSTRAINT "FK_a357dce18afe6dff43e8e39598c" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        // await queryRunner.query(`ALTER TABLE "channels_ban_list_users" ADD CONSTRAINT "FK_67783696aea5587532c572e9b2b" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        // await queryRunner.query(`ALTER TABLE "channels_mute_list_users" ADD CONSTRAINT "FK_c8383c832439aca26f6baa9d8e0" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        // await queryRunner.query(`ALTER TABLE "channels_mute_list_users" ADD CONSTRAINT "FK_c476474d583d8cbeab8a02aaf4d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "channels_mute_list_users" DROP CONSTRAINT "FK_c476474d583d8cbeab8a02aaf4d"`);
        // await queryRunner.query(`ALTER TABLE "channels_mute_list_users" DROP CONSTRAINT "FK_c8383c832439aca26f6baa9d8e0"`);
        // await queryRunner.query(`ALTER TABLE "channels_ban_list_users" DROP CONSTRAINT "FK_67783696aea5587532c572e9b2b"`);
        // await queryRunner.query(`ALTER TABLE "channels_ban_list_users" DROP CONSTRAINT "FK_a357dce18afe6dff43e8e39598c"`);
        // await queryRunner.query(`DROP INDEX "IDX_c476474d583d8cbeab8a02aaf4"`);
        // await queryRunner.query(`DROP INDEX "IDX_c8383c832439aca26f6baa9d8e"`);
        // await queryRunner.query(`DROP TABLE "channels_mute_list_users"`);
        // await queryRunner.query(`DROP INDEX "IDX_67783696aea5587532c572e9b2"`);
        // await queryRunner.query(`DROP INDEX "IDX_a357dce18afe6dff43e8e39598"`);
        // await queryRunner.query(`DROP TABLE "channels_ban_list_users"`);
    }

}
