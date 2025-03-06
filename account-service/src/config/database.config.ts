import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Client } from 'pg'; // You'll need to install 'pg' package

// Export the DataSource configuration
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'rpg_db',
    synchronize: true, // Set to false since we'll use migrations
    logging: process.env.NODE_ENV !== 'production',
    entities: [User],
    migrations: ['src/migrations/*.ts'],
    migrationsRun: true, // Automatically run migrations on startup
});
