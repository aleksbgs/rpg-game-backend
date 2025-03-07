export enum UserRole {
  USER = 'User',
  GAME_MASTER = 'GameMaster'
}

// Payload structure of JWT tokens issued by Account Service
export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}