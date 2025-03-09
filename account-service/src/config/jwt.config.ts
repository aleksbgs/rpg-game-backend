export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || '1234',          
    expiresIn: '100y',                             
    characterSecret: process.env.JWT_CHARACTER_SECRET || 'your_refresh_secret',  
    characterExpiresIn: '24h'      
};                     