import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Character } from '../entity/Character';
import { Class } from '../entity/Class';
import { Item } from '../entity/Item';
import { User } from '../entity/User';
import { UserRole, JwtPayload } from '../types/auth.types';
import { CharacterCreateRequest, CharacterResponse, CharacterListResponse, ItemCreateRequest, ItemResponse, ItemGrantRequest, ItemGiftRequest, CharacterJwtPayload } from '../types/character.types';
import { JWT_CONFIG } from '../config/jwt.config';
import { redisClient } from '../config/cache.config';
import { Logger } from '../utils/logger';

class CharacterService {
    private characterRepository: Repository<Character>;
    private classRepository: Repository<Class>;
    private itemRepository: Repository<Item>;
    private userRepository: Repository<User>;
    private logger = new Logger('CharacterService');

    constructor() {
        this.characterRepository = AppDataSource.getRepository(Character);
        this.classRepository = AppDataSource.getRepository(Class);
        this.itemRepository = AppDataSource.getRepository(Item);
        this.userRepository = AppDataSource.getRepository(User);
    }

    async create(request: CharacterCreateRequest, userPayload: JwtPayload): Promise<string> {
        
        const user = await this.userRepository.save(userPayload);
    
        request.userId = userPayload.userId;

        const charClass = await this.classRepository.save(request);
        if (!charClass) throw new Error('Class not saved');

        const character = this.characterRepository.create({
            name: request.name,
            class: charClass,
            createdBy: user,
            createdAt: new Date(),
            items: [],
            userId: userPayload.userId
        });

        const savedCharacter = await this.characterRepository.save(character);
        this.logger.info(`Character created: ${savedCharacter.name} by user ${userPayload.userId}`);
        return savedCharacter.id;
    }

    async getAll(userPayload: JwtPayload): Promise<CharacterListResponse[]> {
        if (userPayload.role !== UserRole.GAME_MASTER) throw new Error('Unauthorized');
        const characters = await this.characterRepository.find();
        return characters.map(c => ({
            id: c.id,
            name: c.name,
            health: c.health,
            mana: c.mana
        }));
    }

    async getCharacter(id: string, userPayload: JwtPayload): Promise<CharacterResponse> {
        const cacheKey = `character:${userPayload.userId}`;
        const cached = await redisClient.get(cacheKey); // Use Redis get
        if (cached) {
            this.logger.info(`Cache hit for character: ${userPayload.userId}`);
            return JSON.parse(cached) as CharacterResponse;
        }

        const character = await this.characterRepository.findOne({
            where: { userId: userPayload.userId },
            relations: ['class', 'items', 'createdBy']
        });

        if (!character) throw new Error('Character not found');
        if (character.createdBy.id !== userPayload.userId && userPayload.role !== UserRole.GAME_MASTER) {
            throw new Error('Unauthorized');
        }

        const response = this.mapToResponse(character);
        await redisClient.setEx(cacheKey, 300, JSON.stringify(response)); // Use Redis setEx (5 minutes TTL)
        this.logger.info(`Cache miss - stored character: ${id}`);
        return response;
    }

    async createItem(request: ItemCreateRequest, userPayload: JwtPayload): Promise<string> {
        if (userPayload.role !== UserRole.GAME_MASTER) throw new Error('Unauthorized');
        const item = this.itemRepository.create({
            ...request,
            name: this.generateItemName(request)
        });
        item.userId = userPayload.userId;
        const savedItem = await this.itemRepository.save(item);
        this.logger.info(`Item created: ${savedItem.name} by user ${userPayload.userId}`);
        return savedItem.id;
    }

    async getItems(userPayload: JwtPayload): Promise<ItemResponse[]> {
        if (userPayload.role !== UserRole.GAME_MASTER) throw new Error('Unauthorized');
        const items = await this.itemRepository.find();
        return items.map(this.mapItemToResponse);
    }

    async getItem(id: string): Promise<ItemResponse> {
        const item = await this.itemRepository.findOneBy({ id });
        if (!item) throw new Error('Item not found');
        return this.mapItemToResponse(item);
    }

    async grantItem(request: ItemGrantRequest, userPayload: JwtPayload): Promise<void> {
        if (userPayload.role !== UserRole.GAME_MASTER) throw new Error('Unauthorized');
        const character = await this.characterRepository.findOne({ where: { id: request.characterId }, relations: ['items'] });
        const item = await this.itemRepository.findOneBy({ id: request.itemId });
        if (!character || !item) throw new Error('Character or item not found');

        character.items.push(item);
        await this.characterRepository.save(character);
        await redisClient.del(`character:${character.id}`); // Use Redis del
        this.logger.info(`Item ${item.name} granted to character ${character.name}`);
    }

    async giftItem(request: ItemGiftRequest, userPayload: JwtPayload): Promise<void> {
        const fromCharacter = await this.characterRepository.findOne({ where: { userId: request.fromCharacterId }, relations: ['items', 'createdBy'] });
        const toCharacter = await this.characterRepository.findOne({ where: { userId: request.toCharacterId }, relations: ['items'] });
        const item = await this.itemRepository.findOneBy({ id: request.itemId });
        //TODO:  I don't know why it's not working 
        if (!fromCharacter || !toCharacter || !item) throw new Error('Character or item not found');
        if (fromCharacter.createdBy.userId !== userPayload.userId) throw new Error('Unauthorized');
        if (!fromCharacter.items.some(i => i.id === item.userId)) throw new Error('Item not owned'); //character is owner of item for transfer

        fromCharacter.items = fromCharacter.items.filter(i => i.id !== item.id);
        toCharacter.items.push(item);
        await this.characterRepository.save([fromCharacter, toCharacter]);
        await Promise.all([
            redisClient.del(`character:${fromCharacter.id}`),
            redisClient.del(`character:${toCharacter.id}`)
        ]);
        this.logger.info(`Item ${item.name} gifted from ${fromCharacter.name} to ${toCharacter.name}`);
    }


    verifyCharacterToken(token: string): CharacterJwtPayload {
        try {
            return jwt.verify(token, JWT_CONFIG.characterSecret) as CharacterJwtPayload;
        } catch (error) {
            this.logger.error(`Invalid character token: ${error}`);
            throw new Error('Invalid character token');
        }
    }

    private mapToResponse(character: Character): CharacterResponse {
        const itemBonuses = character.items.reduce((acc, item) => ({
            totalStrength: acc.totalStrength + item.bonusStrength,
            totalAgility: acc.totalAgility + item.bonusAgility,
            totalIntelligence: acc.totalIntelligence + item.bonusIntelligence,
            totalFaith: acc.totalFaith + item.bonusFaith
        }), { totalStrength: 0, totalAgility: 0, totalIntelligence: 0, totalFaith: 0 });

        return {
            id: character.id,
            name: character.name,
            health: character.health,
            mana: character.mana,
            baseStrength:character.baseStrength,
            baseAgility:character.baseAgility,
            totalStrength: character.baseStrength + itemBonuses.totalStrength,
            totalAgility: character.baseAgility + itemBonuses.totalAgility,
            totalIntelligence: character.baseIntelligence + itemBonuses.totalIntelligence,
            totalFaith: character.baseFaith + itemBonuses.totalFaith,
            class: { id: character.class.id, name: "class id" },
            items: character.items.map(this.mapItemToResponse),
            createdBy: character.createdBy.id
        };
    }

    private mapItemToResponse(item: Item): ItemResponse {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            bonusStrength: item.bonusStrength,
            bonusAgility: item.bonusAgility,
            bonusIntelligence: item.bonusIntelligence,
            bonusFaith: item.bonusFaith,
            userId: item.userId
        };
    }

    private generateItemName(request: ItemCreateRequest): string {
        const bonuses = [
            { stat: 'Strength', value: request.bonusStrength || 0 },
            { stat: 'Agility', value: request.bonusAgility || 0 },
            { stat: 'Intelligence', value: request.bonusIntelligence || 0 },
            { stat: 'Faith', value: request.bonusFaith || 0 }
        ];
        const maxBonus = bonuses.reduce((max, curr) => curr.value > max.value ? curr : max, bonuses[0]);
        return `${maxBonus.stat} ${request.description}`;
    }

    async updateHealth(characterId: string, health: number, userPayload: JwtPayload): Promise<void> {
        if (typeof health !== 'number') {
            throw new Error('Health must be a number');
        }

        const character = await this.characterRepository.findOne({
            where: { userId: characterId },
            relations: ['createdBy']
        });

        if (!character) {
            throw new Error('Character not found');
        }

        // Only Game Masters or the character's creator can update health
        if (character.createdBy.id !== userPayload.userId && userPayload.role !== UserRole.GAME_MASTER) {
            throw new Error('Unauthorized');
        }

        character.health = health;
        await this.characterRepository.save(character);
        await redisClient.del(`character:${characterId}`); // Invalidate cache
        this.logger.info(`Health updated for character ${characterId} to ${health} by user ${userPayload.userId}`);
    }
}

export const characterService = new CharacterService();