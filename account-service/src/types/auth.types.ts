export interface JwtPayload {
    userId: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export enum UserRole {
    USER = 'User',
    GAME_MASTER = 'GameMaster'
}