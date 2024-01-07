import express from 'express';

import handleValidationErrors from '../handleValidationErrors.js';
import { registerValidation, loginValidation } from '../validations.js';
import * as PostController from '../controllers/PostController.js';

import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.post('/create', checkAuth(['teacher', 'admin']), PostController.create);
router.get('/teacher-posts', checkAuth(['teacher', 'admin']), PostController.getTeacherPosts);

export default router;
