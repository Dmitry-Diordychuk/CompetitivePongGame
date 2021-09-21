import {MigrationInterface, QueryRunner} from "typeorm";

export class ProfileUserFriends1631543796790 implements MigrationInterface {
    name = 'ProfileUserFriends1631543796790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE "friend_requests" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "creatorId" integer NOT NULL, "receiverId" integer NOT NULL, CONSTRAINT "PK_3827ba86ce64ecb4b90c92eeea6" PRIMARY KEY ("id"))`);
        // await queryRunner.query(`ALTER TABLE "friend_requests" ADD CONSTRAINT "FK_ca033006b753f52f8c6892e179d" FOREIGN KEY ("creatorId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE "friend_requests" ADD CONSTRAINT "FK_97c256506348f9347b3a8a35629" FOREIGN KEY ("receiverId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "friend_requests" DROP CONSTRAINT "FK_97c256506348f9347b3a8a35629"`);
        // await queryRunner.query(`ALTER TABLE "friend_requests" DROP CONSTRAINT "FK_ca033006b753f52f8c6892e179d"`);
        // await queryRunner.query(`DROP TABLE "friend_requests"`);
    }

}
