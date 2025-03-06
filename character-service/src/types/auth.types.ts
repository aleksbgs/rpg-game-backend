export enum UserRole {
  USER = 'User',
  GAME_MASTER = 'GameMaster'
}

// Payload structure of JWT tokens issued by Account Service
export interface JwtPayload {
  userId: string;       // Unique identifier of the user from account_schema.user
  role: UserRole;       // User's role (User or GameMaster)
  iat?: number;         // Issued at timestamp
  exp?: number;         // Expiration timestamp
}