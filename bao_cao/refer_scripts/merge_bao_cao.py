#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
merge_bao_cao.py
=================

Ghép các file markdown thành 1 file hoàn chỉnh duy nhất. Thứ tự trong
`FILES_IN_ORDER` + Lời cảm ơn (đồng bộ dàn ý `bao_cao/dan-y-bao-cao.md`):

    0. loi-cam-on.md                      - trang Lời cảm ơn (đứng trước
                                             danh mục trong .md; convert đặt
                                             lại đúng chỗ: sau phụ bìa, trước
                                             Mục lục, và bỏ trang cũ trong
                                             bia.docx để không bị trùng).
    1. "# DANH MỤC HÌNH ẢNH"              - tự sinh bởi script, không lấy từ
                                             file .md nào (xem build_report()).
                                             Trang bìa lấy từ refer_scripts/bia.docx,
                                             Mục lục do pandoc --toc tự sinh -
                                             cả 2 xử lý ở convert_to_docx.py.
    2. "# DANH MỤC BẢNG BIỂU"              - tự sinh, tương tự trên.
    3. 00-tom-tat.md                       - Tóm tắt đề tài (không phải
                                             "chương" - không có heading
                                             "# Chương N", nên ảnh/bảng ở đây
                                             không được đánh số Hình/Bảng).
    4. 01-chuong-1-thiet-ke-trien-khai.md
    5. 02-chuong-2-pham-vi-da-lam.md
    6. 03-chuong-3-ket-luan.md

Khác với báo cáo tham khảo mà script này được chuyển thể từ đó (báo cáo quy
trình nghiệp vụ, có sub-nhóm quy trình quản lý/cốt lõi/hỗ trợ ghép từ nhiều
file mỗi mục), báo cáo này đơn giản hơn: MỖI CHƯƠNG LÀ MỘT FILE DUY NHẤT, tự
chứa heading "# Chương N: ..." của chính nó — không cần hạ cấp heading
(shift) hay tự chèn số thứ tự mục con, chỉ cần đọc và nối theo thứ tự.

Script tự động:
  - Viết lại đường dẫn ảnh (`![...](...)`) tương đối theo vị trí file gốc,
    quy đổi lại cho đúng khi file merge nằm ở `ban-hoan-chinh/`.
  - LOẠI BỎ khối mã nguồn ```mermaid ... ``` khi ghép: ảnh SVG đã render
    đứng ngay sau khối đó (`![...](...)`) mới là nội dung hiển thị trong
    docx cuối, mermaid chỉ dùng để tái tạo lại ảnh khi cần sửa sơ đồ, không
    cần xuất hiện trong báo cáo hoàn chỉnh.
  - LOẠI BỎ nội dung còn là draft / chưa làm trước khi ghép, gồm:
      1. Sơ đồ ASCII nháp ("Sơ đồ chuỗi bước / Sơ đồ nháp (ASCII draft...)")
         cùng code block đi kèm.
      2. Ghi chú TODO dạng in nghiêng cuối dòng "*[cần ... cập nhật ...]*".
      3. Mọi dòng/ô bảng/mục chỉ chứa placeholder chưa điền — dạng "[...]"
         hoặc "Nhãn: [hướng dẫn cần điền]" — kể cả khi bọc trong **bold**.
         Nếu xoá hết khiến cả hàng bảng hoặc cả bảng hoặc cả heading trống
         hẳn thì heading/bảng đó cũng bị gỡ bỏ luôn.
      4. Dòng "*Cập nhật lần cuối: ...*" còn sót từ file nguồn.

Sau khi ghép xong, script còn tự động:
  - Đánh số lại caption của MỌI ảnh thật (bỏ qua ảnh trong code block /
    comment HTML / dòng ảnh placeholder bọc backtick) theo chương, dạng
    "Hình N.i. <tên ảnh>" (N = số chương lấy từ heading "# Chương N" gần
    nhất phía trên, i = số thứ tự ảnh trong chương đó). Chạy lại nhiều lần
    không bị đánh số trùng/lặp vì tiền tố "Hình X.Y. " (hoặc "Hình X.Y - "
    từ định dạng cũ) luôn bị bóc ra trước khi đánh số lại.
  - Tương tự cho tên bảng ("Bảng N.i. <tên bảng>").
  - Gắn bookmark {#fig-N-i} / {#tbl-N-i} vào từng ảnh/bảng đã đánh số.
  - Sinh lại nội dung mục "# DANH MỤC HÌNH ẢNH" / "# DANH MỤC BẢNG BIỂU":
    mỗi hình/bảng 1 dòng link nội bộ [Hình N.i. Tên](#fig-N-i) (nhảy tới vị
    trí khi Ctrl+click trong Word). scripts/convert_to_docx.py sẽ định dạng
    lại các dòng này sau khi pandoc convert xong thành kiểu "Table of
    Figures"/"Table of Tables" chuẩn của Word (tab-leader chấm + field
    PAGEREF hiện số trang thật, tự cập nhật khi bấm Update Field).

Chạy lại script này bất cứ khi nào nội dung trong `noi-dung/` hoặc
`loi-cam-on.md` thay đổi:

    python3 refer_scripts/merge_bao_cao.py

Kết quả: ban-hoan-chinh/Bao-cao-hoan-chinh.md
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Cấu hình đường dẫn
# ---------------------------------------------------------------------------

# Gốc = thư mục cha của thư mục chứa script này (script nằm ở refer_scripts/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
REPORT_DIR = PROJECT_ROOT / "noi-dung"
LOI_CAM_ON_FILE = PROJECT_ROOT / "loi-cam-on.md"
OUTPUT_DIR = PROJECT_ROOT / "ban-hoan-chinh"
OUTPUT_FILE = OUTPUT_DIR / "Bao-cao-hoan-chinh.md"
BLOCKQUOTE_LINE_RE = re.compile(r'^\s*>')

# Thứ tự ghép — đồng bộ với dàn ý rút gọn (5 mục) trong bao_cao/dan-y-bao-cao.md:
# Lời cảm ơn, Tóm tắt đề tài, rồi 3 "chương" đánh số (Thiết kế & triển khai,
# Phạm vi đã làm, Kết luận). Mỗi file chương tự chứa heading "# Chương N: ..."
# của chính nó - "00-tom-tat.md" KHÔNG có heading "# Chương N" (giữ như front
# matter, giống loi-cam-on.md, không được đánh số Hình/Bảng theo chương).
FILES_IN_ORDER = (
    "00-tom-tat.md",
    "01-chuong-1-thiet-ke-trien-khai.md",
    "02-chuong-2-pham-vi-da-lam.md",
    "03-chuong-3-ket-luan.md",
)

IMAGE_LINK_RE = re.compile(r'(!\[[^\]]*\]\()([^)]+)(\))')
FENCE_RE = re.compile(r'^\s*```')
HEADING_RE = re.compile(r'^(#{1,6})(\s+.*)$')

# Khối mã nguồn mermaid - loại bỏ toàn bộ khi ghép (xem _strip_mermaid_blocks).
MERMAID_FENCE_RE = re.compile(r'^\s*```mermaid\s*$')

# --- các mẫu nhận diện nội dung "draft / chưa làm" ---------------------------
ASCII_DRAFT_HEADING_RE = re.compile(r'^\*\*Sơ đồ[^*]*\(ASCII draft[^*]*\):?\*\*\s*$')
TODO_ANNOTATION_RE = re.compile(r'\s*[—\-]\s*\*\[[^\]]*\]\*\s*$')
# "[...]" hoặc "[bất kỳ hướng dẫn nào]" - toàn bộ nội dung chỉ là 1 cặp ngoặc vuông
# (cho phép có/không dấu gạch đầu dòng "- " hoặc "* " phía trước)
PLACEHOLDER_BRACKET_RE = re.compile(r'^(?:[-*]\s*)?\[[^\[\]]*\]$')
# "Nhãn: [...]" / "**Nhãn:** [...]" / "- **Nhãn:** [...]" - nhãn có giá trị nhưng
# giá trị chỉ là placeholder chưa điền
LABEL_PLACEHOLDER_RE = re.compile(
    r'^(?:[-*]\s*)?(?:\*{1,2}[^*\[\]]+:\*{1,2}|[^:\[\]]{1,60}:)\s*\*{0,2}\[[^\[\]]*\]\*{0,2}\s*$'
)
# "[1] [...]" / "[2] [...]" - mục tài liệu tham khảo chưa điền
REF_PLACEHOLDER_RE = re.compile(r'^\[\d+\]\s*\[[^\[\]]*\]')
TABLE_ROW_RE = re.compile(r'^\s*\|.*\|\s*$')
TABLE_SEP_RE = re.compile(r'^\s*\|?[\s:\-]+\|[\s:\-|]*\|?\s*$')
# Dòng tên bảng theo cú pháp table caption của pandoc (": <tên bảng>" ngay
# trước bảng, xem number_tables() phía dưới) - dùng để gỡ luôn caption khi
# bảng đi kèm bị xoá vì trống/toàn placeholder (_remove_empty_tables), tránh
# còn sót dòng tên bảng "mồ côi" không có bảng nào theo sau.
TABLE_CAPTION_LINE_RE = re.compile(r'^\s*:\s+\S.*$')
LAST_UPDATED_RE = re.compile(r'^\*Cập nhật lần cuối:\*\s*(.+)$')

STATS = {
    "mermaid_blocks": 0,
    "ascii_draft": 0,
    "todo_annotation": 0,
    "placeholder_lines": 0,
    "placeholder_rows": 0,
    "empty_tables": 0,
    "orphan_table_captions": 0,
    "empty_headings": 0,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def read_file(path: Path) -> str:
    if not path.exists():
        print(f"  [CẢNH BÁO] Không tìm thấy file: {path} -> bỏ qua (chương coi như chưa viết).",
              file=sys.stderr)
        return ""
    return path.read_text(encoding="utf-8")


def _strip_mermaid_blocks(lines: list) -> list:
    """Xoá toàn bộ khối ```mermaid ... ``` khi ghép báo cáo. Ảnh SVG đã
    render đứng ngay sau khối đó (`![...](...)`) mới là nội dung sẽ hiển
    thị trong docx cuối; giữ mermaid lại chỉ gây trùng lặp (vừa code, vừa
    ảnh) và code mermaid thô không render được trong Word."""
    out = []
    i, n = 0, len(lines)
    while i < n:
        if MERMAID_FENCE_RE.match(lines[i]):
            STATS["mermaid_blocks"] += 1
            i += 1
            while i < n and not FENCE_RE.match(lines[i]):
                i += 1
            if i < n:
                i += 1  # bỏ luôn dòng ``` đóng
            continue
        out.append(lines[i])
        i += 1
    return out


def _strip_ascii_draft_blocks(lines: list) -> list:
    """Xoá heading 'Sơ đồ ... (ASCII draft ...)' + code block ``` ``` đi kèm."""
    out = []
    i, n = 0, len(lines)
    while i < n:
        if ASCII_DRAFT_HEADING_RE.match(lines[i].strip()):
            STATS["ascii_draft"] += 1
            i += 1
            while i < n and lines[i].strip() == "":
                i += 1
            if i < n and FENCE_RE.match(lines[i]):
                i += 1
                while i < n and not FENCE_RE.match(lines[i]):
                    i += 1
                if i < n:
                    i += 1  # bỏ luôn dòng ``` đóng
            continue
        out.append(lines[i])
        i += 1
    return out


def _strip_todo_annotations(lines: list) -> list:
    out = []
    for line in lines:
        new_line, n_sub = TODO_ANNOTATION_RE.subn("", line)
        if n_sub:
            STATS["todo_annotation"] += n_sub
        out.append(new_line)
    return out


def _strip_placeholder_lines(lines: list) -> list:
    """Xoá các dòng chỉ chứa placeholder chưa điền (đứng riêng, không phải
    hàng trong bảng markdown)."""
    out = []
    for line in lines:
        s = line.strip()
        if (
            PLACEHOLDER_BRACKET_RE.match(s)
            or LABEL_PLACEHOLDER_RE.match(s)
            or REF_PLACEHOLDER_RE.match(s)
        ):
            STATS["placeholder_lines"] += 1
            continue
        out.append(line)
    return out


def _strip_placeholder_table_rows(lines: list) -> list:
    """Xoá hàng bảng mà TẤT CẢ ô chỉ là placeholder chưa điền hoặc trống."""
    out = []
    for line in lines:
        if TABLE_ROW_RE.match(line) and not TABLE_SEP_RE.match(line):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if cells and all(c == "" or PLACEHOLDER_BRACKET_RE.match(c) for c in cells):
                STATS["placeholder_rows"] += 1
                continue
        out.append(line)
    return out


def _strip_last_updated(lines: list) -> list:
    """Xoá dòng '*Cập nhật lần cuối: ...*' còn sót từ file nguồn (không cần
    đưa vào báo cáo hoàn chỉnh)."""
    out = []
    for line in lines:
        if LAST_UPDATED_RE.match(line.strip()):
            continue
        out.append(line)
    return out


def _remove_empty_tables(lines: list) -> list:
    """Nếu bảng (header + dòng phân cách) không còn hàng dữ liệu nào (đã bị
    xoá hết ở bước trước), xoá luôn cả header + dòng phân cách. Nếu bảng đó
    có dòng tên bảng (": <tên bảng>", xem number_tables()) ngay phía trên -
    cách 1 dòng trống - gỡ luôn dòng tên bảng, tránh còn sót tên bảng "mồ
    côi" không có bảng nào đi kèm khi mục chưa điền dữ liệu thật."""
    out = []
    i, n = 0, len(lines)
    while i < n:
        if (
            TABLE_ROW_RE.match(lines[i])
            and i + 1 < n
            and TABLE_SEP_RE.match(lines[i + 1])
        ):
            j = i + 2
            has_data = False
            while j < n and TABLE_ROW_RE.match(lines[j]):
                has_data = True
                j += 1
            if not has_data:
                STATS["empty_tables"] += 1
                if (
                    out
                    and out[-1].strip() == ""
                    and len(out) >= 2
                    and TABLE_CAPTION_LINE_RE.match(out[-2])
                ):
                    STATS["orphan_table_captions"] += 1
                    out.pop()  # dòng trống
                    out.pop()  # dòng tên bảng
                i = j
                continue
        out.append(lines[i])
        i += 1
    return out


def _remove_empty_heading_sections(lines: list) -> list:
    """Gỡ heading không còn nội dung thật nào bên dưới (sau khi các bước xoá
    placeholder ở trên đã dọn sạch). Xử lý từ heading cấp sâu nhất (######)
    lên cấp 1 để việc gỡ heading con rỗng có thể khiến heading cha cũng rỗng."""
    for level in range(6, 0, -1):
        result = []
        i, n = 0, len(lines)
        while i < n:
            m = HEADING_RE.match(lines[i])
            if m and len(m.group(1)) == level:
                j = i + 1
                while j < n:
                    m2 = HEADING_RE.match(lines[j])
                    if m2 and len(m2.group(1)) <= level:
                        break
                    j += 1
                body = lines[i + 1:j]
                if all(b.strip() == "" or re.match(r'^-{3,}$', b.strip()) for b in body):
                    STATS["empty_headings"] += 1
                    i = j
                    continue
                result.append(lines[i])
                i += 1
                continue
            result.append(lines[i])
            i += 1
        lines = result
    return lines


def clean_draft_content(content: str) -> str:
    """Chạy toàn bộ các bước loại bỏ nội dung draft / chưa làm trên 1 file."""
    lines = content.split("\n")
    lines = _strip_mermaid_blocks(lines)
    lines = _strip_ascii_draft_blocks(lines)
    lines = _strip_todo_annotations(lines)
    lines = _strip_placeholder_table_rows(lines)
    lines = _strip_placeholder_lines(lines)
    lines = _strip_last_updated(lines)
    lines = _remove_empty_tables(lines)
    lines = _remove_empty_heading_sections(lines)
    return "\n".join(lines)


def rewrite_image_paths(content: str, source_dir: Path) -> str:
    """Quy đổi đường dẫn ảnh trong `content` (đang tham chiếu tương đối theo
    `source_dir`) thành đường dẫn tương đối theo OUTPUT_DIR.

    Bỏ qua các dòng mà toàn bộ markdown ảnh bị bọc trong backtick đơn
    (dùng làm placeholder mô tả, không phải ảnh sẽ render thật)."""
    import os

    out_lines = []
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("`") and stripped.endswith("`") and len(stripped) > 1:
            out_lines.append(line)
            continue

        def repl(m: "re.Match[str]") -> str:
            path = m.group(2)
            if path.startswith(("http://", "https://", "data:")):
                return m.group(0)
            abs_path = (source_dir / path).resolve()
            try:
                rel_path = os.path.relpath(abs_path, OUTPUT_DIR.resolve())
            except ValueError:
                rel_path = path  # khác ổ đĩa (Windows) - giữ nguyên, hiếm gặp
            return f"{m.group(1)}{rel_path}{m.group(3)}"

        out_lines.append(IMAGE_LINK_RE.sub(repl, line))
    return "\n".join(out_lines)


def process_file(path: Path) -> str:
    content = read_file(path)
    if not content:
        return ""
    content = content.strip("\n")
    content = clean_draft_content(content)
    content = rewrite_image_paths(content, path.parent)
    return content


def load_loi_cam_on() -> str:
    """Đọc bao_cao/loi-cam-on.md, bỏ dòng blockquote hướng dẫn nháp (>) -
    chỉ giữ heading + nội dung lời cảm ơn đưa vào báo cáo."""
    content = read_file(LOI_CAM_ON_FILE)
    if not content:
        return ""
    lines = [ln for ln in content.splitlines() if not BLOCKQUOTE_LINE_RE.match(ln)]
    # Gộp dòng trống thừa sau khi bỏ blockquote
    text = re.sub(r'\n{3,}', '\n\n', "\n".join(lines)).strip()
    return text


# ---------------------------------------------------------------------------
# Đánh số hình theo chương (Hình N.i), gắn bookmark {#fig-N-i} + tạo lại
# bảng "DANH MỤC HÌNH ẢNH" (link nhảy tới ảnh + field PAGEREF cho số
# trang). Chạy trên toàn bộ report ĐÃ GHÉP, vì ranh giới "chương" chỉ xác
# định rõ ở mức file đã ghép, không xác định được nếu xử lý riêng từng file
# trong noi-dung/.
# ---------------------------------------------------------------------------

_MASK_CHAR = "\x00"

CHAPTER_HEADING_RE = re.compile(r'^#\s+Chương\s+(\d+)\b', re.MULTILINE)
# Alt text + đường dẫn + (tuỳ chọn) bookmark {#fig-N-i} đã gắn từ lần chạy
# trước - luôn bị thay bằng số/bookmark mới nên chạy lại nhiều lần không
# bị lệch nếu ảnh trong noi-dung/ được thêm/xoá/sắp xếp lại.
IMAGE_FIGURE_RE = re.compile(
    r'!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)(?:\{#fig-\d+-\d+\})?'
)
# Bóc tiền tố "Hình X.Y: " (định dạng hiện tại, theo mẫu báo cáo chính
# thức), "Hình X.Y. " (định dạng cũ trước khi đổi dấu chấm -> hai chấm),
# hoặc "Hình X.Y - " (định dạng cũ hơn nữa) khỏi caption gốc trước khi
# đánh số lại, để chạy lại script nhiều lần không bị lặp tiền tố.
OLD_FIGURE_PREFIX_RE = re.compile(r'^Hình\s+\d+\.\d+[.:]?\s*-?\s*')
DANH_MUC_HINH_ANH_RE = re.compile(
    r'(^# DANH MỤC HÌNH ẢNH\s*\n)(.*?)(?=\n---\s*\n|\n# |\Z)',
    re.MULTILINE | re.DOTALL,
)


def _mask_non_figure_regions(text: str) -> str:
    """Che các vùng không phải ảnh thật (code block, comment HTML, inline
    code / dòng ảnh placeholder bọc backtick) trước khi quét ảnh, giữ
    nguyên độ dài để offset khớp với text gốc (cùng kỹ thuật `_mask` ở
    scripts/convert_to_docx.py, dùng khi quét ảnh SVG)."""
    def repl(m: "re.Match[str]") -> str:
        return _MASK_CHAR * (m.end() - m.start())

    masked = text
    masked = re.sub(r'```.*?```', repl, masked, flags=re.DOTALL)
    masked = re.sub(r'<!--.*?-->', repl, masked, flags=re.DOTALL)
    masked = re.sub(r'`[^`\n]*`', repl, masked)
    return masked


def number_figures(report: str) -> "tuple[str, list[dict]]":
    """Quét toàn bộ report đã ghép theo đúng thứ tự xuất hiện: theo dõi số
    chương qua heading '# Chương N', đánh số lại caption từng ảnh thật
    thành 'Hình N.i. <tên ảnh>' (bỏ qua ảnh trong code block / comment
    HTML / dòng bọc backtick), và gắn bookmark {#fig-N-i} vào ảnh để mục
    DANH MỤC HÌNH ẢNH link/PAGEREF được tới đúng vị trí.

    Trả về (report đã đánh số lại, danh sách hình theo thứ tự xuất hiện)."""
    masked = _mask_non_figure_regions(report)

    events = []
    for m in CHAPTER_HEADING_RE.finditer(masked):
        events.append((m.start(), "chapter", int(m.group(1))))
    for m in IMAGE_FIGURE_RE.finditer(masked):
        events.append((m.start(), "image", m))
    events.sort(key=lambda e: e[0])

    current_chapter = None
    counters: "dict[int, int]" = {}
    figures = []
    replacements = []  # (start, end, new_text)

    for _, kind, data in events:
        if kind == "chapter":
            current_chapter = data
            counters.setdefault(current_chapter, 0)
            continue
        m = data
        if current_chapter is None:
            # Ảnh xuất hiện trước chương đầu tiên (trang bìa, mục lục, tóm
            # tắt, danh mục từ viết tắt...) - không thuộc chương nào nên
            # không đánh số.
            continue
        counters[current_chapter] += 1
        idx = counters[current_chapter]
        anchor = f"fig-{current_chapter}-{idx}"
        label = f"Hình {current_chapter}.{idx}:"
        # Lấy caption/path từ `report` GỐC (chưa mask) theo đúng offset của
        # match trên bản mask - offset khớp nhau vì mask giữ nguyên độ dài,
        # nhưng dùng trực tiếp m.group(1)/m.group(2) (lấy từ bản mask) sẽ làm
        # hỏng caption chứa inline code (backtick), vì vùng đó đã bị thay
        # bằng ký tự mask null trước khi quét.
        raw_caption = report[m.start(1):m.end(1)].strip()
        caption = OLD_FIGURE_PREFIX_RE.sub("", raw_caption).strip()
        new_alt = f"{label} {caption}" if caption else label
        path = report[m.start(2):m.end(2)]
        new_text = f"![{new_alt}]({path}){{#{anchor}}}"
        replacements.append((m.start(), m.end(), new_text))
        figures.append({"label": label, "caption": caption or "(chưa có tên)", "anchor": anchor})

    new_report = report
    for start, end, new_text in sorted(replacements, key=lambda r: r[0], reverse=True):
        new_report = new_report[:start] + new_text + new_report[end:]

    return new_report, figures


# Dòng tên bảng theo cú pháp table caption của pandoc (extension
# `table_captions`, bật sẵn theo mặc định trong "markdown"): 1 đoạn văn chỉ
# chứa ": <tên bảng>" ngay trước (hoặc sau) 1 bảng markdown, cách nhau đúng
# 1 dòng trống, được pandoc dựng thành 1 bảng có caption thật (paragraph
# riêng, style "TableCaption" trong .docx) thay vì bảng không tên. Bóc tiền
# tố "Bảng X.Y: " (định dạng hiện tại, theo mẫu báo cáo chính thức) hoặc
# "Bảng X.Y. " (định dạng cũ) nếu có, từ lần chạy trước, trước khi đánh số
# lại.
#
# Lưu ý: pandoc KHÔNG nhận `{#id}` trên dòng caption bảng (khác với ảnh
# `![](){#id}` hay heading) - chuỗi đó thành text thật trong caption và
# không sinh bookmark Word. Vì vậy id bảng được gắn bằng empty span
# `[]{#tbl-N-i}` ngay TRƯỚC dòng caption; pandoc tạo bookmark đúng tên đó
# để hyperlink/PAGEREF trong DANH MỤC BẢNG BIỂU nhảy/hiện số trang được.
TABLE_CAPTION_RE = re.compile(r'^([ \t]*):[ \t]+(.+?)[ \t]*$', re.MULTILINE)
OLD_TABLE_PREFIX_RE = re.compile(r'^Bảng\s+\d+\.\d+[.:]?\s*-?\s*')
OLD_TABLE_ANCHOR_RE = re.compile(r'\s*\{#tbl-\d+-\d+\}\s*$')
# Empty-span anchor đã chèn từ lần chạy trước - gỡ trước khi đánh số lại
# để chạy nhiều lần không bị chồng `[]{#tbl-...}`.
OLD_TABLE_SPAN_RE = re.compile(
    r'^[ \t]*\[\]\{#tbl-\d+-\d+\}\s*\n(?:[ \t]*\n)?',
    re.MULTILINE,
)


def number_tables(report: str) -> "tuple[str, list[dict]]":
    """Quét toàn bộ report đã ghép theo đúng thứ tự xuất hiện: theo dõi số
    chương qua heading '# Chương N' (cùng cơ chế với number_figures()),
    đánh số lại từng dòng tên bảng thành 'Bảng N.i. <tên bảng>' theo chương
    - nhất quán với cách đánh số 'Hình N.i.' cho ảnh - và gắn empty span
    `[]{#tbl-N-i}` ngay trước caption để mục DANH MỤC BẢNG BIỂU
    link/PAGEREF được tới đúng bảng (pandoc tạo bookmark Word từ empty
    span; `{#id}` trên dòng `: caption` không được pandoc hiểu là attribute).

    Trả về (report đã đánh số lại, danh sách bảng theo thứ tự xuất hiện)."""
    report = OLD_TABLE_SPAN_RE.sub("", report)
    masked = _mask_non_figure_regions(report)

    events = []
    for m in CHAPTER_HEADING_RE.finditer(masked):
        events.append((m.start(), "chapter", int(m.group(1))))
    for m in TABLE_CAPTION_RE.finditer(masked):
        events.append((m.start(), "table", m))
    events.sort(key=lambda e: e[0])

    current_chapter = None
    counters: "dict[int, int]" = {}
    tables = []
    replacements = []  # (start, end, new_text)

    for _, kind, data in events:
        if kind == "chapter":
            current_chapter = data
            counters.setdefault(current_chapter, 0)
            continue
        m = data
        if current_chapter is None:
            continue
        counters[current_chapter] += 1
        idx = counters[current_chapter]
        anchor = f"tbl-{current_chapter}-{idx}"
        label = f"Bảng {current_chapter}.{idx}:"
        # Như number_figures(): lấy indent/caption từ `report` GỐC theo đúng
        # offset của match trên bản mask, để không làm hỏng caption chứa
        # inline code (backtick) - xem chú thích ở number_figures().
        indent = report[m.start(1):m.end(1)]
        raw_caption = OLD_TABLE_ANCHOR_RE.sub("", report[m.start(2):m.end(2)].strip())
        caption = OLD_TABLE_PREFIX_RE.sub("", raw_caption).strip()
        caption_line = (
            f"{indent}: {label} {caption}" if caption else f"{indent}: {label}"
        )
        # Empty span trước caption - pandoc -> bookmark; không gắn {#id} vào
        # dòng ": ..." vì pandoc sẽ giữ nguyên thành text trong caption.
        new_text = f"{indent}[]{{#{anchor}}}\n\n{caption_line}"
        replacements.append((m.start(), m.end(), new_text))
        tables.append({"label": label, "caption": caption or "(chưa có tên)", "anchor": anchor})

    new_report = report
    for start, end, new_text in sorted(replacements, key=lambda r: r[0], reverse=True):
        new_report = new_report[:start] + new_text + new_report[end:]

    return new_report, tables


DANH_MUC_BANG_BIEU_RE = re.compile(
    r'(^# DANH MỤC BẢNG BIỂU\s*\n)(.*?)(?=\n---\s*\n|\n# |\Z)',
    re.MULTILINE | re.DOTALL,
)


def build_list_entries(items: "list[dict]", empty_placeholder: str) -> str:
    """Tạo lại nội dung 1 mục "danh mục" (DANH MỤC HÌNH ẢNH / DANH MỤC BẢNG
    BIỂU): mỗi item là 1 dòng link nội bộ riêng [Nhãn Tên](#anchor) (mỗi
    dòng cách nhau 1 dòng trống để pandoc tạo thành 1 đoạn văn riêng, chỉ
    chứa đúng 1 hyperlink - xem scripts/convert_to_docx.py:format_figure_list,
    hàm này tìm đúng các đoạn văn dạng này để thêm tab-leader chấm + field
    PAGEREF, dựng thành kiểu "Table of Figures"/"Table of Tables" chuẩn
    của Word)."""
    if not items:
        entries = [f"*({empty_placeholder})*"]
    else:
        entries = [
            f"[{(item['label'] + ' ' + item['caption']).strip()}](#{item['anchor']})"
            for item in items
        ]
    return "\n\n" + "\n\n".join(entries) + "\n"


def rebuild_list_section(report: str, heading_re: "re.Pattern[str]", heading_name: str,
                          items: "list[dict]", empty_placeholder: str) -> str:
    """Thay nội dung cũ (nếu có) trong mục `heading_name` bằng danh sách link
    tự sinh từ `items`."""
    new_body = build_list_entries(items, empty_placeholder)

    def repl(m: "re.Match[str]") -> str:
        return m.group(1) + new_body

    new_report, n_sub = heading_re.subn(repl, report, count=1)
    if n_sub == 0:
        print(f"  [CẢNH BÁO] Không tìm thấy mục '# {heading_name}' để cập nhật.",
              file=sys.stderr)
    return new_report


# ---------------------------------------------------------------------------
# Thứ tự ghép nội dung (xem FILES_IN_ORDER ở đầu file)
# ---------------------------------------------------------------------------

def build_report() -> str:
    from datetime import date

    sections = []

    # Trang bìa lấy từ refer_scripts/bia.docx (convert_to_docx.py:
    # prepend_cover()). MỤC LỤC do pandoc --toc sinh. Lời cảm ơn lấy từ
    # loi-cam-on.md: ghép vào .md trước danh mục; convert đặt lại đúng chỗ
    # (sau phụ bìa, trước Mục lục) và gỡ trang Lời cảm ơn cũ trong bia.docx.
    #
    # "# DANH MỤC HÌNH ẢNH" / "# DANH MỤC BẢNG BIỂU" tự sinh tại đây (không
    # lấy từ file .md) - nội dung thật do rebuild_list_section() điền sau
    # number_figures()/number_tables().
    loi_cam_on = load_loi_cam_on()
    if loi_cam_on:
        sections.append(loi_cam_on)

    sections.append(
        "# DANH MỤC HÌNH ẢNH\n\n"
        "*(Tự động sinh bởi refer_scripts/merge_bao_cao.py khi ghép báo cáo)*"
    )
    sections.append(
        "# DANH MỤC BẢNG BIỂU\n\n"
        "*(Tự động sinh bởi refer_scripts/merge_bao_cao.py khi ghép báo cáo)*"
    )

    for filename in FILES_IN_ORDER:
        sections.append(process_file(REPORT_DIR / filename))

    sections = [s for s in sections if s.strip()]

    header = (
        f"<!-- File này được sinh tự động bởi refer_scripts/merge_bao_cao.py "
        f"vào ngày {date.today().isoformat()}. KHÔNG chỉnh sửa trực tiếp file này "
        f"- hãy sửa nội dung trong noi-dung/ hoặc loi-cam-on.md rồi chạy lại script. -->\n"
    )
    report = header + "\n\n---\n\n".join(sections) + "\n"
    # gọn lại khoảng trắng: sau khi xoá nội dung draft có thể để lại nhiều
    # dòng trống liên tiếp -> tối đa 1 dòng trống giữa các đoạn
    report = re.sub(r'\n{3,}', '\n\n', report)
    return report


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report = build_report()
    report, figures = number_figures(report)
    report, tables = number_tables(report)
    report = rebuild_list_section(report, DANH_MUC_HINH_ANH_RE, "DANH MỤC HÌNH ẢNH",
                                   figures, "chưa có hình nào")
    report = rebuild_list_section(report, DANH_MUC_BANG_BIEU_RE, "DANH MỤC BẢNG BIỂU",
                                   tables, "chưa có bảng nào")
    # gọn lại khoảng trắng sau khi chèn 2 mục danh mục mới.
    report = re.sub(r'\n{3,}', '\n\n', report)
    OUTPUT_FILE.write_text(report, encoding="utf-8")
    n_words = len(report.split())
    n_lines = report.count("\n")
    print(f"Đã ghép báo cáo -> {OUTPUT_FILE}")
    print(f"  ({n_lines} dòng, ~{n_words} từ)")
    print(f"  - Đã đánh số {len(figures)} hình theo chương, cập nhật mục DANH MỤC HÌNH ẢNH.")
    print(f"  - Đã đánh số {len(tables)} bảng theo chương, cập nhật mục DANH MỤC BẢNG BIỂU.")
    print(f"  - Đã bỏ {STATS['mermaid_blocks']} khối mermaid nguồn (giữ lại ảnh SVG đã render).")
    if LOI_CAM_ON_FILE.is_file():
        print(f"  - Đã ghép Lời cảm ơn từ {LOI_CAM_ON_FILE.name}.")
    else:
        print(f"  [!] Không thấy {LOI_CAM_ON_FILE.name}, bỏ qua trang Lời cảm ơn.",
              file=sys.stderr)
    print("Đã loại bỏ nội dung draft / chưa làm:")
    print(f"  - Sơ đồ ASCII nháp:                 {STATS['ascii_draft']}")
    print(f"  - Ghi chú TODO *[...]* cuối dòng:    {STATS['todo_annotation']}")
    print(f"  - Dòng placeholder chưa điền:        {STATS['placeholder_lines']}")
    print(f"  - Hàng bảng placeholder chưa điền:   {STATS['placeholder_rows']}")
    print(f"  - Bảng trống bị gỡ luôn:             {STATS['empty_tables']}")
    print(f"  - Tên bảng 'mồ côi' bị gỡ theo (bảng đi kèm trống): {STATS['orphan_table_captions']}")
    print(f"  - Heading rỗng bị gỡ luôn:           {STATS['empty_headings']}")


if __name__ == "__main__":
    main()
