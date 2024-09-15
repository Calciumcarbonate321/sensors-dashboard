import Redis from 'ioredis';

const getRedisClient = () => {
    const client = new Redis({
        host: process.env.REDIS_HOST || '0.0.0.0', 
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379, 
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME || "default",
    });

    client.on('error', (err) => {
        console.error('Redis client error', err);
    });

    return client;
};

export default getRedisClient;