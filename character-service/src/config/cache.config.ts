import { createClient, RedisClientType } from 'redis';

// Define the Redis client type
export let redisClient: RedisClientType;

// Initialize the Redis client
export async function initializeRedis() {
    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://:redis_password@localhost:6379',
        password: process.env.REDIS_PASSWORD || 'redis_password', // Optional, if Redis requires authentication
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis connected'));

    await redisClient.connect();
}

// Optional: Close the Redis connection (for cleanup or testing)
export async function closeRedis() {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
}