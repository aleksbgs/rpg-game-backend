// account-service/src/index.ts
import express from 'express';
import { AppDataSource } from './config/database';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());

// Mount the auth routes
app.use('/api', authRoutes);

async function start() {
    try {
        await AppDataSource.initialize();
        await AppDataSource.runMigrations();
        console.log('Database initialized');

        app.listen(3001, () => {
            console.log('Account Service running on port 3001');
        });
    } catch (error) {
        console.error('Error starting service:', error);
        process.exit(1);
    }
}

start();