import express from 'express';
import {initializeRedis}  from './config/cache.config';
import characterRoutes from './routes/character.routes';
import {InitializeDatabase} from "./config/database.config";

const app = express();
app.use(express.json());

async function start() {
    try {
        await InitializeDatabase();
        await initializeRedis();
        console.log('Database Characters initialized');

        app.use('/api', characterRoutes);

        app.listen(3002, () => {
            console.log('Character Service running on port 3002');
        });
    } catch (error) {
        console.error('Error starting character service:', error);
        process.exit(1);
    }
}

start();

export default app;