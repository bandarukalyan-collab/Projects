from docx import Document
import sys

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def inline_md(paragraph):
    text = ''
    for run in paragraph.runs:
        t = run.text
        if not t:
            continue
        # treat Courier / Consolas-style fonts as inline code
        if run.font.name and any(m in run.font.name.lower() for m in ['courier', 'consolas', 'monospace']):
            t = f'`{t}`'
        elif run.bold and run.italic:
            t = f'***{t}***'
        elif run.bold:
            t = f'**{t}**'
        elif run.italic:
            t = f'*{t}*'
        text += t
    return text

def has_image(paragraph):
    return paragraph._element.find('.//w:drawing', NS) is not None

def convert(docx_path, md_path):
    doc = Document(docx_path)
    lines = []
    list_counter = 0
    list_started = False

    for child in doc.element.body:
        tag = child.tag
        if tag.endswith('}p'):
            from docx.text.paragraph import Paragraph
            p = Paragraph(child, doc)

            if p.text.strip() == '':
                if has_image(p):
                    lines.append('![RTR_GL_INT_009 Architecture](RTR_GL_INT_009_Architecture.png)')
                    lines.append('')
                continue

            style = p.style.name if p.style else 'Normal'
            md_text = inline_md(p)

            if style.startswith('Heading'):
                list_counter = 0
                list_started = False
                parts = style.split()
                level = parts[-1] if parts[-1].isdigit() else '2'
                lines.append('#' * int(level) + ' ' + md_text)
                lines.append('')
            elif 'List Number' in style:
                if not list_started:
                    list_counter = 0
                    list_started = True
                list_counter += 1
                lines.append(f'{list_counter}. {md_text}')
            elif 'List' in style:
                lines.append(f'- {md_text}')
            else:
                list_counter = 0
                list_started = False
                lines.append(md_text)
                lines.append('')

        elif tag.endswith('}tbl'):
            list_counter = 0
            list_started = False
            from docx.table import Table
            tbl = Table(child, doc)
            rows = []
            for r in tbl.rows:
                cells = []
                for cell in r.cells:
                    cell_text = ' '.join([p.text for p in cell.paragraphs]).strip()
                    cells.append(cell_text)
                rows.append(cells)

            if rows:
                n = len(rows[0])
                sep = '|' + '|'.join(['---'] * n) + '|'
                for i, row in enumerate(rows):
                    row_text = '| ' + ' | '.join(row) + ' |'
                    lines.append(row_text)
                    if i == 0:
                        lines.append(sep)
                lines.append('')

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print('Converted:', docx_path, '->', md_path)

if __name__ == '__main__':
    docx_path = sys.argv[1] if len(sys.argv) > 1 else 'RTR_GL_INT_009_Summary.docx'
    md_path = sys.argv[2] if len(sys.argv) > 2 else 'RTR_GL_INT_009_Summary.md'
    convert(docx_path, md_path)
