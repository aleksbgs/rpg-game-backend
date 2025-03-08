import { createClient, RedisClientType } from 'redis';
export let redisClient: RedisClientType;

export async function initializeRedis() {
    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://:redis_password@localhost:6379',
        password: process.env.REDIS_PASSWORD || 'redis_password',
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis connected'));

    await redisClient.connect();
}


export async function closeRedis() {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
}