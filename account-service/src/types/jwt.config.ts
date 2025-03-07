export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || '1234',
    expiresIn: '1h'
};