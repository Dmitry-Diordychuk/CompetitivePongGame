import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUserToRoomsRelationTable1630584559239 implements MigrationInterface {
    name = 'CreateUserToRoomsRelationTable1630584559239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_rooms_rooms" ("usersId" integer NOT NULL, "roomsId" integer NOT NULL, CONSTRAINT "PK_70f0b3aef34e4e66970a4957278" PRIMARY KEY ("usersId", "roomsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_be046c829cc9f45adfe322e75e" ON "users_rooms_rooms" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_df57dc27d23e464abaa467017a" ON "users_rooms_rooms" ("roomsId") `);
        await queryRunner.query(`ALTER TABLE "users_rooms_rooms" ADD CONSTRAINT "FK_be046c829cc9f45adfe322e75e7" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_rooms_rooms" ADD CONSTRAINT "FK_df57dc27d23e464abaa467017a7" FOREIGN KEY ("roomsId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_rooms_rooms" DROP CONSTRAINT "FK_df57dc27d23e464abaa467017a7"`);
        await queryRunner.query(`ALTER TABLE "users_rooms_rooms" DROP CONSTRAINT "FK_be046c829cc9f45adfe322e75e7"`);
        await queryRunner.query(`DROP INDEX "IDX_df57dc27d23e464abaa467017a"`);
        await queryRunner.query(`DROP INDEX "IDX_be046c829cc9f45adfe322e75e"`);
        await queryRunner.query(`DROP TABLE "users_rooms_rooms"`);
    }

}
