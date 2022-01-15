import {MigrationInterface, QueryRunner} from "typeorm";

export class ProfileAchievements1631122633129 implements MigrationInterface {
    name = 'ProfileAchievements1631122633129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "achievements" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profiles_achievements_achievements" ("profilesId" integer NOT NULL, "achievementsId" integer NOT NULL, CONSTRAINT "PK_6ec33a43200634bf55853d995eb" PRIMARY KEY ("profilesId", "achievementsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25e4ce65606bd3908b9e25536c" ON "profiles_achievements_achievements" ("profilesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6281915a18d8bdcd4459983c81" ON "profiles_achievements_achievements" ("achievementsId") `);
        await queryRunner.query(`ALTER TABLE "profiles_achievements_achievements" ADD CONSTRAINT "FK_25e4ce65606bd3908b9e25536ce" FOREIGN KEY ("profilesId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "profiles_achievements_achievements" ADD CONSTRAINT "FK_6281915a18d8bdcd4459983c811" FOREIGN KEY ("achievementsId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles_achievements_achievements" DROP CONSTRAINT "FK_6281915a18d8bdcd4459983c811"`);
        await queryRunner.query(`ALTER TABLE "profiles_achievements_achievements" DROP CONSTRAINT "FK_25e4ce65606bd3908b9e25536ce"`);
        await queryRunner.query(`DROP INDEX "IDX_6281915a18d8bdcd4459983c81"`);
        await queryRunner.query(`DROP INDEX "IDX_25e4ce65606bd3908b9e25536c"`);
        await queryRunner.query(`DROP TABLE "profiles_achievements_achievements"`);
        await queryRunner.query(`DROP TABLE "achievements"`);
    }

}
