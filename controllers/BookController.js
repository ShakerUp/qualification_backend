import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import TestModel from '../models/TestModel.js';
import TestResultModel from '../models/TestResultModel.js';
import UserModel from '../models/UserModel.js';
import QuestionModel from '../models/QuestionModel.js';
import BookModel from '../models/BookModel.js';

dotenv.config();


export const getAll = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== '0') {
      query = { category: category };
    }

    const books = await BookModel.find(query);
    res.json(books);
  } catch (err) {
    console.error('Error fetching book data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addBook = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Ошибка при добавлении книги', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
