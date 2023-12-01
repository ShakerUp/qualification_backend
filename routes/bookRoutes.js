import express from 'express';

const router = express.Router();

import * as BookController from '../controllers/BookController.js';
import { bookValidation } from '../validations.js';
import handleValidationErrors from '../handleValidationErrors.js';

import checkAuth from '../middleware/checkAuth.js';

router.get('/books', BookController.getAll);
router.post(
  '/add-book',
  checkAuth(['teacher', 'admin']),
  bookValidation,
  handleValidationErrors,
  BookController.addBook,
);

export default router;
