import { DataSource } from 'typeorm';
import { Character } from '../entity/Character';
import { Class } from "../entity/Class";
import { Item } from "../entity/Item";
import { User } from "../entity/User";
import { Client } from 'pg'; 


const schemaName = process.env.DB_CHARACTER_SCHEMA || 'character_schema';


async function ensureCharacterSchemaExists() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'rpg_db',
    });

    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await client.end();
    console.log(`✅ Schema "${schemaName}" ensured in the database.`);
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
    entities: [Character, User, Class, Item],
    migrations: ['src/migrations/*.ts'],
    migrationsRun: true,
    extra: {
        schema: schemaName,
    },
});

export async function InitializeDatabase() {
    try {

        await ensureCharacterSchemaExists();


        await AppDataSource.initialize();

        if (process.env.NODE_ENV === 'production') {
            await AppDataSource.runMigrations();
        }

        console.log('✅ Character Service database initialized');
    } catch (error) {
        console.error('❌ Error initializing Character Service database:', error);
        throw error;
    }
}

export async function CloseDatabase() {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('✅ Character Service database connection closed');
    }
}
