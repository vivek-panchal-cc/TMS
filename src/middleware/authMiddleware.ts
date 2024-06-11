import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entity/User';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send('Access Denied');
    }
    const isBearerToken = authHeader.startsWith('Bearer ');
    const token = isBearerToken ? authHeader.slice(7) : authHeader;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, tokenVersion: number };
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: verified.id, tokenVersion: verified.tokenVersion });
        if (!user) {
            return res.status(401).send('Access Denied');
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
