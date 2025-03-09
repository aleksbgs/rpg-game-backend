import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/types';


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
        const payload = jwt.verify(token, "1234") as JwtPayload;
        console.log("token",payload);
        (req as AuthenticatedRequest).user = payload;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
        return;
    }
};