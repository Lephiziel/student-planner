# 🎓 Student Planner

Student Planner — это полнофункциональное веб-приложение для организации учебного процесса студентов.

Приложение позволяет управлять учебными предметами, задачами, дедлайнами и оценками, а также отслеживать прогресс обучения через статистику и календарное представление.

---

## ✨ Основные возможности

### 🔐 Аутентификация

* Регистрация пользователя
* Авторизация по JWT
* Защищенные маршруты
* Персональные данные для каждого пользователя

### 📚 Управление предметами

* Создание предметов
* Редактирование предметов
* Удаление предметов
* Цветовая маркировка предметов
* Статистика по каждому предмету

### ✅ Управление задачами

* Создание задач
* Редактирование и удаление
* Назначение предмета
* Установка дедлайна
* Приоритеты:

  * Low
  * Medium
  * High
* Статусы:

  * Todo
  * In Progress
  * Done
* Поиск и фильтрация

### 📝 Оценки

Для каждой задачи можно:

* Добавлять самооценку
* Оставлять комментарий самооценки
* Редактировать оценки
* Отслеживать результаты выполнения

### 📅 Календарь

* Просмотр всех дедлайнов
* Отображение задач по датам
* Цветовая привязка к предметам
* Отдельная индикация просроченных задач

### 📊 Дашборд

* Общее количество задач
* Выполненные задачи
* Задачи в работе
* Просроченные задачи
* Процент выполнения
* Ближайшие активные задачи

---

# 🏗 Архитектура проекта

```text
student-planner/
│
├── backend/
│   ├── cmd/
│   ├── internal/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── task/
│   │   ├── subject/
│   │   └── grade/
│   └── pkg/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│
└── docker-compose.yml
```

---

# 🛠 Технологический стек

## Frontend

* React 19
* Vite
* React Router
* Axios
* FullCalendar
* Tailwind CSS

## Backend

* Go
* Gin
* GORM
* JWT
* PostgreSQL
* CORS Middleware

## Infrastructure

* Docker Compose
* PostgreSQL 16

---

# 🗄 Модель данных

## User

```go
type User struct {
    ID
    Email
    PasswordHash
    Name
}
```

## Subject

```go
type Subject struct {
    ID
    UserID
    Name
    Color
}
```

## Task

```go
type Task struct {
    ID
    UserID
    SubjectID
    Title
    Description
    DueDate
    Priority
    Status
}
```

## Grade

```go
type Grade struct {
    ID
    TaskID
    UserID
    Score
    Feedback
}
```

---

# 🚀 Быстрый старт

## 1. Клонирование репозитория

```bash
git clone https://github.com/Lephiziel/student-planner.git
cd student-planner
```

---

## 2. Запуск PostgreSQL

Проект содержит готовый Docker Compose:

```bash
docker compose up -d
```

Будет создан контейнер:

```text
PostgreSQL 16

Database: planner_db
User: planner
Password: planner_pass
Port: 5433
```

---

## 3. Настройка Backend

Перейдите в папку:

```bash
cd backend
```

Создайте файл `.env`:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=planner
DB_PASSWORD=planner_pass
DB_NAME=planner_db

JWT_SECRET=super_secret_key

APP_PORT=8080
```

Установите зависимости:

```bash
go mod download
```

Запустите сервер:

```bash
go run ./cmd
```

Backend будет доступен по адресу:

```text
http://localhost:8080
```

Проверка состояния:

```text
GET /health
```

---

## 4. Настройка Frontend

Перейдите в папку:

```bash
cd frontend
```

Установите зависимости:

```bash
npm install
```

Запустите приложение:

```bash
npm run dev
```

Frontend будет доступен по адресу:

```text
http://localhost:5173
```

---

# 🔌 REST API

## Auth

| Метод | Endpoint      |
| ----- | ------------- |
| POST  | /api/register |
| POST  | /api/login    |

---

## Subjects

| Метод  | Endpoint            |
| ------ | ------------------- |
| GET    | /api/subjects       |
| GET    | /api/subjects/stats |
| POST   | /api/subjects       |
| PUT    | /api/subjects/:id   |
| DELETE | /api/subjects/:id   |

---

## Tasks

| Метод  | Endpoint         |
| ------ | ---------------- |
| GET    | /api/tasks       |
| GET    | /api/tasks/stats |
| POST   | /api/tasks       |
| PUT    | /api/tasks/:id   |
| DELETE | /api/tasks/:id   |

Поддерживаются фильтры:

```text
status
priority
subject_id
search
due_from
due_to
```

---

## Grades

| Метод  | Endpoint        |
| ------ | --------------- |
| GET    | /api/grades     |
| POST   | /api/grades     |
| PUT    | /api/grades/:id |
| DELETE | /api/grades/:id |

---

# 📊 Статистика

Система автоматически рассчитывает:

* Всего задач
* Выполнено задач
* Задач в работе
* Ожидающих выполнения
* Просроченных задач

Для предметов дополнительно отображается:

* Количество задач
* Количество выполненных задач
* Прогресс по предмету

---

# 🔒 Безопасность

* JWT Authentication
* Защищенные API-маршруты
* Изоляция данных пользователей
* Хранение паролей в виде хэшей

---

# 📈 Возможности для развития

* Email-уведомления
* Push-уведомления
* Повторяющиеся задачи
* Экспорт в Google Calendar
* Аналитика успеваемости
* Темная тема
* Командная работа
* Напоминания через Telegram

---

# 🤝 Contributing

Pull Requests приветствуются.

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

После этого создайте Pull Request.

---

# 📄 License

MIT License

---

# 👨‍💻 Authors

* Lephiziel (backend dev.)
* dreddieee (fronted dev.)
* Krelick ()
* nershoov ()

Student Planner — учебный проект по разработке современного full-stack приложения на React и Go.
