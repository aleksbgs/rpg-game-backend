import { Router } from 'express';
import { AuthController } from '../controllers/authController'; // Adjust path case as needed

const router = Router();

// Instantiate the AuthController
const authController = new AuthController();

// Define authentication routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;