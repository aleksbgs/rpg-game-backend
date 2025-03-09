import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { User, UserRole } from '../entities/User';
import { JwtPayload, LoginRequest } from '../types/auth.types';
import { JWT_CONFIG } from '../config/jwt.config';

class AccountService {
    private userRepository: Repository<User> = AppDataSource.getRepository(User);

    async register(username: string, password: string, role: UserRole = UserRole.USER): Promise<string> {
        if (await this.userRepository.findOneBy({ username })) {
            throw new Error('Username already exists');
        }

        const user = this.userRepository.create({ username, password, role });
        await user.hashPassword();
        await this.userRepository.save(user);
        return this.generateToken(user);
    }

    async login({ username, password }: LoginRequest): Promise<string> {
        const user = await this.userRepository.findOneBy({ username });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Invalid credentials');
        }
        return this.generateToken(user);
    }

    private generateToken(user: User): string {
        const payload: JwtPayload = { userId: user.id, role: user.role, username :user.username };
        return jwt.sign(payload, "1234", { expiresIn: '100y' });
    }

}

export const accountService = new AccountService();