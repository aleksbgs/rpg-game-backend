import { Request, Response, NextFunction } from 'express';
import { characterService } from '../services/character.service';
import { CharacterJwtPayload } from '../types/character.types';

export interface CharacterAuthenticatedRequest extends Request {
    character?: CharacterJwtPayload;
}

export const authenticateCharacterToken = (
    req: CharacterAuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'No character token provided' });
    }

    try {
        const payload = characterService.verifyCharacterToken(token);
        req.character = payload;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid character token' });
    }
};