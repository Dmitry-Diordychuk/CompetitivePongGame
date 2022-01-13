import {MigrationInterface, QueryRunner} from "typeorm";

export class FixUsersConnectionsAndBlacklist1632251075650 implements MigrationInterface {
    name = 'FixUsersConnectionsAndBlacklist1632251075650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users_connections_channels" DROP CONSTRAINT "FK_6f90de55cb3f04b69a7f33bd9b5"`);
        await queryRunner.query(`ALTER TABLE "public"."users_connections_channels" ADD CONSTRAINT "FK_6f90de55cb3f04b69a7f33bd9b5" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users_connections_channels" DROP CONSTRAINT "FK_6f90de55cb3f04b69a7f33bd9b5"`);
        await queryRunner.query(`ALTER TABLE "public"."users_connections_channels" ADD CONSTRAINT "FK_6f90de55cb3f04b69a7f33bd9b5" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
