import axios from 'axios';
import logger from '../logger/logger';

export class CharacterSync {
    static async getCharacterStats(characterId: number): Promise<any> {
        try {
            const response = await axios.get(`http://character-service:3001/api/character/${characterId}`, {
                headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` }
            });
            return response.data;
        } catch (error) {
            logger.error(`Failed to fetch character ${characterId}: ${error}`);
            throw error;
        }
    }

    static async transferItem(winnerId: number, loserId: number): Promise<void> {
        try {
            const loserItems = await axios.get(`http://character-service:3001/api/character/${loserId}`, {
                headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` }
            });
            const randomItem = loserItems.data.items[Math.floor(Math.random() * loserItems.data.items.length)];

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