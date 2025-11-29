# Инструкция по запуску системы регионов, городов и школ

## Что было реализовано:

1. **База данных**: Добавлены таблицы Region, Settlement (города), School
2. **Backend API** (`/api/regions`):
   - `GET /api/regions` - список всех регионов
   - `GET /api/regions/:regionId/settlements` - города по региону
   - `GET /api/regions/settlement/:settlementId/schools` - школы по городу
   - `POST /api/regions` - добавить регион
   - `POST /api/regions/:regionId/settlements` - добавить город
   - `POST /api/regions/settlement/:settlementId/schools` - добавить школу

3. **Frontend**: Форма регистрации с динамической загрузкой:
   - Выбор региона → загружаются города
   - Выбор города → загружаются школы
   - Возможность ввести свою школу, если нет в списке
   - Автодополнение везде

## Как запустить:

### 1. Запустить миграции

```bash
cd nest
npm run typeorm:run-migrations
```

Это создаст таблицы и заполнит их начальными данными (все регионы и школы Костромской области).

### 2. Запустить Backend

```bash
cd nest
npm run start:dev
```

Бэк будет доступен на `http://localhost:3001`

### 3. Запустить Frontend

```bash
cd next
npm run dev
```

Фронт будет доступен на `http://localhost:3000`

## Добавление новых школ

### Способ 1: Через API (постман)

```
POST http://localhost:3001/api/regions/settlement/1/schools
Content-Type: application/json

{
  "name": "МБОУ г. Костромы СОШ № 100"
}
```

### Способ 2: Через админ-панель (если создать)

Нужно создать страницу управления школами/городами в админ части приложения.

### Способ 3: В форме регистрации

Если школы нет в списке, пользователь может ввести её название вручную. Она сохранится как `educationalInstitutionCustom`.

## Структура таблиц

```
Region (id, name)
  └─ Settlement (id, name, regionId)
       └─ School (id, name, settlementId)

User
  ├─ regionId → Region
  ├─ settlementId → Settlement
  ├─ schoolId → School
  └─ educationalInstitutionCustom (если школы нет в БД)
```

## Если что-то не работает:

1. Проверь, что БД запущена (PostgreSQL на localhost:5432)
2. Проверь, что миграции выполнились: 
   ```bash
   cd nest && npm run typeorm -- -d ./typeOrm.config.ts migration:show
   ```
3. Проверь консоль браузера на ошибки
4. Проверь логи бэка на ошибки
