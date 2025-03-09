import { UserRole } from './auth.types';

export interface CharacterCreateRequest {
    name: string;
    classId: string;
    userId: string;
}

export interface CharacterResponse {
    id: string;
    name: string;
    health: number;
    mana: number;
    totalStrength: number;
    totalAgility: number;
    totalIntelligence: number;
    totalFaith: number;
    class: { id: string; name: string };
    items: ItemResponse[];
    createdBy: string;
    baseStrength:number,
    baseAgility:number,
}

export interface CharacterListResponse {
    id: string;
    name: string;
    health: number;
    mana: number;
}
export interface ItemCreateRequest {
    description: string;
    bonusStrength?: number;
    bonusAgility?: number;
    bonusIntelligence?: number;
    bonusFaith?: number;
    userId?: string;
}

export interface ItemResponse {
    id: string;
    name: string;
    description: string;
    bonusStrength: number;
    bonusAgility: number;
    bonusIntelligence: number;
    bonusFaith: number;
    userId?: string;
}

export interface ItemGrantRequest {
    characterId: string;
    itemId: string;
}

export interface ItemGiftRequest {
    fromCharacterId: string;
    toCharacterId: string;
    itemId: string;
}
export interface CharacterJwtPayload {
    characterId: string;
    ownerId: string;
    username: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
