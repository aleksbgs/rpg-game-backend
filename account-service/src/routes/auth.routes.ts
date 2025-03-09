import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller'; // Adjust path case as needed

const router = Router();


const authController = new AuthController();


router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;