import { DataSource } from 'typeorm';
import { Duel } from "../entity/Duel";
import { DuelAction } from "../entity/DuelAction";
import { Client } from 'pg';


const schemaName = process.env.DB_COMBAT_SCHEMA || 'combat_schema';

async function ensureCombatSchemaExists() {

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
    entities: [Duel,DuelAction],
    migrations: ['src/migrations/*.ts'],
    migrationsRun: false,
    extra: {
        schema: schemaName,
    },
});

export async function InitializeDatabase() {
    try {

        await ensureCombatSchemaExists();

        await AppDataSource.initialize();

        if (process.env.NODE_ENV === 'production') {
            await AppDataSource.runMigrations();
        }

        console.log('✅ Combat Service database initialized');
    } catch (error) {
        console.error('❌ Error initializing Combat Service database:', error);
        throw error;
    }
}

export async function CloseDatabase() {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('✅ Combat Service database connection closed');
    }
}
