import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDb1630422445889 implements MigrationInterface {
    name = 'SeedDb1630422445889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        /*
        Token формируется из
        id
        ft_id
        username

        Алгоритм HS256
        Тип JWT
         */
        await queryRunner.query(`INSERT INTO users (ft_id, username, image, token, victories, losses, level) VALUES (42, 'kdustin', 'mock', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZnRfaWQiOjQyLCJ1c2VybmFtZSI6ImtkdXN0aW4ifQ.mm-PPgfozTm5ry6tw32yDDG1Sopbg8e3msPcFUElMIc', 1, 1, 1);`);

        await queryRunner.query(`INSERT INTO users (ft_id, username, image, token, victories, losses, level) VALUES (21, 'ksilver', 'mock', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZnRfaWQiOjIxLCJ1c2VybmFtZSI6ImtzaWx2ZXIifQ.S_eWeRjsHdNNCcduVZFufB-ZIfic1VdjAjItSuGBBxw', 1, 1, 1);`);

        await queryRunner.query(`INSERT INTO users (ft_id, username, image, token, victories, losses, level) VALUES (24, 'yulia', 'mock', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZnRfaWQiOjI0LCJ1c2VybmFtZSI6Inl1bGlhIn0.SzH5kM7sTi3x6NmJhJayUsWtzPxToM1R3SL9vhFtsAo', 1, 1, 1);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
