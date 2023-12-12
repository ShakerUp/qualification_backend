// routes/auth.js
import express from 'express';

import handleValidationErrors from '../handleValidationErrors.js';
import { registerValidation, loginValidation } from '../validations.js';
import * as UserController from '../controllers/UserController.js';

import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.post('/register', registerValidation, handleValidationErrors, UserController.register);
router.post('/login', loginValidation, handleValidationErrors, UserController.login);
router.get('/check', checkAuth(['user', 'admin', 'teacher']), UserController.checkMe);
router.get('/getAllUsers', checkAuth(['admin']), UserController.getAll);
router.put('/users/:userId/promote', checkAuth(['admin']), UserController.promoteUser);
router.put('/users/:userId/assignForm', checkAuth(['admin']), UserController.assignForm)

export default router;
