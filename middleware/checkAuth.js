import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import UserModel from '../models/UserModel.js';

dotenv.config();
const secretKey = process.env.JWT_SECRET_KEY;

const authMiddleware = (allowedRoles) => async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const { role, _id } = decoded;

    const user = await UserModel.findById(_id);

    if (!user) {
      return res.status(401).json({ error: 'Недостаточно прав' });
    }
    if (!role) {
      return res.status(401).json({ error: 'Недостаточно прав' });
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Отказано в доступе' });
    }

    req.userRole = user.role;
    req.userId = _id;
    req.userName = user.username;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

export default authMiddleware;
