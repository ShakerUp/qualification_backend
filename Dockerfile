# Используем официальный образ Node.js
FROM node:14

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --no-cache && npm install -g npm@7

# Копируем остальные файлы приложения
COPY . .

# Устанавливаем переменную среды PORT
ENV PORT 3000

# Открываем порт, который будет слушать ваше приложение
EXPOSE $PORT

# Команда для запуска приложения
CMD ["node", "app.js"]
