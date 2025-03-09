import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth.controller'; // Adjusted path
import { accountService } from '../../services/account.service'; // Adjusted path
import { UserRole } from '../../types/auth.types'; // Adjusted path


jest.mock('../../services/account.service', () => ({
    accountService: {
        register: jest.fn(),
        login: jest.fn(),
    }
}));

describe('AuthController', () => {
    let authController: AuthController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        authController = new AuthController();
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should successfully register a new user with provided role', async () => {
            const token = 'mock-token';
            (accountService.register as jest.Mock).mockResolvedValue(token);
            mockRequest.body = {
                username: 'testuser',
                password: 'testpass',
                role: UserRole.USER
            };

            await authController.register(mockRequest as Request, mockResponse as Response);

            expect(accountService.register).toHaveBeenCalledWith('testuser', 'testpass', UserRole.USER);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ token });
        });

        it('should use default role if none provided', async () => {
            const token = 'mock-token';
            (accountService.register as jest.Mock).mockResolvedValue(token);
            mockRequest.body = {
                username: 'testuser',
                password: 'testpass'
            };

            await authController.register(mockRequest as Request, mockResponse as Response);

            expect(accountService.register).toHaveBeenCalledWith('testuser', 'testpass', UserRole.USER);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ token });
        });

        it('should handle username already exists error', async () => {
            (accountService.register as jest.Mock).mockRejectedValue(new Error('Username already exists'));
            mockRequest.body = {
                username: 'testuser',
                password: 'testpass'
            };

            await authController.register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already exists' });
        });

        it('should handle unexpected errors', async () => {
            (accountService.register as jest.Mock).mockRejectedValue('unknown error');
            mockRequest.body = {
                username: 'testuser',
                password: 'testpass'
            };

            await authController.register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'An unknown error occurred' });
        });

        it('should handle empty request body', async () => {
            const token = 'mock-token';
            (accountService.register as jest.Mock).mockResolvedValue(token);
            mockRequest.body = {};

            await authController.register(mockRequest as Request, mockResponse as Response);

            expect(accountService.register).toHaveBeenCalledWith(undefined, undefined, UserRole.USER);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ token });
        });
    });

    describe('login', () => {
        it('should successfully login a user', async () => {
            const token = 'mock-token';
            (accountService.login as jest.Mock).mockResolvedValue(token);
            mockRequest.body = {
                username: 'testuser',
                password: 'testpass'
            };

            await authController.login(mockRequest as Request, mockResponse as Response);

            expect(accountService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' });
            expect(mockResponse.status).not.toHaveBeenCalled(); // res.json() doesn't set status
            expect(mockResponse.json).toHaveBeenCalledWith({ token });
        });

        it('should handle invalid credentials', async () => {
            (accountService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
            mockRequest.body = {
                username: 'testuser',
                password: 'wrongpass'
            };

            await authController.login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        it('should handle unexpected errors', async () => {
            (accountService.login as jest.Mock).mockRejectedValue('unknown error');
            mockRequest.body = {
                username: 'testuser',
                password: 'testpass'
            };

            await authController.login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'An unknown error occurred' });
        });

        it('should handle empty request body', async () => {
            const token = 'mock-token';
            (accountService.login as jest.Mock).mockResolvedValue(token);
            mockRequest.body = {};

            await authController.login(mockRequest as Request, mockResponse as Response);

            expect(accountService.login).toHaveBeenCalledWith({});
            expect(mockResponse.json).toHaveBeenCalledWith({ token });
        });
    });
});