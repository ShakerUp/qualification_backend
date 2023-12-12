import UserModel from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.JWT_SECRET_KEY;

export const register = async (req, res) => {
  try {
    const { username, name, surname, password, role } = req.body;
    const user = await UserModel.findOne({ username });

    if (user) {
      return res.status(404).json({ error: 'Пользователь с таким именем уже существует' });
    }

    // if (role === 'admin') {
    //     return res.status(400).json({ error: 'Регистрация пользователей с ролью "admin" запрещена' });
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await UserModel.create({
      username,
      name,
      surname,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ _id: newUser._id, role: newUser.role }, secretKey, {
      expiresIn: '1h',
    });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Ошибка при регистрации пользователя', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка при аутентификации пользователя', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const checkMe = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const { _id } = decoded;

    if (!_id) {
      return res.json({ isAuthenticated: false });
    }

    res.json({ isAuthenticated: true, role: req.userRole, username: req.userName });
  } catch (err) {
    res.json({ isAuthenticated: false });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await UserModel.findByIdAndUpdate(userId, { role: newRole }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User promoted successfully', user });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const assignForm = async (req, res) => {
  try {
    const { userId } = req.params;
    const { form } = req.body;

    const user = await UserModel.findByIdAndUpdate(userId, { form: form }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Form is given successfully', user });
  } catch (error) {
    console.error('Error giving form to user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
