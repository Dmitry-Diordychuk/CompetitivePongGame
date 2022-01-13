import {MigrationInterface, QueryRunner} from "typeorm";

export class UserFriendsAndBlacklist1632140073170 implements MigrationInterface {
    name = 'UserFriendsAndBlacklist1632140073170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_friends_users" ("usersId_1" integer NOT NULL, "usersId_2" integer NOT NULL, CONSTRAINT "PK_d0b93e07874c78c16bdf28a24ca" PRIMARY KEY ("usersId_1", "usersId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a3b73d9dd6e964868c76294b77" ON "users_friends_users" ("usersId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_6803c4075d7779e2e27d6b14c3" ON "users_friends_users" ("usersId_2") `);
        await queryRunner.query(`CREATE TABLE "users_blacklist_users" ("usersId_1" integer NOT NULL, "usersId_2" integer NOT NULL, CONSTRAINT "PK_1fad04d321257c4ee66863fdaa1" PRIMARY KEY ("usersId_1", "usersId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e050881de764bf91e33dc7da34" ON "users_blacklist_users" ("usersId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_e1843f81e713f6636be29eca63" ON "users_blacklist_users" ("usersId_2") `);
        await queryRunner.query(`ALTER TABLE "users_friends_users" ADD CONSTRAINT "FK_a3b73d9dd6e964868c76294b77c" FOREIGN KEY ("usersId_1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_friends_users" ADD CONSTRAINT "FK_6803c4075d7779e2e27d6b14c34" FOREIGN KEY ("usersId_2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_blacklist_users" ADD CONSTRAINT "FK_e050881de764bf91e33dc7da34f" FOREIGN KEY ("usersId_1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_blacklist_users" ADD CONSTRAINT "FK_e1843f81e713f6636be29eca632" FOREIGN KEY ("usersId_2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_blacklist_users" DROP CONSTRAINT "FK_e1843f81e713f6636be29eca632"`);
        await queryRunner.query(`ALTER TABLE "users_blacklist_users" DROP CONSTRAINT "FK_e050881de764bf91e33dc7da34f"`);
        await queryRunner.query(`ALTER TABLE "users_friends_users" DROP CONSTRAINT "FK_6803c4075d7779e2e27d6b14c34"`);
        await queryRunner.query(`ALTER TABLE "users_friends_users" DROP CONSTRAINT "FK_a3b73d9dd6e964868c76294b77c"`);
        await queryRunner.query(`DROP INDEX "IDX_e1843f81e713f6636be29eca63"`);
        await queryRunner.query(`DROP INDEX "IDX_e050881de764bf91e33dc7da34"`);
        await queryRunner.query(`DROP TABLE "users_blacklist_users"`);
        await queryRunner.query(`DROP INDEX "IDX_6803c4075d7779e2e27d6b14c3"`);
        await queryRunner.query(`DROP INDEX "IDX_a3b73d9dd6e964868c76294b77"`);
        await queryRunner.query(`DROP TABLE "users_friends_users"`);
    }

}
