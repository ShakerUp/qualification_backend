import express from 'express';

const router = express.Router();

import * as TestController from '../controllers/TestController.js';
import { testValidation } from '../validations.js';
import handleValidationErrors from '../handleValidationErrors.js';

import checkAuth from '../middleware/checkAuth.js';

router.post(
  '/create-test',
  checkAuth(['teacher', 'admin']),
  testValidation,
  handleValidationErrors,
  TestController.create,
);
router.get('/alltests', checkAuth(['user', 'admin', 'teacher']), TestController.getAll);
router.get('/teachers-test', checkAuth(['admin', 'teacher']), TestController.teacherTests);
router.get('/teachers-results', checkAuth(['admin', 'teacher']), TestController.teacherResults);
router.get(
  '/:testId/questions',
  checkAuth(['user', 'admin', 'teacher']),
  TestController.getTestQuestions,
);
router.post('/:testId/submit', checkAuth(['user', 'admin', 'teacher']), TestController.submit);
router.get('/user-results', checkAuth(['user', 'admin', 'teacher']), TestController.userResult);
router.get(
  '/getCorrectAnswers/:testResultId',
  checkAuth(['user', 'admin', 'teacher']),
  TestController.getCorrectAnswers,
);
router.delete('/delete/:testId', checkAuth(['admin', 'teacher']), TestController.deleteTest);
router.put('/update/:testId', checkAuth(['admin', 'teacher']), TestController.updateTest);
router.get('/:testId/details', checkAuth(['admin', 'teacher']), TestController.getTestDetails);

export default router;
