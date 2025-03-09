import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Client } from 'pg';

const schemaName = process.env.DB_ACCOUNT_SCHEMA || 'account_schema';


async function ensureAccountSchemaExists() {

    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'rpg_db',
    });

    await client.connect();
    let result = await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await client.end();
    console.log(`✅ Schema "${schemaName}" ensured in the database.${result}`);
}


export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'rpg_db',
    schema: schemaName,
    synchronize: true,
    logging: process.env.NODE_ENV === 'production',
    entities: [User],
    migrations: ['src/migrations/*.ts'],
    migrationsRun: true,
    extra: {
        schema: schemaName,
    },
});

export async function InitializeDatabase() {
    try {

        await ensureAccountSchemaExists();

        await AppDataSource.initialize();

        if (process.env.NODE_ENV === 'production') {
            await AppDataSource.runMigrations();
        }

        console.log('✅ Account Service database initialized');
    } catch (error) {
        console.error('❌ Error initializing Account Service database:', error);
        throw error;
    }
}

export async function CloseDatabase() {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('✅ Account Service database connection closed');
    }
}