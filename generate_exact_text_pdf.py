from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def register_fonts():
    pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def md_line_to_html(line: str) -> str:
    s = escape_html(line)
    # Keep markdown emphasis visible but readable in PDF.
    s = s.replace("**", "")
    return s


def generate(input_md: str, output_pdf: str):
    register_fonts()
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Arial-Bold",
        fontSize=14,
        leading=18,
        spaceBefore=8,
        spaceAfter=4,
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Arial-Bold",
        fontSize=12,
        leading=16,
        spaceBefore=6,
        spaceAfter=3,
    )
    h3 = ParagraphStyle(
        "H3",
        parent=styles["Heading3"],
        fontName="Arial-Bold",
        fontSize=11,
        leading=14,
        spaceBefore=5,
        spaceAfter=2,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Arial",
        fontSize=10.5,
        leading=14,
        spaceAfter=2,
    )

    story = []
    with open(input_md, "r", encoding="utf-8") as f:
        for raw in f.readlines():
            line = raw.rstrip("\n")
            if not line.strip():
                story.append(Spacer(1, 3))
                continue
            text = md_line_to_html(line)
            if line.startswith("# "):
                story.append(Paragraph(text[2:], h1))
            elif line.startswith("## "):
                story.append(Paragraph(text[3:], h2))
            elif line.startswith("### "):
                story.append(Paragraph(text[4:], h3))
            else:
                story.append(Paragraph(text, body))

    doc.build(story)


if __name__ == "__main__":
    generate(
        r"c:\Users\User\Desktop\фитИИ\presentation_full_text_exact.md",
        r"c:\Users\User\Desktop\фитИИ\Готовый_скрипт_презентации_ПОЛНЫЙ_точный.pdf",
    )
    print(r"c:\Users\User\Desktop\фитИИ\Готовый_скрипт_презентации_ПОЛНЫЙ_точный.pdf")

