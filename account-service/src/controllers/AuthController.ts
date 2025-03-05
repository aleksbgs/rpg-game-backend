import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import AuthService from "../services/AuthService"; // Assuming this exists

// Validation schemas matching User entity
const registerSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(255, "Username must not exceed 255 characters"), // Default varchar length
    password: z.string()
        .min(8, "Password must be at least 8 characters"),
    role: z.enum(["User", "GameMaster"]).default("User"),
});

const loginSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(8),
});

// Error response interface
interface ErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
}

class AuthController {
    // Validation middleware
    private static validate(schema: z.ZodSchema) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    res.status(StatusCodes.BAD_REQUEST).json({
                        success: false,
                        message: "Validation failed",
                        errors: error.errors,
                    } as ErrorResponse);
                }
            }
        };
    }

    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, password, role } = registerSchema.parse(req.body);

            const user = await AuthService.register(username, password, role);

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
                message: "User registered successfully",
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Validation errors are handled by middleware, but keeping this as fallback
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors,
                } as ErrorResponse);
                return;
            }

            const err = error as Error;
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message || "Registration failed",
            } as ErrorResponse);
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = loginSchema.parse(req.body);

            const result = await AuthService.login(username, password);

            if (!result) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid credentials",
                } as ErrorResponse);
                return;
            }

            res.status(StatusCodes.OK).json({
                success: true,
                data: {
                    user: {
                        id: result.user.id,
                        username: result.user.username,
                        role: result.user.role,
                    },
                    // Assuming AuthService might return a token in a real implementation
                    token: result.accessToken || "placeholder-token",
                },
                message: "Login successful",
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors,
                } as ErrorResponse);
                return;
            }

            const err = error as Error;
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message || "Login failed",
            } as ErrorResponse);
        }
    }

    // Route handlers with middleware
    static registerHandler = [
        AuthController.validate(registerSchema),
        AuthController.register,
    ];

    static loginHandler = [
        AuthController.validate(loginSchema),
        AuthController.login,
    ];
}

export default AuthController;