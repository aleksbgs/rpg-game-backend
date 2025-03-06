// account-service/src/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access Denied' });
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid Token' });
    }
}