import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_USER: process.env.DB_USER || "user",
    DB_PASSWORD: process.env.DB_PASSWORD || "password",
    DB_NAME: process.env.DB_NAME || "rpg_db",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    JWT_SECRET: process.env.JWT_SECRET || "ACCESS_SECRET",
};
