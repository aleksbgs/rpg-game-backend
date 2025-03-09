import { Router } from 'express';
import { CharacterController } from '../controllers/character.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const characterController = new CharacterController();

router.post('/character', authenticateToken, characterController.create.bind(characterController));
router.get('/character', authenticateToken, characterController.getAll.bind(characterController));
router.get('/character/:id', authenticateToken, characterController.get.bind(characterController));
router.patch('/character/:id', authenticateToken, characterController.updateHealth.bind(characterController)); 
router.get('/mycharacter/:id', authenticateToken, characterController.getCurrentCharacter.bind(characterController));

router.post('/items', authenticateToken, characterController.createItem.bind(characterController));
router.get('/items', authenticateToken, characterController.getItems.bind(characterController));
router.get('/items/:id', authenticateToken, characterController.getItem.bind(characterController));
router.post('/items/grant', authenticateToken, characterController.grantItem.bind(characterController));
router.post('/items/gift', authenticateToken, characterController.giftItem.bind(characterController));


export default router;