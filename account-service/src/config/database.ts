import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

async function createDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "user",
        password: process.env.DB_PASSWORD || "password",
        database: "postgres",
    });

    try {
        await client.connect();
        const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'rpg_db'");
        if (res.rowCount === 0) {
            await client.query("CREATE DATABASE rpg_db;");
            console.log("Database 'rpg_db' created successfully.");
        }
    } catch (error) {
        console.error("Error creating database:", error);
    } finally {
        await client.end();
    }
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "rpg_db",
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: ["src/database/migrations/*.ts"],
    subscribers: [],
});

export async function initializeDatabase() {
    await createDatabase();
    await AppDataSource.initialize();
    console.log("Database connected");
    await AppDataSource.runMigrations();
    console.log("Migrations executed");
}
