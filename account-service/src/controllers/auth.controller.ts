import { Request, Response } from 'express';
import { accountService } from '../services/account.service';
import { LoginRequest, UserRole } from '../types/auth.types';

export class AuthController {


    async register(req: Request, res: Response) {
        try {
            const { username, password, role } = req.body;
            const token = await accountService.register(username, password, role || UserRole.USER);
            res.status(201).json({ token });
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    async login(req: Request, res: Response) {
        try {
            const loginRequest: LoginRequest = req.body;
            const token = await accountService.login(loginRequest);
            res.json({ token });
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }
}