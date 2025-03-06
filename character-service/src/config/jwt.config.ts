export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'your-default-secret-key',
    expiresIn: 60,

    characterSecret: process.env.JWT_CHARACTER_SECRET || 'your_refresh_secret',
    characterExpiresIn: '24h'
};