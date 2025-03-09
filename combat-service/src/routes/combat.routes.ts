import { Router } from 'express';
import { CombatController } from '../controller/combat.controller';
import { authenticateToken } from '../middleware/auth'; // Adjusted path

const router = Router();
const combatController = new CombatController();

router.post('/challenge', authenticateToken, combatController.challenge.bind(combatController));
router.post('/:duel_id/attack', authenticateToken, combatController.attack.bind(combatController));
router.post('/:duel_id/cast', authenticateToken, combatController.cast.bind(combatController));
router.post('/:duel_id/heal', authenticateToken, combatController.heal.bind(combatController));

export default router;