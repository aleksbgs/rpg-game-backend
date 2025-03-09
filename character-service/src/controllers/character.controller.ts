import { Response } from 'express';
import { characterService } from '../services/character.service';
import { AuthenticatedRequest } from '../middleware/auth'; // For user token

import {
    CharacterCreateRequest,
    ItemCreateRequest,
    ItemGrantRequest,
    ItemGiftRequest,
} from '../types/character.types';


export class CharacterController {
    // POST /api/character - Create a new character
    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const request: CharacterCreateRequest = req.body;
            const userPayload = req.user!; // JwtPayload from authenticateToken
            const userId = await characterService.create(request, userPayload);
            res.status(201).json({userId: userId});
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // GET /api/character - List all characters (GameMaster only)
    async getAll(req: AuthenticatedRequest, res: Response) {
        try {
            const userPayload = req.user!;
            const characters = await characterService.getAll(userPayload);
            res.json(characters);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // GET /api/character/:id - Get character details
    async get(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.params.id;
            const userPayload = req.user!;
            const character = await characterService.getCharacter(id, userPayload);
            res.json(character);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // POST /api/items - Create a new item (GameMaster only)
    async createItem(req: AuthenticatedRequest, res: Response) {
        try {
            const request: ItemCreateRequest = req.body;
            const userPayload = req.user!;
            const itemId = await characterService.createItem(request, userPayload);
            res.status(201).json({itemId});
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // GET /api/items - List all items (GameMaster only)
    async getItems(req: AuthenticatedRequest, res: Response) {
        try {
            const userPayload = req.user!;
            const items = await characterService.getItems(userPayload);
            res.json(items);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }

        }
    }

    // GET /api/items/:id - Get item details
    async getItem(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.params.id;
            const item = await characterService.getItem(id);
            res.json(item);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // POST /api/items/grant - Grant an item to a character (GameMaster only)
    async grantItem(req: AuthenticatedRequest, res: Response) {
        try {
            const request: ItemGrantRequest = req.body;
            const userPayload = req.user!;
            await characterService.grantItem(request, userPayload);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // POST /api/items/gift - Gift an item from one character to another
    async giftItem(req: AuthenticatedRequest, res: Response) {
        try {
            const request: ItemGiftRequest = req.body;
            const userPayload = req.user!;
            await characterService.giftItem(request, userPayload);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }

    // Bonus: GET /api/character/me - Get current character details (using character token)
    async getCurrentCharacter(req: AuthenticatedRequest, res: Response) {
        try {
            const characterPayload = req.user!; // CharacterJwtPayload from authenticateCharacterToken
            
            
            const character = await characterService.getCharacter(characterPayload.userId, {
             ...characterPayload
            });
            res.json(character);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
    }


    async updateHealth(req: AuthenticatedRequest, res: Response) {
        try {
           
            const id = req.params.id;
            const health = req.body.health;
            const userPayload = req.user!;
            
            await characterService.updateHealth(id, health, userPayload);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(401).json({ error: "An unknown error occurred" });
            }
        }
       
    }
}