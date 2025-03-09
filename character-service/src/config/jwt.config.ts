export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || '1234',
    expiresIn: 6000,

    characterSecret: process.env.JWT_CHARACTER_SECRET || '1234',
    characterExpiresIn: '24h'
};