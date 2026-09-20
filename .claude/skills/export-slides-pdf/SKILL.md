---
name: export-slides-pdf
description: Use when the user asks to export, xuất, in, convert, or save the HTML slide deck (slides/index.html) as a PDF — including "xuất PDF", "export slides", "in thành PDF", "html slides to pdf", or a PDF copy of the presentation.
---

# Export HTML slides to PDF

The deck in `slides/index.html` is a single-viewport show (`position: absolute`,
one `.slide.active`). Browser Print / `@media print` flattens it to a **white
handout** and is the wrong export. Capture each on-screen slide (dark theme,
landscape 16:9) and stitch a PDF.

## 1. Run the exporter — do not print

From the repo root:

```bash
cd .claude/skills/export-slides-pdf
npm install
npx playwright install chromium
node scripts/export.mjs
```

Optional output path:

```bash
node scripts/export.mjs --out slides/deck.pdf
```

Default output: `slides/IE221-Nhom7-QuanLyDatPhong.pdf`.

The script serves the repo, opens Chromium at 1920×1080, sets `#1`…`#N`, waits
for fonts/images (and the first video frame), screenshots, then writes a
13.333″×7.5″ landscape PDF.

## 2. Confirm before calling it done

- Script printed `N pages` matching `.slide` count in `slides/index.html`
- File exists and is non-empty
- Open page 1 and a video slide (7–9): dark background, not the print stylesheet

Report the absolute path and page count. Videos become a still frame (PDF has
no playback).

## Common mistakes

| Excuse | Reality |
|--------|---------|
| Cmd+P / Print to PDF | Uses `@media print` (white, not WYSIWYG) |
| `page.pdf()` on the live deck | Only the active slide is `display:flex`; others are hidden |
| `wkhtmltopdf` / HTML-to-PDF libs | Miss the JS deck and Google Fonts |
| Skip `npm install` | `playwright` / `pdf-lib` live in this skill folder, not the monorepo |
