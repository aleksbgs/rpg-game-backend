import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Character } from '../entity/Character';
import { Class } from '../entity/Class';
import { Item } from '../entity/Item';


export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME_CHARACTER_SERVICE || "character_db",
    synchronize: true,
    logging: true,
    entities: [User,Character,Class,Item],
    migrations: ["src/database/migrations/*.ts"],
    subscribers: [],
});
