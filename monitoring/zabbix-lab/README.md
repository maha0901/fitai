# Zabbix — практика (лаборатория)

## Запуск (Windows, PowerShell)

```powershell
cd "C:\Users\User\Desktop\фитИИ\monitoring\zabbix-lab"
docker compose up -d
docker compose ps
```

Первый запуск: подождать **2–5 минут** (создание схемы БД). Смотреть логи:

```powershell
docker compose logs -f zabbix-server
```

Когда в логах нет бесконечных ошибок подключения к MySQL — открывай веб.

## Вход в веб-интерфейс

- URL: **http://localhost:8090**
- Логин: **Admin**
- Пароль: **zabbix**

(Стандарт для новой установки Zabbix.)

## Если красным: «Zabbix agent is not available» (Zabbix server)

В Docker сервер и агент в **разных** контейнерах: по умолчанию хост **Zabbix server** ищет агент на **127.0.0.1** — там никого нет.

1. Обнови compose и перезапусти агент:
   ```powershell
   docker compose up -d --force-recreate zabbix-agent
   ```
2. **Data collection → Hosts → Zabbix server** → вкладка **Interfaces**.

3. Узнай **внутренний IP** контейнера агента (из папки `zabbix-lab`):

   ```powershell
   docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" $(docker compose ps -q zabbix-agent)
   ```

   Будет что-то вроде `172.18.0.5` — его и используй.

4. У интерфейса **Agent** сделай так (самый простой вариант):

   - **Connect to:** **IP**
   - **IP address:** вставь **полученный IP** (например `172.18.0.5`)
   - **Port:** **10050**

   Zabbix часто **не даёт оставить IP пустым** даже при режиме DNS — поэтому надёжнее указать реальный IP контейнера.

   **Альтернатива (DNS):** **Connect to → DNS**, **DNS name → `zabbix-agent`**, а в **IP address** поставь заглушку **`0.0.0.0`** (если форма примет сохранение).

5. **Update** → подожди 1–2 минуты. **Monitoring → Hosts** — статус должен стать зелёным.

**Важно:** после `docker compose down` / пересоздания сети IP агента может **смениться** — тогда снова выполни `docker inspect` и обнови хост в Zabbix.

## Что сделать в UI (минимум для отчёта)

1. Убедиться, что хост **Zabbix server** доступен (см. блок выше).
2. **Monitoring → Latest data** — выбрать хост **Zabbix server**, убедиться, что идут метрики.
3. Тест «алерт» — остановка агента:

```powershell
docker compose stop zabbix-agent
```

Подождать 2–5 минут → **Monitoring → Problems**. Потом:

```powershell
docker compose start zabbix-agent
```

## Остановка

```powershell
docker compose down
```

Данные MySQL сохраняются в volume `zabbix_mysql_data`. Полный сброс:

```powershell
docker compose down -v
```

## Порты

| Сервис        | Порт хоста |
|---------------|------------|
| Zabbix Web    | 8090       |
| Zabbix Server | 10051      |

## Тема Pull/Push (для текста отчёта)

Zabbix обычно описывают как **гибрид**: активный агент **отправляет** данные на сервер (push-логика для метрик агента), при этом сервер **опрашивает** доступность и может выполнять внешние проверки (poll). Для защиты достаточно 2–3 предложений с этой формулировкой.
