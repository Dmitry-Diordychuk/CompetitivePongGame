import {MigrationInterface, QueryRunner} from "typeorm";

export class ChannelsAdminsUsers1631805167073 implements MigrationInterface {
    name = 'ChannelsAdminsUsers1631805167073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channels_admins_users" ("channelsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_010334e57f03aab2cc3ca208fbd" PRIMARY KEY ("channelsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_353b2ff0cb3c7bfd5837e53ec0" ON "channels_admins_users" ("channelsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_22c17121382bf6a460e639531f" ON "channels_admins_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "channels_admins_users" ADD CONSTRAINT "FK_353b2ff0cb3c7bfd5837e53ec02" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channels_admins_users" ADD CONSTRAINT "FK_22c17121382bf6a460e639531ff" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels_admins_users" DROP CONSTRAINT "FK_22c17121382bf6a460e639531ff"`);
        await queryRunner.query(`ALTER TABLE "channels_admins_users" DROP CONSTRAINT "FK_353b2ff0cb3c7bfd5837e53ec02"`);
        await queryRunner.query(`DROP INDEX "IDX_22c17121382bf6a460e639531f"`);
        await queryRunner.query(`DROP INDEX "IDX_353b2ff0cb3c7bfd5837e53ec0"`);
        await queryRunner.query(`DROP TABLE "channels_admins_users"`);
    }

}
