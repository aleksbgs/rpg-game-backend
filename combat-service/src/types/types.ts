// combat-service/src/types.ts
import { Request } from 'express';

// Authentication types
export enum UserRole {
  USER = 'User',
  GAME_MASTER = 'GameMaster'
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload; // Updated to use JwtPayload
}

export interface Duel {
  id: number;
  challengerId: string; // String (UUID)
  opponentId: string;   // String (UUID)
  status: 'active' | 'completed' | 'draw';
  startedAt: Date;
  endedAt: Date | null;
  actions?: DuelAction[];
}

export interface DuelAction {
  id: number;
  duel: Duel;
  duelId: number;      // Integer foreign key
  characterId: string; // String (UUID)
  actionType: 'attack' | 'cast' | 'heal';
  executedAt: Date;
}

export interface ChallengeRequest {
  opponentId: string; // String (UUID)
}

export interface DuelResponse {
  id: number;
  challengerId: string;
  opponentId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
}

export interface ActionResponse {
  message: string;
  damage?: number;
  healing?: number;
}

export interface ErrorResponse {
  message: string;
}

export interface CharacterStats {
  id: string; // String (UUID)
  health: number;
  baseStrength: number;
  baseAgility: number;
  baseIntelligence: number;
  baseFaith: number;
  items: Item[];
}

export interface Item {
  id: number;
  name: string;
  description: string;
  bonusStrength: number;
  bonusAgility: number;
  bonusIntelligence: number;
  bonusFaith: number;
}