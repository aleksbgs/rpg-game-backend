import { Response } from 'express';
import { AppDataSource } from '../config/database.config'; // Adjusted path
import { Duel } from '../entity/Duel';
import { DuelAction } from '../entity/DuelAction';
import { AuthenticatedRequest, ChallengeRequest, DuelResponse, ActionResponse, ErrorResponse } from '../types/types';
import { CharacterSync } from '../services/character.sync'; // Adjusted path

import logger from '../logger/logger'; // Adjusted path
import axios from 'axios';

export class CombatController {
    async challenge(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {opponentId} = req.body as ChallengeRequest;
            const userId = req.user?.userId;

            if (!userId) {
                throw new Error('User ID is missing');
            }

            const duel = new Duel();
            duel.challengerId = userId;
            duel.opponentId = opponentId;
            await AppDataSource.manager.save(duel);

            logger.info(`Duel ${duel.id} started between ${duel.challengerId} and ${duel.opponentId}`);
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
                const updatedDuel = await AppDataSource.getRepository(Duel).findOneBy({ id: duel.id });
                if (updatedDuel && updatedDuel.status === 'active') {
                    updatedDuel.status = 'draw';
                    updatedDuel.endedAt = new Date();
                    await AppDataSource.manager.save(updatedDuel);
                    logger.info(`Duel ${duel.id} ended in a draw after 5 minutes`);
                }
            }, 5 * 60 * 1000);

        } catch (error) {
            logger.error(`Challenge error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    async attack(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const duel = await this.validateDuel(req);
            if (!duel) return;

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: {duel: {id: duel.id}, characterId: userId, actionType: 'attack'},
                order: {executedAt: 'DESC'},
            });

            if (lastAction && Date.now() - lastAction.executedAt.getTime() < 1000) {
                res.status(429).json({message: 'Attack available every 1 second'} as ErrorResponse);
                return;
            }

            if (!userId) {
                throw new Error('User ID is missing');
            }

            const stats = await CharacterSync.getCharacterStats(userId);
            const damage = stats.baseStrength + stats.baseAgility;
            await this.applyDamage(duel, userId === duel.challengerId ? duel.opponentId : duel.challengerId, damage);

            const action = new DuelAction();
            action.duel = duel;
            action.characterId = userId;
            action.actionType = 'attack';
            await AppDataSource.manager.save(action);

            logger.info(`Character ${userId} attacked in duel ${duel.id}, dealing ${damage} damage`);
            res.json({message: 'Attack executed', damage} as ActionResponse);
        } catch (error) {
            logger.error(`Attack error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    async cast(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const duel = await this.validateDuel(req);
            if (!duel) return;

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: {duel: {id: duel.id}, characterId: userId, actionType: 'cast'},
                order: {executedAt: 'DESC'},
            });

            if (lastAction && Date.now() - lastAction.executedAt.getTime() < 2000) {
                res.status(429).json({message: 'Cast available every 2 seconds'} as ErrorResponse);
                return;
            }

            if (!userId) {
                throw new Error('User ID is missing');
            }

            const stats = await CharacterSync.getCharacterStats(userId);
            const damage = 2 * stats.baseIntelligence;
            await this.applyDamage(duel, userId === duel.challengerId ? duel.opponentId : duel.challengerId, damage);

            const action = new DuelAction();
            action.duel = duel;
            action.characterId = userId;
            action.actionType = 'cast';
            await AppDataSource.manager.save(action);

            logger.info(`Character ${userId} cast spell in duel ${duel.id}, dealing ${damage} damage`);
            res.json({message: 'Cast executed', damage} as ActionResponse);
        } catch (error) {
            logger.error(`Cast error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    async heal(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const duel = await this.validateDuel(req);
            if (!duel) return;

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: {duel: {id: duel.id}, characterId: userId, actionType: 'heal'},
                order: {executedAt: 'DESC'},
            });

            if (lastAction && Date.now() - lastAction.executedAt.getTime() < 2000) {
                res.status(429).json({message: 'Heal available every 2 seconds'} as ErrorResponse);
                return;
            }

            if (!userId) {
                throw new Error('User ID is missing');
            }

            const stats = await CharacterSync.getCharacterStats(userId);
            const healing = stats.baseFaith;
            const characterStats = await CharacterSync.getCharacterStats(userId);
            characterStats.health = Math.min(characterStats.health + healing, 100);

            await axios.patch(`http://character-service:3002/api/character/${userId}`,
                {health: characterStats.health},
                {headers: {Authorization: `Bearer ${process.env.JWT_SECRET}`}} // Using JWT_SECRET
            );

            const action = new DuelAction();
            action.duel = duel;
            action.characterId = userId;
            action.actionType = 'heal';
            await AppDataSource.manager.save(action);

            logger.info(`Character ${userId} healed in duel ${duel.id} for ${healing} health`);
            res.json({message: 'Heal executed', healing} as ActionResponse);
        } catch (error) {
            logger.error(`Heal error: ${error}`);
            res.status(500).json({message: 'Internal server error'} as ErrorResponse);
        }
    }

    private async validateDuel(req: AuthenticatedRequest): Promise<Duel | undefined> {
        const userId = req.user?.userId;
        const duelId = Number(req.params.duel_id);

        const duel = await AppDataSource.getRepository(Duel).findOneBy({id: duelId, status: 'active'});
        if (!duel) {
            req.res!.status(404).json({message: 'Duel not found or ended'} as ErrorResponse);
            return undefined;
        }
        if (userId !== duel.challengerId && userId !== duel.opponentId) {
            req.res!.status(403).json({message: 'Not a duel participant'} as ErrorResponse);
            return undefined;
        }
        return duel;
    }

    private async applyDamage(duel: Duel, targetId: number, damage: number): Promise<void> {
        const targetStats = await CharacterSync.getCharacterStats(targetId);
        targetStats.health = Math.max(targetStats.health - damage, 0);

        await axios.patch(`http://character-service:3002/api/character/${targetId}`,
            {health: targetStats.health},
            {headers: {Authorization: `Bearer ${process.env.JWT_SECRET}`}} // Using JWT_SECRET
        );

        if (targetStats.health <= 0) {
            duel.status = 'completed';
            duel.endedAt = new Date();
            await AppDataSource.manager.save(duel);
            const winnerId = targetId === duel.challengerId ? duel.opponentId : duel.challengerId;
            await CharacterSync.transferItem(winnerId, targetId);
            logger.info(`Duel ${duel.id} ended: ${winnerId} won against ${targetId}`);
        }
    }
}