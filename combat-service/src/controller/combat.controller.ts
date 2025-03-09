import { Response } from 'express';
import { AppDataSource } from '../config/database.config';  
import { Duel } from '../entity/Duel';
import { DuelAction } from '../entity/DuelAction';
import { AuthenticatedRequest, ChallengeRequest, DuelResponse, ActionResponse, ErrorResponse } from '../types/types';
import { CharacterSync } from '../services/character.sync'; 
import logger from '../logger/logger';
import { validate } from 'uuid'; 

export class CombatController {
    async challenge(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {opponentId} = req.body as ChallengeRequest;
            const user = req.user;

            if (!user?.userId) {
                throw new Error('User ID is missing');
            }

            // Validate that userId and opponentId are UUIDs
            if (!validate(user.userId) || !validate(opponentId)) {
                res.status(400).json({message: 'Invalid userId or opponentId: must be a UUID'} as ErrorResponse);
                return;
            }

            const duel = new Duel();
            duel.challengerId = user.userId;  
            duel.opponentId = opponentId;  
            await AppDataSource.manager.save(duel);

            logger.info(`Duel ${duel.id} started between ${duel.challengerId} and ${duel.opponentId} by ${user.username} (${user.role})`);
            res.status(201).json({
                id: duel.id,
                challengerId: duel.challengerId,
                opponentId: duel.opponentId,
                status: duel.status,
                startedAt: duel.startedAt.toISOString(),
                endedAt: duel.endedAt ? duel.endedAt.toISOString() : null,
            } as DuelResponse);

            // 5-minute timeout
            setTimeout(async () => {
                const updatedDuel = await AppDataSource.getRepository(Duel).findOneBy({id: duel.id});
                if (updatedDuel && updatedDuel.status === 'active') {
                    updatedDuel.status = 'draw';
                    updatedDuel.endedAt = new Date();
                    await AppDataSource.manager.save(updatedDuel);
                    logger.info(`Duel ${duel.id} ended in a draw after 5 minutes`);
                }
            }, 5 * 60 * 1000); // 300,000 ms = 5 minutes
        } catch (error) {
            logger.error(`Challenge error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    async attack(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const duel = await this.validateDuel(req);
            if (!duel) return;

            if (!user?.userId) {
                throw new Error('User ID is missing');
            }

 
            const token = req.header('Authorization');
            if (!token || !token.startsWith('Bearer ')) {
                res.status(401).json({message: 'Authorization token missing or invalid'} as ErrorResponse);
                return;
            }

         
            const stats = await CharacterSync.getCharacterStats(user.userId, token);
            const damage = stats.baseStrength + stats.baseAgility;

        
            await this.applyDamage(duel, user.userId === duel.challengerId ? duel.opponentId : duel.challengerId, damage, token);

            const action = new DuelAction();
            action.duel = duel;
            action.duelId = duel.id;
            action.characterId = user.userId;
            action.actionType = 'attack';
            action.executedAt = new Date();
            await AppDataSource.manager.save(action);

            logger.info(`Character ${user.userId} (${user.username}, ${user.role}) attacked in duel ${duel.id}, dealing ${damage} damage`);
            res.json({message: 'Attack executed', damage} as ActionResponse);
        } catch (error) {
            logger.error(`Attack error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    async cast(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const duel = await this.validateDuel(req);
            if (!duel) return;

            if (!user?.userId) {
                throw new Error('User ID is missing');
            }

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: {duel: {id: duel.id}, characterId: user.userId, actionType: 'cast'},
                order: {executedAt: 'DESC'},
            });

            if (lastAction && Date.now() - lastAction.executedAt.getTime() < 2000) {
                res.status(429).json({message: 'Cast available every 2 seconds'} as ErrorResponse);
                return;
            }
 
            const token = req.header('Authorization');
            if (!token || !token.startsWith('Bearer ')) {
                res.status(401).json({message: 'Authorization token missing or invalid'} as ErrorResponse);
                return;
            }


            const stats = await CharacterSync.getCharacterStats(user.userId,token);
            const damage = 2 * stats.baseIntelligence;
            await this.applyDamage(duel, user.userId === duel.challengerId ? duel.opponentId : duel.challengerId, damage,token);

            const action = new DuelAction();
            action.duel = duel;
            action.duelId = duel.id;
            action.characterId = user.userId;
            action.actionType = 'cast';
            action.executedAt = new Date();
            await AppDataSource.manager.save(action);

            logger.info(`Character ${user.userId} (${user.username}, ${user.role}) cast spell in duel ${duel.id}, dealing ${damage} damage`);
            res.json({message: 'Cast executed', damage} as ActionResponse);
        } catch (error) {
            logger.error(`Cast error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    async heal(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const duel = await this.validateDuel(req);
            if (!duel) return;

            if (!user?.userId) {
                throw new Error('User ID is missing');
            }

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: {duel: {id: duel.id}, characterId: user.userId, actionType: 'heal'},
                order: {executedAt: 'DESC'},
            });

            if (lastAction && Date.now() - lastAction.executedAt.getTime() < 2000) {
                res.status(429).json({message: 'Heal available every 2 seconds'} as ErrorResponse);
                return;
            }

            const token = req.header('Authorization');
            if (!token || !token.startsWith('Bearer ')) {
                res.status(401).json({message: 'Authorization token missing or invalid'} as ErrorResponse);
                return;
            }
            const stats = await CharacterSync.getCharacterStats(user.userId, token);

            stats.health = stats.health + stats.baseStrength;

            const patchedStats = await CharacterSync.patchCharacterHealth(user.userId, stats.health, token);
            if (patchedStats === null) {
                throw new Error('Failed to patch health');
            }
            

            const action = new DuelAction();
            action.duel = duel;
            action.duelId = duel.id;
            action.characterId = user.userId;
            action.actionType = 'heal';
            action.executedAt = new Date();
            await AppDataSource.manager.save(action);

            logger.info(`Character ${user.userId} (${user.username}, ${user.role}) healed in duel ${duel.id} for ${stats.health} health`);
            res.json({message: 'Heal executed'} as ActionResponse);
        } catch (error) {
            logger.error(`Heal error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    private async validateDuel(req: AuthenticatedRequest): Promise<Duel | undefined> {
        const user = req.user;
        const duelId = Number(req.params.duel_id);

        if (!user?.userId) {
            throw new Error('User ID is missing');
        }

        const duel = await AppDataSource.getRepository(Duel).findOneBy({id: duelId, status: 'active'});
        if (!duel) {
            req.res!.status(404).json({message: 'Duel not found or ended'} as ErrorResponse);
            return undefined;
        }
        // if (user.userId !== duel.challengerId && user.userId !== duel.opponentId) {
        //     req.res!.status(403).json({message: 'Not a duel participant'} as ErrorResponse);
        //     return undefined;
        // }
        return duel;
    }

    private async applyDamage(duel: Duel, targetId: string, damage: number, token: string): Promise<void> {
    //    TODO: Implement this method
    }
}


