// account-service/src/data-source.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "rpg_db",
    synchronize: true,
    logging: true,
    entities: [User],
    migrations: ["src/database/migrations/*.ts"],
    subscribers: [],
});

