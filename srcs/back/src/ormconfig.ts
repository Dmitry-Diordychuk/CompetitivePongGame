import {ConnectionOptions} from "typeorm";

const config: ConnectionOptions = {
    type: 'postgres',
    host: 'postgres',//'localhost',//
    port: 5432,
    username: 'Admin',
    password: 'secret',
    database: 'ft_transcendence',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations'
    }
};

export default config;