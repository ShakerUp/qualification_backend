import { body } from 'express-validator';

export const registerValidation = [
  body('username', 'Имя пользователя должно содержать больше 3 символов')
    .isLength({ min: 3 })
    .isString(),
  body('password', 'Пароль должен содержать не менее 6 символов').isString().isLength({ min: 6 }),
  body('name', 'Введите имя').isLength({ min: 3 }).isString(),
  body('surname', 'Введите фамилию').isLength({ min: 3 }).isString(),
];

export const loginValidation = [
  body('username', 'Имя пользователя должно содержать больше 3 символов')
    .isLength({ min: 3 })
    .isString(),
  body('password', 'Пароль должен содержать не менее 6 символов').isString().isLength({ min: 6 }),
];

export const bookValidation = [
  body('title', 'Введите название раздела').isLength({ min: 3 }).isString(),
  body('category', 'Введите номер категории').isInt(),
  body('description', 'Введите текст раздела').isLength({ min: 10 }).isString(),
  body('imageUrl', 'Введите ссылку на картинку').isURL().optional(),
];

export const questionValidation = [
  body('questionType', 'Некоректный тип вопроса').isString(),
  body('questionText', 'Некоректный вопрос').isLength({ min: 10 }).isString(),
  body('options', 'Некоректные варианты ответов').isArray(),
  body('correctAnswer', 'Некоректный формат ответов').isString(),
];

export const testValidation = [
  body('testName', 'Некоретное имя теста').isLength({ min: 5 }).isString(),
  body('category', 'Введите номер категории').isInt(),
  body('showCorrectAnswers', 'Некоректное значение').isBoolean(),
  body('description', 'Некоректное описание теста').isString().optional(),
];
