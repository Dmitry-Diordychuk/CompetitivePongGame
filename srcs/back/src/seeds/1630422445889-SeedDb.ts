import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDb1630422445889 implements MigrationInterface {
    name = 'SeedDb1630422445889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Profiles
        await queryRunner.query(
            `INSERT INTO profiles (id, "ftProfile", image) VALUES (101, 'link_1', 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png');`
        );
        await queryRunner.query(
            `INSERT INTO profiles (id, "ftProfile", image) VALUES (102, 'link_2', 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png');`
        );
        await queryRunner.query(
            `INSERT INTO profiles (id, "ftProfile", image) VALUES (103, 'link_3', 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png');`
        );

        // Users
        /*
            Token формируется из
            id
            ft_id
            username

            Алгоритм HS256
            Тип JWT
         */
        // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMSIsImZ0X2lkIjoiMSIsInVzZXJuYW1lIjoiQV91c2VyIn0.uIUje5AHnK4fi1b21vvzN1XO_eP20slTPPchWFj3g0E
        await queryRunner.query(`INSERT INTO users (id, "ftId", username, role, "profileId") VALUES (101, 1, 'A_user', 'PO', 101);`);

        // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMiIsImZ0X2lkIjoiMiIsInVzZXJuYW1lIjoiQl91c2VyIn0.yZvTcANIHFMlWwyTluOwCGbR3jHe-hQfGc-OsCK_UvM
        await queryRunner.query(`INSERT INTO users (id, "ftId", username, role, "profileId") VALUES (102, 2, 'B_user', 'User', 102);`);

        // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMyIsImZ0X2lkIjoiMyIsInVzZXJuYW1lIjoiQ191c2VyIn0.ijI9lgVwE0aVKHtrVexVsD3IM43TVJUoeZwzOFx6C0M
        await queryRunner.query(`INSERT INTO users (id, "ftId", username, role, "profileId") VALUES (103, 3, 'C_user', 'User', 103);`);


        // Achievements
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (1, '1ая игра', 'Первый шаг');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (2, '3я игра', 'Спасибо что с нами');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (3, '7ая игра', 'Добро пожаловать в задроты');`);

        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (4, '1ая победа', '1ая победа');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (5, '3ая победа', '3ая победа');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (6, '5ая победа', '5ая победа');`);

        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (7, '3я победа подряд', 'А ты что-то можешь');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (8, '4я победа подряд', 'Неплохая серия');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (9, '5я победа подряд', 'Дорога на чемпионат');`);

        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (10, 'Смена аватарки', 'У вас ус отклеился');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (11, 'Смена ника', 'Загранпаспорт');`);

        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (12, '1ое поражение', 'Всякое бывает');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (13, '2ое поражение', 'Не первый раз замужем');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (14, '5ое поражение', 'Вперёд, лузеры');`);

        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (15, '2ое поражение подряд', 'Ну, бывает');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (16, '3ое поражение подряд', 'Так держать');`);
        await queryRunner.query(` INSERT INTO achievements(id, title, description) VALUES (17, '4ое поражение подряд', 'А ты неплох');`);


        // // Add achievements to profiles
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 101);`);
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 102);`);
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 103);`);
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (101, 104);`);
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (102, 104);`);
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (103, 103);`);
        // await queryRunner.query(`INSERT INTO profiles_achievements_achievements ("profilesId", "achievementsId") VALUES (103, 104);`);


        // Channels
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('channel_1', null, 101, 'false');`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('channel_2', null, 101, 'false');`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('channel_3', null, 101, 'false');`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('A_channel', null, 102, 'false');`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('B_channel', null, 102, 'false');`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('C_channel', null, 103, 'false');`);
        await queryRunner.query(`INSERT INTO channels (name, password, "ownerId", "isHasPassword") VALUES ('X_channel', null, 103, 'false');`);


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
