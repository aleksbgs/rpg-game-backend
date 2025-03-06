// account-service/src/controller/AuthController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

export class AuthController {

    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, password, role = 'User' } = req.body;

            // Validate input
            if (!username || !password) {
                res.status(400).json({ message: 'Username and password are required' });
                return;
            }

            const existingUser = await AppDataSource.getRepository(User).findOneBy({ username });
            if (existingUser) {
                res.status(400).json({ message: 'Username already taken' });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User();
            user.username = username;
            user.password = hashedPassword;
            user.role = role;

            await AppDataSource.manager.save(user);

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({ message: 'Username and password are required' });
                return;
            }

            const user = await AppDataSource.getRepository(User).findOneBy({ username });
            if (!user) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}