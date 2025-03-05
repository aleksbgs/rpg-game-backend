import { Request, Response } from "express";
import AuthService from "../services/AuthService";

class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, password, role } = req.body;
            const user = await AuthService.register(username, password, role);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: "Registration failed", error });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;
            const result = await AuthService.login(username, password);
            if (!result) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Login failed", error });
        }
    }
}

export default AuthController;
