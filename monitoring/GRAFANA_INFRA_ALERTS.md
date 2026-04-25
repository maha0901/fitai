# Инфраструктурные алерты (как у партнёра) — Grafana

После `docker compose -p fitai up -d` в Prometheus появятся job’ы **`node-exporter`** и **`cadvisor`**.

В Grafana: **Alerting → New alert rule** → Data source **Prometheus** → вставь PromQL ниже.

---

## 1) Высокая загрузка CPU (хост, как у партнёра)

**Имя правила:** `High CPU (host)`

**Query A:**
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle",job="node-exporter"}[2m])) * 100)
```

**Condition:** `IS ABOVE 80`  
**For:** `2m`

---

## 2) Мало свободной RAM (хост)

**Имя:** `High memory usage (host)`

**Query A:**
```promql
(1 - (node_memory_MemAvailable_bytes{job="node-exporter"} / node_memory_MemTotal_bytes{job="node-exporter"})) * 100
```

**Condition:** `IS ABOVE 85`  
**For:** `2m`

---

## 3) Контейнер съедает много памяти (cAdvisor)

Имена контейнеров в Docker Compose обычно вида `fitai-backend-1`. Подставь свой префикс проекта (`docker compose ps` → NAMES).

**Имя:** `Container high memory`

**Query A:**
```promql
sum by (name) (container_memory_usage_bytes{name=~"fitai-.*",job="cadvisor"}) / 1024 / 1024 / 1024
```

**Condition:** `IS ABOVE` порог в **GiB** (например `0.5` для теста или `1.5` для прод)  
**For:** `2m`

Если метрика без `name`, открой **Explore** и найди `container_memory_usage_bytes` — посмотри лейблы (`container_label_com_docker_compose_service` и т.д.).

---

## 4) Контейнер «пропал» (нет метрик по имени)

**Имя:** `Container missing (cadvisor)`

**Query A:**
```promql
absent(container_last_seen{name=~"fitai-backend-1",job="cadvisor"})
```

**Condition:** `IS ABOVE 0` (или как в Grafana для absent — используй **No data** handling = Alerting, либо выражение `vector(1)` + absent)

Проще вариант — алерт на **отсутствие** серии через Grafana expression; если сложно — используй только правила 1–3.

---

## Проверка в Prometheus

`http://localhost:9091` → **Status → Targets** — должны быть **UP**:
- `node-exporter`
- `cadvisor`

UI cAdvisor (опционально): `http://localhost:8088`
