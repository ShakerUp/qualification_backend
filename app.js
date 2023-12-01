// app.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import testRoutes from './routes/testRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Соединение с MongoDB успешно установлено');
  })
  .catch((err) => {
    console.error('Ошибка при подключении к MongoDB', err);
  });

app.use('/auth', authRoutes);
app.use('/library', bookRoutes);
app.use('/tests', testRoutes);

app.listen(port, () => {
  try {
    console.log(`Сервер запущен на порту ${port}`);
  } catch (err) {
    console.log(err);
  }
});

console.log()