from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors


def register_fonts():
    # Arial is available on Windows and supports Cyrillic/Kazakh.
    pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))


def p(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def build_pdf(output_path: str):
    register_fonts()
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleKZ",
        parent=styles["Title"],
        fontName="Arial-Bold",
        fontSize=18,
        leading=22,
        spaceAfter=8,
    )
    h1 = ParagraphStyle(
        "H1KZ",
        parent=styles["Heading1"],
        fontName="Arial-Bold",
        fontSize=14,
        leading=18,
        spaceBefore=10,
        spaceAfter=6,
    )
    h2 = ParagraphStyle(
        "H2KZ",
        parent=styles["Heading2"],
        fontName="Arial-Bold",
        fontSize=11,
        leading=14,
        spaceBefore=6,
        spaceAfter=4,
    )
    body = ParagraphStyle(
        "BodyKZ",
        parent=styles["BodyText"],
        fontName="Arial",
        fontSize=10.5,
        leading=14,
        spaceAfter=3,
    )
    small = ParagraphStyle(
        "SmallKZ",
        parent=body,
        fontSize=9.5,
        leading=12,
    )

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title="Презентация сценарийі: Windows vs Ubuntu мониторинг",
        author="Fit AI + Volt Store Team",
    )

    story = []
    story.append(p("ПРЕЗЕНТАЦИЯҒА ДАЙЫН ТОЛЫҚ СЦЕНАРИЙ", title))
    story.append(p("Тақырып: Windows және Ubuntu ортасында Docker Compose арқылы мониторинг және алертинг жүйесін іске асыру", body))
    story.append(p("Жобалар: Fit AI (Windows) және Volt Store (Ubuntu)", body))
    story.append(Spacer(1, 6))

    intro = (
        "Бұл құжатта 12 слайдқа толық дайын мәтін берілген: "
        "слайдқа не қою керек, қай скринді қай жерге енгізу керек, "
        "және әр слайдта кім нақты не айтатыны көрсетілген."
    )
    story.append(p(intro, body))
    story.append(Spacer(1, 8))

    slides = [
        {
            "n": 1,
            "title": "Титул",
            "put": "Тақырып, орындаушылар, жоба атаулары (Fit AI/Volt Store).",
            "screens": "Скрин міндетті емес. Логотиптер: Docker, Prometheus, Grafana, Telegram.",
            "s1": "Сәлеметсіздер ме! Біздің жұмысымыздың мақсаты — мониторинг және алертинг жүйесін екі операциялық жүйеде іске асыру. "
                  "Мен Windows ортасында Fit AI жобасын орындадым, ал серіктесім Ubuntu ортасында Volt Store жобасын іске асырды.",
            "s2": "",
        },
        {
            "n": 2,
            "title": "Мақсат және міндеттер",
            "put": "Мақсат: бірдей стекті екі ОС-та іске қосу. Міндеттер: Nginx, Prometheus, Grafana, Telegram alerts, Docker Compose, салыстыру.",
            "screens": "Скрин қажет емес.",
            "s1": "Жұмыстың мақсаты — бірдей архитектураны әртүрлі ортада тұрақты түрде іске қосу және айырмашылықтарды нақты өлшеммен көрсету.",
            "s2": "Негізгі міндеттер: сервис орнату, метрика жинау, дашборд жасау, алерт ережелерін қосу, Telegram хабарламаларын тексеру.",
        },
        {
            "n": 3,
            "title": "Архитектура",
            "put": "Сызба: User -> Nginx -> Backend -> DB; Prometheus <- /metrics; Grafana <- Prometheus; Alerting -> Telegram.",
            "screens": "Скрин емес, блок-схема.",
            "s1": "Архитектура екі жобада да бірдей.",
            "s2": "Prometheus backend-тен метрика жинайды, Grafana визуализация жасайды, ал alerting бөлімі Telegram-ға Firing/Resolved жібереді.",
        },
        {
            "n": 4,
            "title": "Windows стенді (Fit AI)",
            "put": "ОС: Windows + Docker Desktop (WSL2). Сервистер: frontend/nginx, backend, postgres, prometheus, grafana, renderer, telegram-bot.",
            "screens": "1) Docker Desktop-та Up контейнерлер  2) docker compose ps.",
            "s1": "Fit AI жобасында барлық компоненттер Docker Compose арқылы көтерілді. Порт конфликттеріне байланысты Grafana 3001-де, Prometheus 9091-де іске қосылды.",
            "s2": "Қосымша түрде Telegram-бот командалары және панель скриншотын жіберу функциясы іске асырылды.",
        },
        {
            "n": 5,
            "title": "Ubuntu стенді (Volt Store)",
            "put": "Жоба: Volt Store (Next.js + Node.js backend). Nginx, Prometheus, Grafana, Telegram alerts, Docker Compose толық жұмыс істейді.",
            "screens": "Ubuntu терминалы: docker compose ps; қажет болса Grafana/Prometheus.",
            "s1": "",
            "s2": "Ubuntu-де осы стек нативті түрде жұмыс істеді. Порттар: сайт 80, Grafana 3001, Prometheus 9090, Alertmanager 9093.",
        },
        {
            "n": 6,
            "title": "Grafana метрикалары",
            "put": "Fit AI: RPS, route RPS, latency p50/p95, heap/CPU/RAM. Volt Store: CPU, RAM, диск, желі, контейнер метрикалары.",
            "screens": "Екі скринді бір слайдқа қатар орналастыру.",
            "s1": "Fit AI-де API өнімділігі мен жауап беру уақыты нақты көрінеді, бұл жүктемені талдауға мүмкіндік береді.",
            "s2": "Volt Store-де инфрақұрылымдық метрикалар кеңейтілген: жүйелік және контейнерлік ресурстар бөлек бақыланады.",
        },
        {
            "n": 7,
            "title": "Fit AI алерттері",
            "put": "Rule 1: Backend unreachable (up==0). Rule 2: API server 5xx errors.",
            "screens": "Grafana Alert rules + Telegram Firing/Resolved.",
            "s1": "Backend тоқтағанда алерт Pending-тен Firing-ке өтті, Telegram-ға хабарлама келді. Қайта қосылғаннан кейін Resolved келді.",
            "s2": "",
        },
        {
            "n": 8,
            "title": "Volt Store алерттері",
            "put": "NodeDown, HighCPU, HighMemory, LowDiskSpace, ContainerDown, ContainerHighMemory.",
            "screens": "alert.rules.yml үзіндісі + Telegram /alerts скрині.",
            "s1": "",
            "s2": "Бұл ережелер сервер мен контейнер жағдайын ерте анықтап, ақауға жедел жауап беруге мүмкіндік береді.",
        },
        {
            "n": 9,
            "title": "Telegram бот функционалы",
            "put": "Fit AI: /help /rps /routes /latency /heap /cpu /ram. Volt Store: /status /metrics /uptime /containers /alerts /screenshot /docker.",
            "screens": "Екі Telegram чат скрині: командалар + жауап.",
            "s1": "Fit AI ботында Grafana панельдерінің скриншотын командамен бірден алуға болады.",
            "s2": "Volt Store ботында диагностикалық командалар кең: сервер, контейнер, uptime және активті алерттер.",
        },
        {
            "n": 10,
            "title": "Windows vs Ubuntu салыстыру",
            "put": "Кесте (төменде дайын формат берілген).",
            "screens": "Кесте слайдтың негізгі бөлігі болады.",
            "s1": "Екі ортада да шешім іске асты, бірақ операциялық ерекшеліктер әртүрлі.",
            "s2": "Docker Compose осы айырмашылықтарды минимизациялап, ортақ іске қосу үлгісін берді.",
        },
        {
            "n": 11,
            "title": "Docker Compose рөлі",
            "put": "Бір файл -> толық стек. Бір команда -> толық іске қосу. Reproducibility және командалық жұмыс.",
            "screens": "docker-compose.yml services үзіндісі.",
            "s1": "Compose инфрақұрылымды код ретінде сақтап, екі ОС-та бірдей DevOps практикасын қамтамасыз етті.",
            "s2": "",
        },
        {
            "n": 12,
            "title": "Қорытынды",
            "put": "Екі ОС-та толық жұмыс істейтін мониторинг, алертинг, Telegram интеграциясы; Firing/Resolved дәлелденген.",
            "screens": "Финал коллаж: Grafana + Alert rules + Telegram + docker compose ps.",
            "s1": "Біз практикалық түрде кросс-платформалы мониторинг шешімін іске асырдық.",
            "s2": "Қорытынды: Docker Compose — әртүрлі ортада бірдей архитектураны тұрақты жүргізудің сенімді тәсілі.",
        },
    ]

    for s in slides:
        story.append(p(f"Слайд {s['n']}. {s['title']}", h1))
        story.append(p("<b>Слайдқа қою:</b> " + s["put"], body))
        story.append(p("<b>Скрин:</b> " + s["screens"], body))
        story.append(p("<b>Спикер 1 мәтіні:</b> " + (s["s1"] or "—"), body))
        story.append(p("<b>Спикер 2 мәтіні:</b> " + (s["s2"] or "—"), body))
        story.append(Spacer(1, 5))

    story.append(p("Слайд 10 үшін дайын салыстыру кестесі", h1))
    table_data = [
        ["Критерий", "Windows (Fit AI)", "Ubuntu (Volt Store)", "Қорытынды"],
        ["Docker орнату", "Docker Desktop + WSL2", "Нативті Docker Engine", "Ubuntu серверде жеңілірек"],
        ["Compose арқылы іске қосу", "docker compose -p fitai up -d", "docker compose up -d", "Логика екеуінде де бірдей"],
        ["Path/.env нюанстары", "Кейде сезімтал", "Тұрақтырақ", "Linux-та path мәселесі аз"],
        ["Порт/желі", "3000/9090 конфликт болды", "Стандартты порттар жиі бос", "Порт жоспарлау маңызды"],
        ["Қиындықтар", "WSL2, порт, env", "DNS, YAML отступ", "Мәселе түрі әртүрлі, шешімі бар"],
        ["Жиі баг", "Port bind conflict", "EAI_AGAIN", "Сетевой диагностика қажет"],
        ["Мониторинг нәтижесі", "Толық жұмыс істейді", "Толық жұмыс істейді", "Стек кросс-платформалы"],
        ["Telegram интеграция", "Firing/Resolved + panel screenshot", "/alerts, /metrics, /containers", "Екі жақта да өндірістік құндылығы жоғары"],
        ["Жалпы баға", "Dev/test үшін жақсы", "Prod үшін қолайлы", "Compose айырманы азайтады"],
    ]
    t = Table(table_data, colWidths=[38 * mm, 46 * mm, 50 * mm, 38 * mm])
    t.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Arial"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.7),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8EEF7")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFD")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(p("Демо реті (2-3 минут)", h1))
    demo_steps = [
        "1) docker compose ps (Windows стенд, кейін Ubuntu стенд).",
        "2) Grafana dashboard ашу.",
        "3) Alert rules көрсету.",
        "4) Backend stop -> Telegram Firing.",
        "5) Backend start -> Telegram Resolved.",
        "6) Telegram командалары: Fit AI (/rps немесе /cpu), Volt Store (/alerts немесе /metrics).",
    ]
    for d in demo_steps:
        story.append(p(d, small))

    story.append(Spacer(1, 6))
    story.append(p("Ескерту: презентацияға скриндерді айқын, оқылатын масштабта қойыңыз (әсіресе Alert state және Telegram мәтіні).", small))

    doc.build(story)


if __name__ == "__main__":
    out = r"c:\Users\User\Desktop\фитИИ\Готовый_скрипт_презентации_Windows_vs_Ubuntu.pdf"
    build_pdf(out)
    print(out)

