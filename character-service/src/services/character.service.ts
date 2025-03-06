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
import { redisClient } from '../config/cache.config'; // Updated import
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
        const user = await this.userRepository.findOneBy({ id: userPayload.userId });
        if (!user) throw new Error('User not found');

        const charClass = await this.classRepository.findOneBy({ id: request.classId });
        if (!charClass) throw new Error('Class not found');

        const existingCharacter = await this.characterRepository.findOneBy({ name: request.name });
        if (existingCharacter) throw new Error('Character name already exists');

        const character = this.characterRepository.create({
            name: request.name,
            class: charClass,
            createdBy: user,
            createdAt: new Date(),
            items: []
        });

        const savedCharacter = await this.characterRepository.save(character);
        this.logger.info(`Character created: ${savedCharacter.name} by user ${userPayload.userId}`);
        return this.generateCharacterToken(savedCharacter, userPayload.role);
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
        const cacheKey = `character:${id}`;
        const cached = await redisClient.get(cacheKey); // Use Redis get
        if (cached) {
            this.logger.info(`Cache hit for character: ${id}`);
            return JSON.parse(cached) as CharacterResponse;
        }

        const character = await this.characterRepository.findOne({
            where: { id },
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
        const fromCharacter = await this.characterRepository.findOne({ where: { id: request.fromCharacterId }, relations: ['items', 'createdBy'] });
        const toCharacter = await this.characterRepository.findOne({ where: { id: request.toCharacterId }, relations: ['items'] });
        const item = await this.itemRepository.findOneBy({ id: request.itemId });

        if (!fromCharacter || !toCharacter || !item) throw new Error('Character or item not found');
        if (fromCharacter.createdBy.id !== userPayload.userId) throw new Error('Unauthorized');
        if (!fromCharacter.items.some(i => i.id === item.id)) throw new Error('Item not owned');

        fromCharacter.items = fromCharacter.items.filter(i => i.id !== item.id);
        toCharacter.items.push(item);
        await this.characterRepository.save([fromCharacter, toCharacter]);
        await Promise.all([
            redisClient.del(`character:${fromCharacter.id}`),
            redisClient.del(`character:${toCharacter.id}`)
        ]);
        this.logger.info(`Item ${item.name} gifted from ${fromCharacter.name} to ${toCharacter.name}`);
    }

    private generateCharacterToken(character: Character, role: UserRole): string {
        const payload: CharacterJwtPayload = {
            characterId: character.id,
            ownerId: character.createdBy.id,
            role
        };
        return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
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
            totalStrength: character.baseStrength + itemBonuses.totalStrength,
            totalAgility: character.baseAgility + itemBonuses.totalAgility,
            totalIntelligence: character.baseIntelligence + itemBonuses.totalIntelligence,
            totalFaith: character.baseFaith + itemBonuses.totalFaith,
            class: { id: character.class.id, name: character.class.name },
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
            bonusFaith: item.bonusFaith
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
}

export const characterService = new CharacterService();