import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { JWT_CONFIG } from '../config/jwt.config';

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
        console.log("token",payload);
        (req as AuthenticatedRequest).user = payload;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
        return;
    }
};