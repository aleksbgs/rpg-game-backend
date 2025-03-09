import { Response } from 'express';
import { CharacterController } from '../../controllers/character.controller'; // Adjusted path
import { characterService } from '../../services/character.service'; // Adjusted path
import { AuthenticatedRequest } from '../../middleware/auth'; // Adjusted path
import { UserRole } from '../../types/auth.types'; // Adjusted path


jest.mock('../../services/character.service', () => ({
    characterService: {
        create: jest.fn(),
        getAll: jest.fn(),
        getCharacter: jest.fn(),
        createItem: jest.fn(),
        getItems: jest.fn(),
        getItem: jest.fn(),
        grantItem: jest.fn(),
        giftItem: jest.fn(),
        updateHealth: jest.fn(),
    }
}));

describe('CharacterController', () => {
    let characterController: CharacterController;
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        characterController = new CharacterController();
        mockRequest = {
            user: { userId: 'user-id-1', role: UserRole.USER, username: 'testuser' } // Default user payload
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should successfully create a character', async () => {
            const userId = 'char-id-1';
            (characterService.create as jest.Mock).mockResolvedValue(userId);
            mockRequest.body = { name: 'TestChar', classId: 'class-id-1' };

            await characterController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.create).toHaveBeenCalledWith(
                { name: 'TestChar', classId: 'class-id-1' },
                mockRequest.user
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ userId });
        });

        it('should handle errors', async () => {
            (characterService.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
            mockRequest.body = { name: 'TestChar' };

            await characterController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Creation failed' });
        });
    });

    describe('getAll', () => {
        it('should successfully list all characters for GameMaster', async () => {
            mockRequest.user = { userId: 'gm-id', role: UserRole.GAME_MASTER, username: 'gm' };
            const characters = [{ id: 'char1', name: 'Char1' }];
            (characterService.getAll as jest.Mock).mockResolvedValue(characters);

            await characterController.getAll(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.getAll).toHaveBeenCalledWith(mockRequest.user);
            expect(mockResponse.json).toHaveBeenCalledWith(characters);
        });

        it('should handle unauthorized access', async () => {
            (characterService.getAll as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

            await characterController.getAll(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
    });

    describe('get', () => {
        it('should successfully get character details', async () => {
            const character = { id: 'char1', name: 'Char1' };
            (characterService.getCharacter as jest.Mock).mockResolvedValue(character);
            mockRequest.params = { id: 'char1' };

            await characterController.get(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.getCharacter).toHaveBeenCalledWith('char1', mockRequest.user);
            expect(mockResponse.json).toHaveBeenCalledWith(character);
        });

        it('should handle character not found', async () => {
            (characterService.getCharacter as jest.Mock).mockRejectedValue(new Error('Character not found'));
            mockRequest.params = { id: 'char1' };

            await characterController.get(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Character not found' });
        });
    });

    describe('createItem', () => {
        it('should successfully create an item for GameMaster', async () => {
            mockRequest.user = { userId: 'gm-id', role: UserRole.GAME_MASTER, username: 'gm' };
            const itemId = 'item-id-1';
            (characterService.createItem as jest.Mock).mockResolvedValue(itemId);
            mockRequest.body = { description: 'Sword', bonusStrength: 10 };

            await characterController.createItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.createItem).toHaveBeenCalledWith(
                { description: 'Sword', bonusStrength: 10 },
                mockRequest.user
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ itemId });
        });

        it('should handle unauthorized access', async () => {
            (characterService.createItem as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
            mockRequest.body = { description: 'Sword' };

            await characterController.createItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
    });

    describe('getItems', () => {
        it('should successfully list items for GameMaster', async () => {
            mockRequest.user = { userId: 'gm-id', role: UserRole.GAME_MASTER, username: 'gm' };
            const items = [{ id: 'item1', name: 'Sword' }];
            (characterService.getItems as jest.Mock).mockResolvedValue(items);

            await characterController.getItems(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.getItems).toHaveBeenCalledWith(mockRequest.user);
            expect(mockResponse.json).toHaveBeenCalledWith(items);
        });

        it('should handle unauthorized access', async () => {
            (characterService.getItems as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

            await characterController.getItems(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
    });

    describe('getItem', () => {
        it('should successfully get item details', async () => {
            const item = { id: 'item1', name: 'Sword' };
            (characterService.getItem as jest.Mock).mockResolvedValue(item);
            mockRequest.params = { id: 'item1' };

            await characterController.getItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.getItem).toHaveBeenCalledWith('item1');
            expect(mockResponse.json).toHaveBeenCalledWith(item);
        });

        it('should handle item not found', async () => {
            (characterService.getItem as jest.Mock).mockRejectedValue(new Error('Item not found'));
            mockRequest.params = { id: 'item1' };

            await characterController.getItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Item not found' });
        });
    });

    describe('grantItem', () => {
        it('should successfully grant an item for GameMaster', async () => {
            mockRequest.user = { userId: 'gm-id', role: UserRole.GAME_MASTER, username: 'gm' };
            (characterService.grantItem as jest.Mock).mockResolvedValue(undefined);
            mockRequest.body = { characterId: 'char1', itemId: 'item1' };

            await characterController.grantItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.grantItem).toHaveBeenCalledWith(
                { characterId: 'char1', itemId: 'item1' },
                mockRequest.user
            );
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle unauthorized access', async () => {
            (characterService.grantItem as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
            mockRequest.body = { characterId: 'char1', itemId: 'item1' };

            await characterController.grantItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
    });

    describe('giftItem', () => {
        it('should successfully gift an item', async () => {
            (characterService.giftItem as jest.Mock).mockResolvedValue(undefined);
            mockRequest.body = { fromCharacterId: 'char1', toCharacterId: 'char2', itemId: 'item1' };

            await characterController.giftItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.giftItem).toHaveBeenCalledWith(
                { fromCharacterId: 'char1', toCharacterId: 'char2', itemId: 'item1' },
                mockRequest.user
            );
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle unauthorized access', async () => {
            (characterService.giftItem as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
            mockRequest.body = { fromCharacterId: 'char1', toCharacterId: 'char2', itemId: 'item1' };

            await characterController.giftItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
    });

    describe('getCurrentCharacter', () => {
        it('should successfully get current character', async () => {
            const character = { id: 'char1', name: 'Char1' };
            (characterService.getCharacter as jest.Mock).mockResolvedValue(character);
            mockRequest.user = { userId: 'char1', role: UserRole.USER, username: 'testuser' };

            await characterController.getCurrentCharacter(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.getCharacter).toHaveBeenCalledWith('char1', mockRequest.user);
            expect(mockResponse.json).toHaveBeenCalledWith(character);
        });

        it('should handle character not found', async () => {
            (characterService.getCharacter as jest.Mock).mockRejectedValue(new Error('Character not found'));
            mockRequest.user = { userId: 'char1', role: UserRole.USER, username: 'testuser' };

            await characterController.getCurrentCharacter(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Character not found' });
        });
    });

    describe('updateHealth', () => {
        it('should successfully update character health', async () => {
            (characterService.updateHealth as jest.Mock).mockResolvedValue(undefined);
            mockRequest.params = { id: 'char1' };
            mockRequest.body = { health: 75 };

            await characterController.updateHealth(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(characterService.updateHealth).toHaveBeenCalledWith('char1', 75, mockRequest.user);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle unauthorized access', async () => {
            (characterService.updateHealth as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
            mockRequest.params = { id: 'char1' };
            mockRequest.body = { health: 75 };

            await characterController.updateHealth(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
    });
});