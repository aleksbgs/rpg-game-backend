// combat-service/src/characterSync.ts
import axios from 'axios';
import logger from '../logger/logger';
import { CharacterStats } from '../types/types';

export class CharacterSync {
    static async getCharacterStats(characterId: number): Promise<CharacterStats> {
        try {
            const response = await axios.get<CharacterStats>(
                `http://character-service:3001/api/character/${characterId}`,
                { headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` } }
            );
            return response.data;
        } catch (error) {
            logger.error(`Failed to fetch character ${characterId}: ${error}`);
            throw error;
        }
    }

    static async transferItem(winnerId: number, loserId: number): Promise<void> {
        try {
            const loserStats = await CharacterSync.getCharacterStats(loserId);
            const randomItem = loserStats.items[Math.floor(Math.random() * loserStats.items.length)];

            await axios.post('http://character-service:3001/api/items/gift', {
                fromCharacterId: loserId,
                toCharacterId: winnerId,
                itemId: randomItem.id
            }, {
                headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` }
            });

            logger.info(`Transferred item ${randomItem.id} from ${loserId} to ${winnerId}`);
        } catch (error) {
            logger.error(`Item transfer failed: ${error}`);
            throw error;
        }
    }
}