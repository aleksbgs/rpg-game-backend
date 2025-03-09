import axios from 'axios';
import logger from '../logger/logger';
import { CharacterStats } from '../types/types';
import { response } from 'express';

const host = process.env.NODE_ENV === 'production' ? "character-service-1" : 'localhost';
export class CharacterSync {
    
    
    static async getCharacterStats(characterId: string, token: string): Promise<CharacterStats> {
        
       try {
        const response = await axios.get(
            `http://${host}:3002/api/mycharacter/${characterId}`,
            {
                headers: { 
                    'Authorization': `Bearer${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch character ${characterId}: ${error}`);
        throw error;
    }
      
}

    static async transferItem(winnerId: string, loserId: string, token: string): Promise<void> {
        try {
            const loserStats = await CharacterSync.getCharacterStats(loserId, token);
            const randomItem = loserStats.items[Math.floor(Math.random() * loserStats.items.length)];

            await axios.post(`http://${host}:3002/api/items/gift`, {
                fromCharacterId: loserId,
                toCharacterId: winnerId,
                itemId: randomItem.id
            }, {
                headers: { Authorization: token } 
            });

            logger.info(`Transferred item ${randomItem.id} from ${loserId} to ${winnerId}`);
        } catch (error) {
            logger.error(`Item transfer failed: ${error}`);
            throw error;
        }
    }
        
    static async patchCharacterHealth(characterId: string, health: number, token: string): Promise<void> {
     
        try {
            const response = await axios.patch(
                `http://${host}:3002/api/character/${characterId}`,
                { health },
                {
                    headers: { 
                        'Authorization': `Bearer${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            return response.data;

        } catch (error) {
            logger.error(`Failed to patch health for character ${characterId}: ${error}`);
            throw error;
        }
    }
}