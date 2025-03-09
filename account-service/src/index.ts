import express from 'express';
import { AppDataSource,InitializeDatabase } from './config/database.config';
import authRoutes from './routes/auth.routes';


const app = express();
app.use(express.json());


app.use('/api', authRoutes);

async function start() {
    try {
        await InitializeDatabase();
        await AppDataSource.runMigrations();
        console.log('Database Account Service initialized');

        app.listen(3001, () => {
            console.log('Account Service running on port 3001');
        });
    } catch (error) {
        console.error('Error starting account service:', error);
        process.exit(1);
    }
}

start();