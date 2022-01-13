import {MigrationInterface, QueryRunner} from "typeorm";

export class MatchCommentsComments1632163014373 implements MigrationInterface {
    name = 'MatchCommentsComments1632163014373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "authorId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "matches_comments_comments" ("matchesId" integer NOT NULL, "commentsId" integer NOT NULL, CONSTRAINT "PK_e7bf9f8279bf94457e003464d2b" PRIMARY KEY ("matchesId", "commentsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_847fc62173ca914f207598b3e4" ON "matches_comments_comments" ("matchesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c76531c8817ddadc72ca97a952" ON "matches_comments_comments" ("commentsId") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches_comments_comments" ADD CONSTRAINT "FK_847fc62173ca914f207598b3e40" FOREIGN KEY ("matchesId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "matches_comments_comments" ADD CONSTRAINT "FK_c76531c8817ddadc72ca97a952f" FOREIGN KEY ("commentsId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches_comments_comments" DROP CONSTRAINT "FK_c76531c8817ddadc72ca97a952f"`);
        await queryRunner.query(`ALTER TABLE "matches_comments_comments" DROP CONSTRAINT "FK_847fc62173ca914f207598b3e40"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`DROP INDEX "IDX_c76531c8817ddadc72ca97a952"`);
        await queryRunner.query(`DROP INDEX "IDX_847fc62173ca914f207598b3e4"`);
        await queryRunner.query(`DROP TABLE "matches_comments_comments"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
