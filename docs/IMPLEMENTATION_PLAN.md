# Техническое задание — Student Planner

Сводное ТЗ по всем этапам реализации проекта: backend (Go/Gin/GORM) и frontend (React/Vite). Документ описывает то, что было реализовано, в виде последовательных этапов — может использоваться как руководство для воссоздания проекта с нуля или как основа для отчёта по проделанной работе.

---

## Этап 0 — Подготовка окружения

### Цель
Настроить репозиторий и базовое окружение так, чтобы backend и frontend могли разрабатываться независимо.

### Backend

**Зависимости:**
```
gin-gonic/gin
gin-contrib/cors
gorm.io/gorm
gorm.io/driver/postgres
golang-jwt/jwt/v5
joho/godotenv
golang.org/x/crypto
```

**Структура каталогов:**
```
backend/
  cmd/main.go
  internal/
    auth/
    user/
    task/
    subject/
  pkg/
    config/
    database/
  .env / .env.example
```

**`pkg/config`** — структура `Config` с полями `DBHost, DBPort, DBUser, DBPassword, DBName, JWTSecret, AppPort`, загружается через `godotenv` + `os.Getenv`.

**`pkg/database`** — функция `Connect(cfg Config) *gorm.DB`, DSN с `sslmode=disable`.

**`cmd/main.go`** на этом этапе:
1. Загрузить конфиг
2. Подключиться к БД
3. Создать Gin-роутер
4. Подключить CORS-middleware **до** регистрации маршрутов (`AllowOrigins`, `AllowMethods`, `AllowHeaders` включая `Authorization`)
5. Зарегистрировать `GET /health` → `{"status":"ok"}`
6. Запустить на `cfg.AppPort`

### Frontend

**Инициализация:** Vite + React + TailwindCSS (через `@tailwindcss/vite`, импорт `@import "tailwindcss"` в `index.css`).

**Зависимости:** `axios`, `react-router-dom`.

**Структура:**
```
frontend/src/
  api/axios.js
  pages/ (заглушки: Login, Register, Dashboard)
  components/
  hooks/
  App.jsx, main.jsx
```

**`api/axios.js`** — базовый клиент с `baseURL`, интерцептор запроса добавляет `Authorization: Bearer <token>` из `localStorage`.

**`App.jsx`** — роутинг: `/login`, `/register`, `/dashboard`, остальное → редирект на `/login`.

### Инфраструктура
`docker-compose.yml` с сервисом `postgres:16-alpine`, переменные окружения совпадают с `.env`.

### Критерии готовности
- `docker compose up -d` поднимает БД
- `go run ./cmd/main.go` запускается, `GET /health` → 200
- `npm run dev` запускается, роутинг между заглушками работает
- `.env` не в git, `.env.example` в git

---

## Этап 1 — Авторизация

### Цель
Регистрация, логин, JWT access/refresh токены, middleware проверки токена, защищённый эндпоинт профиля.

### Архитектура (применяется ко всем последующим модулям)
Каждый модуль = 3 слоя:
- **Repository** — структура с полем `db *gorm.DB`, конструктор `New...Repository(db)`, методы CRUD через GORM
- **Service** — структура с полем-репозиторием, конструктор принимает репозиторий, бизнес-логика
- **Handler** — структура с сервисом (и `secret` если нужны токены), методы-обработчики + `RegisterRoutes(rg *gin.RouterGroup)`

Сборка — в `main.go`: `db → Repository → Service → Handler → RegisterRoutes`.

### Сущность User
`internal/user/model.go`:
```go
type User struct {
    gorm.Model
    Email        string `gorm:"uniqueIndex;not null" json:"email"`
    PasswordHash string `gorm:"not null" json:"-"`
    Name         string `gorm:"not null" json:"name"`
}
```

### `internal/middleware/middleware.go`
- `type Claims struct { UserID uint; jwt.RegisteredClaims }`
- `AuthMiddleware(secret string) gin.HandlerFunc` — функция-обёртка возвращающая `gin.HandlerFunc` (замыкание захватывает `secret`):
  1. Проверить заголовок `Authorization` непустой и начинается с `"Bearer "`
  2. Обрезать префикс
  3. `jwt.ParseWithClaims` с проверкой алгоритма `HS256`
  4. При ошибке/невалидном токене → `401` + `c.Abort()`
  5. Type assertion `token.Claims.(*Claims)`
  6. `c.Set("userID", claims.UserID)`, `c.Next()`

### `internal/auth/jwt.go`
- `GenerateAccessToken(userID uint, secret string)` — `Claims{UserID, ExpiresAt: now+15m}`, `jwt.NewWithClaims(HS256, claims).SignedString([]byte(secret))`
- `GenerateRefreshToken` — то же, `ExpiresAt: now+7d`

### `internal/user/repository.go`
- `FindByEmail(email string) (User, error)`
- `Create(user User) (User, error)`
- `GetByID(id uint) (User, error)`

### `internal/user/service.go`
- `Register(name, email, password string) (User, error)`:
  1. `FindByEmail` — если найден (err == nil) → `"email already taken"`; если ошибка БД (не `ErrRecordNotFound`) → вернуть её
  2. `bcrypt.GenerateFromPassword`
  3. `repo.Create`
- `Login(email, password string) (User, error)`:
  1. `FindByEmail` — `ErrRecordNotFound` → `"invalid credentials"`
  2. `bcrypt.CompareHashAndPassword` — ошибка → `"invalid credentials"` (одинаковое сообщение для обоих случаев — не раскрывать что именно не совпало)
- `GetByID(id uint) (User, error)` — `ErrRecordNotFound` → `"User not found"`

### `internal/auth/handler.go`
Эндпоинты группы `/auth` (без middleware):

**POST `/auth/register`**
- `RegisterRequest{Email string binding:"required,email"; Password string binding:"required,min=8"; Name string binding:"required,min=2"}`
- 201 → `RegisterResponse{ID, Email, Name}` (без пароля); 409 если email занят; 400 при ошибке валидации

**POST `/auth/login`**
- `LoginRequest{Email, Password}`
- 200 → `LoginResponse{AccessToken, RefreshToken}`; 401 при `"invalid credentials"`

**POST `/auth/refresh`**
- `RefreshRequest{RefreshToken string binding:"required"}`
- Парсинг токена так же как в middleware (с `middleware.Claims`)
- 200 → `{"access_token": "..."}`; 401 при невалидном/просроченном токене

### `internal/user/handler.go`
**GET `/users/me`** (защищён `AuthMiddleware`):
- Достать `userID` из контекста (`c.Get("userID").(uint)`)
- `userService.GetByID` → 200 `UserResponse{ID, Email, Name}`; 404 если не найден

### Валидация — сводка
| Поле | Правила |
|---|---|
| email | `required,email` |
| password | `required,min=8` |
| name | `required,min=2` |

### Критерии готовности (Postman)
- Регистрация валидная → 201; повтор email → 409; без email → 400; короткий пароль → 400
- Логин валидный → 200, два токена; неверный пароль/email → 401
- `/users/me` с токеном → 200; без токена → 401; с просроченным → 401
- `/auth/refresh` валидный → 200 новый access; невалидный/просроченный → 401

---

## Этап 2 — Задачи и предметы

### Цель
CRUD предметов и задач, с изоляцией данных по пользователю.

### Сущности

**`internal/subject/model.go`**
```go
type Subject struct {
    gorm.Model
    UserID uint   `json:"user_id" gorm:"not null"`
    Name   string `json:"name" gorm:"not null"`
    Color  string `json:"color"`
}
```

**`internal/task/model.go`**
```go
type Task struct {
    gorm.Model
    UserID      uint       `json:"user_id" gorm:"not null"`
    SubjectID   *uint      `json:"subject_id"`
    Title       string     `json:"title" gorm:"not null"`
    Description string     `json:"description"`
    DueDate     *time.Time `json:"due_date"`
    Priority    string     `json:"priority" gorm:"not null;default:medium"`
    Status      string     `json:"status" gorm:"not null;default:todo"`
}
```
> `SubjectID` и `DueDate` — указатели (опциональны, допускают NULL).

### Repository (subject и task — аналогично)
- `GetAll(userID uint) ([]T, error)` — `WHERE user_id = ?`
- `Create(item T) (T, error)`
- `Update(item T) (T, error)` — `db.Save()`
- `Delete(id, userID uint) error` — найти `WHERE id=? AND user_id=?`, если `ErrRecordNotFound` вернуть как есть, иначе `db.Delete()`
- `GetByID(id, userID uint) (T, error)`

Для `task.GetAll` дополнительно — построение запроса через method chaining с опциональными фильтрами (см. Этап 2.1).

### Service
- `Create(userID uint, ...)` — заполняет `UserID`, вызывает `repo.Create`
- `Update(id, userID uint, ...)`:
  1. `repo.GetByID` — `ErrRecordNotFound` → `"<entity> not found"`
  2. Обновить поля у **найденной** записи (не у входной структуры — чтобы не потерять `ID`/`UserID`)
  3. `repo.Update`
- `Delete(id, userID uint)` — `ErrRecordNotFound` → `"<entity> not found"`

### Handler — общий паттерн
- Достать `userID` из `c.Get("userID")` → если нет, 401
- `:id` из `c.Param("id")` → `strconv.ParseUint` → `uint`; ошибка конвертации → **400**
- Бизнес-ошибка `"not found"` → **404** (не 403 — чтобы не подтверждать существование чужой записи)
- Прочие ошибки сервиса → 500

### Эндпоинты `/subjects` (защищены)
| Метод | Путь | Запрос | Ответ |
|---|---|---|---|
| GET | `/` | — | `{success: []Subject}` |
| POST | `/` | `{name, color}` | 201 `{success: Subject}` |
| PUT | `/:id` | `{name, color}` | 200 / 404 |
| DELETE | `/:id` | — | 200 `{message:"deleted"}` / 404 |

`SubjectRequest{Name string binding:"required,min=2"; Color string binding:"omitempty"}`

### Эндпоинты `/tasks` (защищены)
| Метод | Путь | Запрос | Ответ |
|---|---|---|---|
| GET | `/` | query-фильтры | `{success: []Task}` |
| POST | `/` | `TaskRequest` | 201 |
| PUT | `/:id` | `TaskRequest` | 200 / 404 |
| DELETE | `/:id` | — | 200 / 404 |
| PATCH | `/:id/status` | `{status}` | 200 `{message:"updated"}` |

`TaskRequest`:
```go
Title       string     binding:"required,min=2"
Description string     binding:"omitempty"
DueDate     *time.Time binding:"omitempty"
Priority    string     binding:"required,oneof=low medium high"
Status      string     binding:"required,oneof=todo in_progress done"
SubjectID   *uint      binding:"omitempty"
```

`UpdateStatus` — отдельный сервисный метод `repo.UpdateStatus(id, userID, status)` через `db.Model(&Task{}).Where(...).Update("status", status)`.

### AutoMigrate
`db.AutoMigrate(&user.User{}, &subject.Subject{}, &task.Task{})`

### Критерии готовности
- Все CRUD по subjects/tasks работают, изоляция по `user_id` подтверждена (чужие записи → 404)
- Невалидный `priority`/`status` → 400
- `PATCH /:id/status` меняет только статус

---

## Этап 2.1 — Фильтрация и поиск задач (расширение Этапа 2)

### Цель
`GET /tasks/` поддерживает множественные опциональные фильтры.

### Repository — `GetAll` через method chaining
```go
query := db.Where("user_id = ?", userID)
if status != ""    { query = query.Where("status = ?", status) }
if priority != ""   { query = query.Where("priority = ?", priority) }
if dueFrom != ""    { query = query.Where("due_date >= ?", dueFrom) }
if dueTo != ""      { query = query.Where("due_date <= ?", dueTo) }
if subjectID != nil { query = query.Where("subject_id = ?", *subjectID) }
if search != ""     { query = query.Where("title ILIKE ?", "%"+search+"%") }
query.Find(&tasks)
```
> Каждое `query = query.Where(...)` обязательно — иначе условия не накапливаются.

### Query-параметры `GET /tasks/`
| Параметр | Тип | Пример |
|---|---|---|
| `status` | string | `todo` |
| `priority` | string | `high` |
| `subject_id` | uint | `1` |
| `search` | string | `матем` (ILIKE, регистронезависимый) |
| `due_from` | date `YYYY-MM-DD` | `2026-06-01` |
| `due_to` | date `YYYY-MM-DD` | `2026-06-30` |

Дата в формате `YYYY-MM-DD` корректно сравнивается PostgreSQL с `timestamp` без доп. преобразований.

### Frontend
- Поле поиска с debounce 400мс (`setTimeout`/`clearTimeout` в `useEffect`)
- Выпадающие фильтры status/priority/subject_id, кнопка "Сброс" при активных фильтрах
- Все фильтры объединяются в один объект `params`, передаются в `axios.get('/tasks/', {params})`

---

## Этап 3 — Календарь

### Цель
Отображение задач по датам дедлайна, фильтрация по диапазону месяца.

### Backend
Переиспользует `due_from`/`due_to` из Этапа 2.1 — дополнительных эндпоинтов не требуется.

### Frontend
- Библиотека: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`
- `datesSet` callback — при смене месяца запрашивать `GET /tasks/?due_from=...&due_to=...`
- Преобразование задач в события: `{id, title, date: due_date.split('T')[0], backgroundColor, borderColor, extendedProps: {task}}`
- Цвет события:
  - `status === 'done'` → серый
  - `due_date < now && status !== 'done'` → красный (просрочено)
  - иначе → цвет предмета (`subjects.find(s => s.ID === task.subject_id)?.color`) или акцентный по умолчанию
- `eventClick` → модальное окно с деталями задачи (статус, приоритет, дедлайн, описание)
- Кастомные CSS-переопределения для FullCalendar под тёмную тему (`.fc-button`, `.fc-toolbar-title`, `.fc-day-today` и т.д.)

### Критерии готовности
- Задачи видны на нужных датах; просроченные — красные; выполненные — серые
- Клик по событию открывает детали; смена месяца подгружает новые данные

---

## Этап 4 — Статистика и дашборд

### Цель
Backend-эндпоинты агрегированной статистики + дашборд на фронтенде.

### `GET /tasks/stats`

**`task/model.go`**
```go
type TaskStats struct {
    Total      int64 `json:"total"`
    Done       int64 `json:"done"`
    InProgress int64 `json:"in_progress"`
    Todo       int64 `json:"todo"`
    Overdue    int64 `json:"overdue"`
}
```

**Repository** — 5 отдельных запросов через `.Model(&Task{}).Where(...).Count(&field)`, каждый с проверкой `result.Error`:
- `Total` — `user_id = ?`
- `Done` — `+ status = 'done'`
- `InProgress` — `+ status = 'in_progress'`
- `Todo` — `+ status = 'todo'`
- `Overdue` — `+ status != 'done' AND due_date < NOW()`

> `.Model(&Task{})` обязателен — иначе GORM не знает таблицу для `Count`.

Маршрут `GET /tasks/stats` регистрируется **до** `GET /tasks/:id`-подобных (если были) — иначе Gin примет `stats` за `id`.

### `GET /subjects/stats`

**`subject/model.go`**
```go
type SubjectStats struct {
    SubjectID   uint   `json:"subject_id"`
    SubjectName string `json:"subject_name"`
    Color       string `json:"color"`
    TotalTasks  int64  `json:"total_tasks"`
    DoneTasks   int64  `json:"done_tasks"`
}
```

**Repository:**
1. `GetAll(userID)` — список предметов
2. Для каждого предмета — `Count` задач (`subject_id=? AND user_id=?`) и `Count` выполненных (`+ status='done'`), через `.Model(&task.Task{})`
3. Собрать `[]SubjectStats`

> Требует импорт пакета `task` в `subject` — циклической зависимости нет, т.к. `task` не импортирует `subject`.

Маршрут `GET /subjects/stats` — также до `/:id`.

### Frontend — Дашборд
- `Promise.all([GET /tasks/stats, GET /tasks/, GET /subjects/])`
- 4 карточки статистики (всего/выполнено/в работе/просрочено)
- Прогресс-бар: `pct = round(done/total*100)`
- Список последних 6 активных задач (status !== done)
- Боковая панель со списком предметов

### Frontend — Предметы со статистикой
- `Promise.all([GET /subjects/, GET /subjects/stats])`, статистика мапится по `subject_id`
- У каждого предмета: `"done_tasks/total_tasks задач"`, прогресс-бар цветом предмета, процент

### Критерии готовности
- `/tasks/stats` и `/subjects/stats` возвращают корректные агрегаты, проверено на реальных данных
- Дашборд и страница предметов отображают данные из этих эндпоинтов

---

## Этап 5 — Самооценка (Grades)

### Цель
К каждой задаче можно добавить самооценку (1–5) с комментарием. Реализовано как self-assessment — без роли "преподаватель".

### `internal/grade/model.go`
```go
type Grade struct {
    gorm.Model
    TaskID   uint    `json:"task_id" gorm:"not null"`
    UserID   uint    `json:"user_id" gorm:"not null"`
    Score    float64 `json:"score"`
    Feedback string  `json:"feedback"`
}
```

### Repository
- `GetByTaskID(taskID, userID uint) ([]Grade, error)` — `Find` (не `First` — может быть несколько записей)
- `Create`, `Update` (`db.Save`), `Delete`, `GetByID` — стандартный паттерн

### Service
- Зависит от **двух** репозиториев: `GradeRepository` и `task.TaskRepository` (для проверки владения задачей)
- `NewGradeService(repo *GradeRepository, taskRepo *task.TaskRepository)`
- `Create(userID uint, grade Grade)`:
  1. `taskRepo.GetByID(grade.TaskID, userID)` — `ErrRecordNotFound` → `"task not found"`
  2. `grade.UserID = userID`
  3. `repo.Create`
- `Update`/`Delete` — стандартный паттерн с `"grade not found"`

### Эндпоинты `/grades` (защищены)
| Метод | Путь | Запрос | Ответ |
|---|---|---|---|
| GET | `/?task_id=N` | query | `{success: []Grade}` |
| POST | `/` | `{task_id, score, feedback}` | 201 / 404 если задача не найдена |
| PUT | `/:id` | `{task_id, score, feedback}` | 200 / 404 |
| DELETE | `/:id` | — | 200 / 404 |

`GradeRequest{TaskID uint binding:"required"; Score float64 binding:"required,min=1,max=5"; Feedback string binding:"omitempty"}`

`GetByTaskID` — параметр `task_id` берётся через `c.Query`, не `c.Param`.

### Main.go
```go
gradeRepo := grade.NewGradeRepository(db)
gradeService := grade.NewGradeService(gradeRepo, taskRepo) // оба репозитория
gradeHandler := grade.NewGradeHandler(*gradeService, cfg.JWTSecret)
db.AutoMigrate(..., &grade.Grade{})
```

### Frontend
- На странице задач — кнопка ★ у каждой задачи
- При клике открывается панель снизу карточки с формой `{score, feedback}`
- Если самооценка есть — отображаются звёзды (`renderStars`, поддержка половинок `½`) рядом с названием задачи + комментарий
- Кнопки "Сохранить"/"Добавить" и "Удалить самооценку" (видна всегда если оценка существует, в т.ч. в режиме редактирования)
- После удаления — панель закрывается автоматически
- В UI термины — "Самооценка", "Комментарий к работе" (не "оценка преподавателя")

### Критерии готовности
- Создание/редактирование/удаление самооценки работает через UI и API
- Самооценка к чужой/несуществующей задаче → 404
- `score` вне диапазона 1–5 → 400

---

## Этап 6 — Браузерные уведомления

### Цель
Напоминания о приближающихся дедлайнах через `Notification API`, без изменений на backend.

### `frontend/src/hooks/useNotifications.js`
- При монтировании: `Notification.requestPermission()`
- Если разрешено — первая проверка сразу, затем `setInterval(checkAndNotify, 60_000)`, очистка через `clearInterval` при размонтировании
- `checkAndNotify`:
  1. `GET /tasks/`
  2. Для каждой задачи: есть `due_date`, `status !== 'done'`, `0 < due - now <= 24h`, ID не в `localStorage['notified_tasks']`
  3. `new Notification(title, {body, icon})`
  4. Добавить ID задачи в `notified_tasks` (чтобы не показывать повторно)

### Подключение
В `App.jsx` вызвать `useNotifications()` внутри компонента — хук работает пока приложение открыто.

### Ограничение
Работает только при открытой вкладке — нет Service Worker / фоновых push-уведомлений.

### Критерии готовности
- При наличии задачи с дедлайном в пределах 24ч — уведомление появляется в течение минуты
- Повторно для той же задачи уведомление не показывается

---

## Этап 7 — Адаптивный дизайн (Mobile)

### Цель
Корректное отображение на экранах ≤720px без изменения десктопной версии.

### Подход
Десктопные layout-свойства (display/grid-template-columns/flex-direction) выносятся из инлайн-стилей в CSS-классы (`index.css`), которые переопределяются в `@media (max-width: 720px)`. Инлайн-стили остаются только для цветов/отступов, не зависящих от breakpoint.

### Ключевые классы
| Класс | Назначение | Mobile-override |
|---|---|---|
| `.layout-main` | контейнер страницы | уменьшенный padding |
| `.navbar-inner`, `.navbar-links`, `.navbar-brand-full` | навбар | компактные пункты, скрытие части лого, горизонтальный скролл меню |
| `.page-header` | заголовок + кнопка действия | вертикальная раскладка, кнопка на всю ширину |
| `.stat-grid` | карточки статистики (4 шт) | `repeat(4,1fr)` → `repeat(2,1fr)` |
| `.dash-layout`, `.dash-sidebar` | дашборд (контент+сайдбар) | `row` → `column`, сайдбар на всю ширину |
| `.form-grid`, `.grade-form-grid` | сетки форм | `1fr 1fr` → `1fr` (или `100px 1fr` для оценки) |
| `.task-row`, `.task-row-info`, `.task-row-actions` | строка задачи | `row` → `column`, действия переносятся |
| `.subject-row`, `.subject-row-stats` | строка предмета | `flex-wrap`, статистика на новую строку |
| `.filters-row` | фильтры задач | `flex-wrap` |
| `.calendar-card` | контейнер календаря | уменьшенный padding, шрифты `.fc` уменьшены |

### Критерии готовности
- На ширине ≤720px нет горизонтального скролла
- Все интерактивные элементы доступны и не перекрываются
- Десктопная версия (>720px) визуально не изменилась

---

## Этап 8 — Деплой

### Backend → Railway
1. Создать PostgreSQL-сервис (managed)
2. Создать сервис из GitHub-репозитория, **Root Directory = `backend`**
3. Build command: `go build -ldflags="-w -s" -o out ./cmd/`
4. Start command: `./out`
5. Переменные окружения — через Reference Variables на Postgres-сервис: `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME` + вручную `JWT_SECRET`, `APP_PORT=8080`
6. Проверка: публичный домен → `/health` → `{"status":"ok"}`

### Frontend → Vercel
1. Root Directory = `frontend`
2. `src/api/axios.js`: `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'`
3. Переменная окружения `VITE_API_URL = https://<backend>.up.railway.app/api`
4. `frontend/vercel.json` — SPA fallback:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
(без него прямой переход на `/login` после деплоя → 404)

### Backend — финальный CORS
```go
AllowOrigins: []string{"http://localhost:5173", "https://<frontend>.vercel.app"}
```

### Критерии готовности
- Полный сценарий (регистрация → логин → создание предмета/задачи → календарь → дашборд → самооценка) работает на продакшен-доменах
- Перезагрузка любой страницы фронтенда не даёт 404

---

## Сквозные технические решения (применимы ко всем этапам)

1. **Ошибки уровня сервиса** — простые `errors.New("...")` со строковым сравнением в хендлере (`err.Error() == "..."`). Достаточно для учебного проекта, не требует отдельного пакета типизированных ошибок.
2. **Изоляция данных** — каждый запрос на чтение/изменение/удаление включает `user_id` в `WHERE`. Несовпадение → `404`, не `403` (не подтверждаем существование чужих записей).
3. **Указатели для опциональных полей** (`*uint`, `*time.Time`) — позволяют GORM хранить `NULL` вместо нулевых значений.
4. **AutoMigrate** — вызывается один раз в `main.go` после подключения к БД, со всеми моделями сразу.
5. **JSON-ответы** — единый формат `{"success": ...}` / `{"error": "..."}` / `{"message": "..."}` (для текстовых статусов типа `"deleted"`, `"updated"`).
6. **Frontend auth** — access-токен в памяти/`localStorage`, axios response-interceptor перехватывает `401`, делает `refresh`, повторяет запрос (флаг `_retry` от бесконечного цикла); при неудаче — очистка `localStorage` и редирект на `/login`.
