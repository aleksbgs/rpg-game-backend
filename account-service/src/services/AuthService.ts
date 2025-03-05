import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

class AuthService {
    static async register(username: string, password: string, role: "User" | "GameMaster") {
        const hashedPassword = await bcrypt.hash(password, 12);
        const userRepo = AppDataSource.getRepository(User);
        return userRepo.save(userRepo.create({ username, password: hashedPassword, role }));
    }

    static async login(username: string, password: string) {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { username } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const accessToken = jwt.sign({ id: user.id, role: user.role }, "ACCESS_SECRET", { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id }, "REFRESH_SECRET", { expiresIn: "7d" });

        return { accessToken, refreshToken, user };
    }
}

export default AuthService;