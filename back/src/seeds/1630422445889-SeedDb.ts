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
        // Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZnRfaWQiOjQyLCJ1c2VybmFtZSI6ImtkdXN0aW4ifQ.PfB_iGFWHoOMuuM6vkLyabPurAmkppyXEZxIocOFIC0
        await queryRunner.query(`INSERT INTO users (ft_id, username, image, victories, losses, level) VALUES (42, 'kdustin', 'mock', 1, 1, 1);`);

        // Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZnRfaWQiOjIxLCJ1c2VybmFtZSI6ImtzaWx2ZXIifQ.LkAJdh4ngJM5By9Q_rx04aeTnw_k5EF4sCMxLHueZnw
        await queryRunner.query(`INSERT INTO users (ft_id, username, image, victories, losses, level) VALUES (21, 'ksilver', 'mock', 1, 1, 1);`);

        // Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZnRfaWQiOjI0LCJ1c2VybmFtZSI6Inl1bGlhIn0.V7tqdkWE-aMW4Nc-QSg8XPFcT9iGQ1nl88S2Bcx9dS8
        await queryRunner.query(`INSERT INTO users (ft_id, username, image, victories, losses, level) VALUES (24, 'yulia', 'mock', 1, 1, 1);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
