// combat-service/src/controller/combat.controller.ts
import { Response } from 'express';
import { AppDataSource } from '../config/database.config';
import { Duel } from '../entity/Duel';
import { DuelAction } from '../entity/DuelAction';
import { AuthRequest, ChallengeRequest, DuelResponse, ActionResponse, ErrorResponse } from '../types/types';
import { CharacterSync } from '../services/character.sync';
import logger from '../logger/logger';
import axios from "axios";
import {AuthenticatedRequest} from "../middleware/auth";

export class CombatController {


    async challenge(req: AuthenticatedRequest, res: Response) {
        try {
            const request:ChallengeRequest = req.body;
            const userPayload = req.user;

            const duel = new Duel();
            if (!userPayload?.userId) {
                throw new Error("User ID is missing");
            }
            duel.challengerId = userPayload.userId;
            duel.opponentId = request.opponentId;
            await AppDataSource.manager.save(duel);

            logger.info(`Duel ${duel.id} started between ${duel.challengerId} and ${duel.opponentId}`);
            res.status(201).json(duel);

        } catch (error) {
            logger.error(`Challenge error: ${error}`);
            res.status(500).json({ message: 'Internal server error' } as ErrorResponse);
        }
    }

    async attack(req: AuthenticatedRequest, res: Response){

        const request:ChallengeRequest = req.body;
        const userPayload = req.user;

        try {
            const duel = await this.validateDuel(req)
            if (!duel) return;

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: { duel: { id: duel.id }, characterId: userPayload?.userId, actionType: 'attack' },
                order: { executedAt: 'DESC' },
            });

            if (lastAction && (Date.now() - lastAction.executedAt.getTime()) < 1000) {
                res.status(429).json({ message: 'Attack available every 1 second' } as ErrorResponse);
                return;
            }
            if (!userPayload?.userId) {
                throw new Error("User ID is missing");
            }

            const stats = await CharacterSync.getCharacterStats(userPayload?.userId);
            const damage = stats.baseStrength + stats.baseAgility;
            await this.applyDamage(duel, userPayload.userId === duel.challengerId ? duel.opponentId : duel.challengerId, damage);

            const action = new DuelAction();
            action.duel = duel;
            action.characterId = userPayload.userId;
            action.actionType = 'attack';
            await AppDataSource.manager.save(action);

            logger.info(`Character ${userPayload.userId} attacked in duel ${duel.id}, dealing ${damage} damage`);
            res.json({ message: 'Attack executed', damage } as ActionResponse);
        } catch (error) {
            logger.error(`Attack error: ${error}`);
            res.status(500).json({ message: 'Internal server error' } as ErrorResponse);
        }
    }

    async cast(req: AuthenticatedRequest, res: Response) {
        
        
        const request:ChallengeRequest = req.body;
        const userPayload = req.user;
        
        try {
            const duel = await this.validateDuel(req);
            if (!duel) return;

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: { duel: { id: duel.id }, characterId: userPayload?.userId, actionType: 'cast' },
                order: { executedAt: 'DESC' },
            });

            if (lastAction && (Date.now() - lastAction.executedAt.getTime()) < 2000) {
                res.status(429).json({ message: 'Cast available every 2 seconds' } as ErrorResponse);
                return;
            }
            if (!userPayload?.userId) {
                throw new Error("User ID is missing");
            }

            const stats = await CharacterSync.getCharacterStats(userPayload?.userId);
            const damage = 2 * stats.baseIntelligence;
            await this.applyDamage(duel, userPayload.userId === duel.challengerId ? duel.opponentId : duel.challengerId, damage);

            const action = new DuelAction();
            action.duel = duel;
            action.characterId = userPayload.userId;
            action.actionType = 'cast';
            await AppDataSource.manager.save(action);

            logger.info(`Character ${userPayload.userId} cast spell in duel ${duel.id}, dealing ${damage} damage`);
            res.json({ message: 'Cast executed', damage } as ActionResponse);
        } catch (error) {
            logger.error(`Cast error: ${error}`);
            res.status(500).json({ message: 'Internal server error' } as ErrorResponse);
        }
    }

    async heal(req: AuthenticatedRequest, res: Response){
        
        
        const request:ChallengeRequest = req.body;
        const userPayload = req.user;
        
        
        try {
            const duel = await this.validateDuel(req);
            if (!duel) return;

            const lastAction = await AppDataSource.getRepository(DuelAction).findOne({
                where: { duel: { id: duel.id }, characterId: userPayload?.userId, actionType: 'heal' },
                order: { executedAt: 'DESC' },
            });

            if (lastAction && (Date.now() - lastAction.executedAt.getTime()) < 2000) {
                res.status(429).json({ message: 'Heal available every 2 seconds' } as ErrorResponse);
                return;
            }

            if (!userPayload?.userId) {
                throw new Error("User ID is missing");
            }

            const stats = await CharacterSync.getCharacterStats(userPayload?.userId);
            const healing = stats.baseFaith;
            const characterStats = await CharacterSync.getCharacterStats(userPayload?.userId);
            characterStats.health = Math.min(characterStats.health + healing, 100);

            await axios.patch(`http://character-service:3002/api/character/${userPayload.userId}`,
                { health: characterStats.health },
                { headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` } }
            );

            const action = new DuelAction();
            action.duel = duel;
            action.characterId = userPayload.userId;
            action.actionType = 'heal';
            await AppDataSource.manager.save(action);

            logger.info(`Character ${userPayload.userId} healed in duel ${duel.id} for ${healing} health`);
            res.json({ message: 'Heal executed', healing } as ActionResponse);
        } catch (error) {
            logger.error(`Heal error: ${error}`);
            res.status(500).json({ message: 'Internal server error' } as ErrorResponse);
        }
    }

    private async validateDuel(req: AuthenticatedRequest){

        const request:ChallengeRequest = req.body;
        const userPayload = req.user;


        const duel = await AppDataSource.getRepository(Duel).findOneBy({ id: Number(req.params.duel_id), status: 'active' });
        if (!duel) {
            req.res!.status(404).json({ message: 'Duel not found or ended' } as ErrorResponse);
            return null;
        }
        if (userPayload?.userId!== duel.challengerId && userPayload?.userId !== duel.opponentId) {
            req.res!.status(403).json({ message: 'Not a duel participant' } as ErrorResponse);
            return null;
        }
        return duel;
    }

    private async applyDamage(duel: Duel, targetId: number, damage: number) {
        const targetStats = await CharacterSync.getCharacterStats(targetId);
        targetStats.health = Math.max(targetStats.health - damage, 0);

        await axios.patch(`http://character-service:3002/api/character/${targetId}`,
            { health: targetStats.health },
            { headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` } }
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