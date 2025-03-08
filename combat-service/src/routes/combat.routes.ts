import { Router } from 'express';
import { CombatController } from '../controller/combat.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/challenge', authenticateToken, CombatController.challenge);
router.post('/:duel_id/attack', authenticateToken, CombatController.attack);
router.post('/:duel_id/cast', authenticateToken, CombatController.cast);
router.post('/:duel_id/heal', authenticateToken, CombatController.heal);

export default router;