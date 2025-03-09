import express from 'express';
import {initializeRedis}  from './config/cache.config';
import {AppDataSource, InitializeDatabase} from './config/database.config';
import combatRoutes from './routes/combat.routes';
import logger from './logger/logger';

const app = express();
app.use(express.json());



async function start() {
    try {
        await InitializeDatabase();
        await initializeRedis();
        console.log('Database Combat initialized');

        app.use('/api', combatRoutes);

        app.listen(3003, () => {
            logger.info('Combat Service running on port 3003');
        });
    } catch (error) {
        logger.error(`Error starting service: ${error}`);
        process.exit(1);
    }
}

start();