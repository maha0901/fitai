# Fit AI Server

Современное веб-приложение для фитнеса с ИИ-планами, статистикой и админ-панелью.

## Стек

- **Backend:** Node.js, Express, PostgreSQL, JWT
- **Frontend:** React, Vite, Tailwind CSS, Chart.js
- **Контейнеризация:** Docker, docker-compose

## Запуск через Docker (рекомендуется)

```bash
docker-compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:5000 (через nginx проксируется на /api)
- PostgreSQL: localhost:5432 (логин/пароль: postgres/postgres, БД: fit_ai_db)
- **Prometheus:** http://localhost:9091 — сбор метрик с backend (`/metrics`; порт **9091**, если 9090 занят)
- **Grafana:** http://localhost:3001 — логин `admin` / пароль `admin` (смените после первого входа; порт **3001**, если 3000 занят)
- **Jenkins:** http://localhost:8085 — минимальная CI-интеграция (pipeline из `Jenkinsfile`)

Метрики **именно приложения** (RPS по маршрутам, задержка p50/p95, heap Node.js) отдаёт backend на `GET http://localhost:5000/metrics` и дашборд **«Fit AI Server — метрики приложения»** в папке Grafana *Fit AI* (подключается к Prometheus автоматически).

При первом запуске автоматически выполняются миграции БД.  
Имя проекта с кириллицей в пути может вызвать ошибку — используйте: `docker compose -p fitai up --build`.

### Запуск с HTTPS (SSL)

Если нужна защищённая связь (например, на сервере с доменом):

1. Получите сертификаты (например [Let's Encrypt](https://letsencrypt.org/)) и положите в папку `certs/` в корне проекта:
   - `certs/fullchain.pem`
   - `certs/privkey.pem`
2. Запуск с двумя файлами:
   ```bash
   docker compose -p fitai -f docker-compose.yml -f docker-compose.https.yml up --build
   ```
3. Сайт будет доступен по **https://localhost** (порт 443). Порт 80 в этой конфигурации не открывается.

На локальном компьютере для теста SSL можно сгенерировать самоподписанный сертификат (браузер покажет предупреждение — это нормально).

### Jenkins (интеграция CI)

Jenkins запускается как сервис в `docker-compose.yml` (порт `8085`).

1. Откройте `http://localhost:8085`.
2. Получите initial admin password:
   ```bash
   docker exec fitai-jenkins-1 cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Завершите мастер настройки Jenkins (Install suggested plugins).
4. Создайте Pipeline job и укажите источник из GitHub-репозитория проекта.
5. В качестве pipeline script используйте `Jenkinsfile` из корня проекта.

Минимальный pipeline проверяет структуру и обязательные конфигурационные файлы проекта.

## Локальная разработка без Docker

### 1. PostgreSQL

Установите PostgreSQL и создайте БД:

```bash
createdb fit_ai_db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Отредактируйте .env: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fit_ai_db
npm install
npm run migrate
npm run dev
```

API: http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
 
Сайт:http://localhost:3000 (прокси /api на backend).

## Роли

- **client** — личный кабинет: вес, цель, планы тренировок, график прогресса, AI-чат.
- **admin** — админ-панель: список пользователей, статистика, управление ролями.

При регистрации по умолчанию создаётся роль `client`. Для первого админа можно вручную в БД изменить роль на `admin` или добавить отдельный endpoint (по необходимости).

## API (кратко)

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/auth/me` — текущий пользователь (JWT)
- `GET/PUT /api/user/fitness` — данные фитнеса
- `GET /api/user/weight-history`, `POST /api/user/weight` — вес
- `GET /api/user/workout-plans` — планы тренировок
- `POST /api/ai-plan` — получить ИИ-план
- `POST /api/chat`, `GET /api/chat-history` — AI-чат
- `GET /api/admin/stats`, `GET /api/admin/users` и др. — админ (роль admin)
- `GET /metrics` — метрики Prometheus для Grafana (без JWT)
