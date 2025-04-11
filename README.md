# 🗨️ Реалтайм чат на FastAPI + React

Чат с комнатами, пользователями и WebSocket на FastAPI + Frontend на React с TailwindCSS.

## 📦 Установка backend

Требуется Python 3.12+ и [uv](https://github.com/astral-sh/uv):

### Активируйте окружение
```sh
uv venv
```

### Установка зависимостей из pyproject.toml
```sh
uv sync
```

## Запуск backend

```sh
cd backend
uvicorn main:app --reload --log-level info
```

## Установка frontend

```sh
cd frontend
npm install
npm run dev
```