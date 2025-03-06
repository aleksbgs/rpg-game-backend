import { Router } from 'express';
import { CharacterController } from '../controllers/character.controller';
import { authenticateToken } from '../middleware/auth.middlerare';

const router = Router();
const controller = new CharacterController();

router.post('/character', authenticateToken, controller.create.bind(controller));
router.get('/character', authenticateToken, controller.getAll.bind(controller));
router.get('/character/:id', authenticateToken, controller.get.bind(controller));
router.post('/items', authenticateToken, controller.createItem.bind(controller));
router.get('/items', authenticateToken, controller.getItems.bind(controller));
router.get('/items/:id', authenticateToken, controller.getItem.bind(controller));
router.post('/items/grant', authenticateToken, controller.grantItem.bind(controller));
router.post('/items/gift', authenticateToken, controller.giftItem.bind(controller));

export default router;