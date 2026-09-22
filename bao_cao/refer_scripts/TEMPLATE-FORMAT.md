# Format template của reference-bao-cao.docx

Ghi lại bằng lời định dạng (font, size, màu, căn lề) của các style trong
reference-bao-cao.docx, cập nhật ngày 2026-09-18.

## Nguyên tắc chung

- Toàn bộ văn bản dùng font **Times New Roman**, kể cả heading.
- Toàn bộ heading (Title, Subtitle, Heading 1 → Heading 9) đều màu **đen**.
- Riêng style **Hyperlink** vẫn giữ màu xanh mặc định.

## TOC Heading (tiêu đề "MỤC LỤC" do pandoc --toc sinh)

- Times New Roman, **đậm**, màu **đen**, căn **giữa**.
- Không đổi các dòng mục lục bên dưới (vẫn là style TOC 1/2/3 của Word).

## Title

- Times New Roman, **đậm**, size **16pt**, màu đen, căn giữa.

## Subtitle

- Times New Roman, đậm, size **14pt**, màu đen, căn giữa.

## Heading 1 - cấp "Chương" (VD: "Chương 2: Liệt kê và kiến trúc quy trình nghiệp vụ")

- Times New Roman, **đậm**, size **16pt**, màu đen.
- Căn **trái**.
- Tự động **hiển thị toàn bộ chữ hoa** (w:caps) - không cần gõ hoa sẵn
  trong markdown, Word/LibreOffice tự viết hoa khi hiển thị.

## Heading 2 → Heading 9 - mọi tiêu đề mục con (2., 2.1., 2.1.1., 2.1.1.1., ...)

- Đồng nhất một format duy nhất cho tất cả các cấp con:
  - Times New Roman, **đậm**, size **13pt** (bằng size chữ thường/Normal),
    màu đen.
  - Căn **trái**.
  - Chữ thường (không tự viết hoa) - phân biệt cấp bậc chỉ qua số thứ tự
    (2. / 2.1. / 2.1.1.) và độ thụt lề, không qua size/màu.

## Normal (thân bài)

- Times New Roman, 13pt, **canh đều hai bên (justify / w:jc=both)**,
  giãn dòng 1.5, cách đoạn 6pt sau mỗi đoạn.
- Áp dụng cho đoạn văn xuôi (Normal, Body Text, First Paragraph,
  Compact). Không áp dụng cho tiêu đề (Heading 1–9, Title, Subtitle),
  tiêu đề/dòng mục lục (TOC Heading, TOC 1–3), caption hình/bảng
  (canh giữa), hay bullet/list (canh trái).
- Markdown `*nghiêng*` và `**đậm**` bị gỡ khi convert (thân bài chữ
  thường). Tiêu đề vẫn đậm theo style Heading / Title / TOC Heading.
