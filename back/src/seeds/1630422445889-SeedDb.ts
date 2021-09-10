import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDb1630422445889 implements MigrationInterface {
    name = 'SeedDb1630422445889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Profiles
        await queryRunner.query(`INSERT INTO profiles (id, ft_profile, image) VALUES (101, 'link_1', 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png');`);
        await queryRunner.query(`INSERT INTO profiles (id, ft_profile, image) VALUES (102, 'link_2', 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png');`);
        await queryRunner.query(`INSERT INTO profiles (id, ft_profile, image) VALUES (103, 'link_3', 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png');`);

        // Users
        /*
        Token формируется из
        id
        ft_id
        username

        Алгоритм HS256
        Тип JWT
         */
        // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJmdF9pZCI6IjEiLCJ1c2VybmFtZSI6IkFfdXNlciJ9.y9PIFkhmxRLk33kSCb7anXConFNsJE6HNf6191KC0NQ
        await queryRunner.query(`INSERT INTO users (id, ft_id, username, "profileId") VALUES (101, 1, 'A_user', 101);`);

        // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJmdF9pZCI6IjIiLCJ1c2VybmFtZSI6IkJfdXNlciJ9.6VKBZGIAfDKJTLSNmxNRGIgV4ivYZkFVHjsfIUK609k
        await queryRunner.query(`INSERT INTO users (id, ft_id, username, "profileId") VALUES (102, 2, 'B_user', 102);`);

        // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJmdF9pZCI6IjMiLCJ1c2VybmFtZSI6IkNfdXNlciJ9.OHAcnZfygngJeGYxFMU-SIh9bMe9iF7ZhPQeOIOp3Yc
        await queryRunner.query(`INSERT INTO users (id, ft_id, username, "profileId") VALUES (103, 3, 'C_user', 103);`);


        // Achievements
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (101, 'achievement_1', 'make something_1');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (102, 'achievement_2', 'make something_2');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (103, 'A_achievement', 'make something_3');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (104, 'B_achievement', 'make something_4');`);


        // Add achievements to profiles
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 101);`);
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 102);`);
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 103);`);
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 104);`);
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (102, 104);`);
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (103, 103);`);
        await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (103, 104);`);


        // Channels
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('channel_1', null, 101);`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('channel_2', null, 101);`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('channel_3', null, 101);`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('A_channel', null, 102);`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('B_channel', null, 102);`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('C_channel', null, 103);`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId") VALUES ('X_channel', null, 103);`);


        // Add connections
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (101, 1);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (101, 2);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (101, 3);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (102, 4);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (102, 5);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (103, 6);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (103, 7);`);

        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (101, 4);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (101, 7);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (102, 1);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (102, 2);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (102, 6);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (103, 3);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (103, 4);`);
        await queryRunner.query(`INSERT INTO users_connections_channels ("usersId", "channelsId") VALUES (103, 5);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
