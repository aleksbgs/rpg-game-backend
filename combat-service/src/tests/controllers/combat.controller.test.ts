import { Response } from 'express';
import { CombatController } from '../../controller/combat.controller';
import { AppDataSource } from '../../config/database.config';
import { Duel } from '../../entity/Duel';
import { AuthenticatedRequest, ChallengeRequest } from '../../types/types';
import { UserRole } from '../../types/types';
import { validate } from 'uuid';

jest.mock('../../config/database.config', () => ({
    AppDataSource: {
        manager: {
            save: jest.fn(),
        },
        getRepository: jest.fn((entity) => {
            if (entity === Duel) {
                return { findOneBy: jest.fn() };
            }
            return {};
        }),
    },
}));
jest.mock('../../services/character.sync', () => ({
    CharacterSync: {
        getCharacterStats: jest.fn(),
        patchCharacterHealth: jest.fn(),
    },
}));
jest.mock('../../logger/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));
jest.mock('uuid', () => ({
    validate: jest.fn(() => true),
}));

describe('CombatController', () => {
    let combatController: CombatController;
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YzA5NzAwNS1mMzAzLTRiNDYtOTI4Zi0wYWE5MjRhZmNkNmMiLCJyb2xlIjoiR2FtZU1hc3RlciIsInVzZXJuYW1lIjoiZ3Jlcm1yciAiLCJpYXQiOjE3NDE1MTE3MzEsImV4cCI6NDg5NzI3MTczMX0.hdCXX-A9dBOa3Ov_-p3C3IIjrZzIKoj49lW0DvHdl1c';

    beforeEach(() => {
        combatController = new CombatController();

        const mockHeader = jest.fn((name: string): string | undefined => {
            if (name === 'Authorization') {
                return `Bearer ${bearerToken}`;
            }
            return undefined;
        }) as jest.Mock<string | undefined, [string]> & ((name: 'set-cookie') => string[] | undefined);

        mockRequest = {
            user: { 
                userId: '5c097005-f303-4b46-928f-0aa924afcd6c', 
                username: 'grermr ', 
                role: UserRole.GAME_MASTER 
            },
            body: {},
            params: {},
            header: mockHeader,
            res: undefined,
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('challenge', () => {
        it('should handle missing user ID', async () => {
            mockRequest.user = undefined;
            mockRequest.body = { opponentId: '550e8400-e29b-41d4-a716-446655440001' } as ChallengeRequest;

            await combatController.challenge(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });

        it('should handle invalid UUIDs', async () => {
            (validate as jest.Mock).mockReturnValue(false);
            mockRequest.body = { opponentId: 'invalid-uuid' } as ChallengeRequest;

            await combatController.challenge(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid userId or opponentId: must be a UUID' });
            expect(AppDataSource.manager.save).not.toHaveBeenCalled();
        });
    });

    describe('attack', () => {
        beforeEach(() => {
            mockRequest.res = mockResponse as Response;
        });

        it('should handle invalid duel', async () => {
            (AppDataSource.getRepository(Duel).findOneBy as jest.Mock).mockResolvedValue(null);
            mockRequest.params = { duel_id: '1' };

            await combatController.attack(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Duel not found or ended' });
        });

        it('should handle missing user ID', async () => {
            mockRequest.user = undefined;
            mockRequest.params = { duel_id: '1' };

            await combatController.attack(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });

    describe('cast', () => {
        beforeEach(() => {
            mockRequest.res = mockResponse as Response;
        });

        it('should handle invalid duel', async () => {
            (AppDataSource.getRepository(Duel).findOneBy as jest.Mock).mockResolvedValue(null);
            mockRequest.params = { duel_id: '1' };

            await combatController.cast(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Duel not found or ended' });
        });
    });

    describe('heal', () => {
        beforeEach(() => {
            mockRequest.res = mockResponse as Response;
        });

        it('should handle invalid duel', async () => {
            (AppDataSource.getRepository(Duel).findOneBy as jest.Mock).mockResolvedValue(null);
            mockRequest.params = { duel_id: '1' };

            await combatController.heal(mockRequest as AuthenticatedRequest, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Duel not found or ended' });
        });
    });
});
