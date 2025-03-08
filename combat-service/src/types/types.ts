import { Request } from 'express';


export interface Duel {
    id: number;
    challengerId: number;
    opponentId: number;
    status: 'active' | 'completed' | 'draw';
    startedAt: Date;
    endedAt: Date | null;
    actions?: DuelAction[]; // Optional relation
}


export interface DuelAction {
    id: number;
    duel: Duel;
    duelId: number; // For TypeORM relation
    characterId: number;
    actionType: 'attack' | 'cast' | 'heal';
    executedAt: Date;
}


export interface AuthRequest extends Request {
    user?: {
        id: number;
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
    damage?: number; // For attack and cast
    healing?: number; // For heal
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