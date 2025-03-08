// combat-service/src/types.ts
import { Request } from 'express';

export interface Duel {
    id: number;
    challengerId: number;
    opponentId: number;
    status: 'active' | 'completed' | 'draw';
    startedAt: Date;
    endedAt: Date | null;
    actions?: DuelAction[];
}

export interface DuelAction {
    id: number;
    duel: Duel;
    duelId: number;
    characterId: number;
    actionType: 'attack' | 'cast' | 'heal';
    executedAt: Date;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        role: string;
    };
}

export interface ChallengeRequest {
    opponentId: number;
}

export interface DuelResponse {
    id: number;
    challengerId: number;
    opponentId: number;
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
    id: number;
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