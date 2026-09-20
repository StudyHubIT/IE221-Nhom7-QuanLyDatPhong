#!/usr/bin/env node
/**
 * Screenshot each HTML slide at 16:9 and stitch a landscape PDF.
 * Keeps the on-screen (dark) look. Does not use @media print.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(SKILL_DIR, "../../..");
const SLIDES_URL_PATH = "/slides/index.html";

const WIDTH = 1920;
const HEIGHT = 1080;
const PDF_W = 13.333 * 72;
const PDF_H = 7.5 * 72;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function parseArgs(argv) {
  const out = { out: path.join(REPO_ROOT, "slides", "IE221-Nhom7-QuanLyDatPhong.pdf") };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out" && argv[i + 1]) {
      out.out = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return out;
}

function startServer(root) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const filePath = path.normalize(path.join(root, rel));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404).end("Not found");
        return;
      }
      const ctype = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      const size = stat.size;
      const range = req.headers.range;
      if (range && range.startsWith("bytes=")) {
        const spec = range.slice(6).split(",")[0].trim();
        const [a, b] = spec.split("-");
        let start = a === "" ? Math.max(size - Number(b), 0) : Number(a);
        let end = b ? Number(b) : size - 1;
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size || end < start) {
          res.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
          return;
        }
        end = Math.min(end, size - 1);
        res.writeHead(206, {
          "Content-Type": ctype,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
      res.writeHead(200, {
        "Content-Type": ctype,
        "Accept-Ranges": "bytes",
        "Content-Length": String(size),
      });
      fs.createReadStream(filePath).pipe(res);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function waitForSlideReady(page, index1) {
  await page.waitForFunction(
    (n) => {
      const slides = [...document.querySelectorAll(".slide")];
      const slide = slides[n - 1];
      return Boolean(slide?.classList.contains("active"));
    },
    index1,
    { timeout: 10_000 },
  );

  await page.evaluate(async () => {
    await document.fonts.ready;
    const slide = document.querySelector(".slide.active");
    if (!slide) return;
    const imgs = [...slide.querySelectorAll("img")];
    await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
    const videos = [...slide.querySelectorAll("video")];
    await Promise.all(
      videos.map(
        (video) =>
          new Promise((resolve) => {
            video.controls = false;
            video.pause();
            const finish = () => {
              try {
                video.currentTime = 0;
              } catch {
                /* ignore */
              }
              resolve();
            };
            if (video.readyState >= 2) {
              finish();
              return;
            }
            video.addEventListener("loadeddata", finish, { once: true });
            video.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 8000);
          }),
      ),
    );
  });
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function main() {
  const { out } = parseArgs(process.argv.slice(2));
  const deck = path.join(REPO_ROOT, "slides", "index.html");
  if (!fs.existsSync(deck)) {
    console.error(`Missing ${deck}`);
    process.exit(1);
  }

  const { server, port } = await startServer(REPO_ROOT);
  const url = `http://127.0.0.1:${port}${SLIDES_URL_PATH}`;
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 2,
    });
    await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    const count = await page.locator(".slide").count();
    if (count < 1) throw new Error("No .slide elements found");

    const pdf = await PDFDocument.create();
    for (let i = 1; i <= count; i += 1) {
      await page.evaluate((n) => {
        location.hash = String(n);
      }, i);
      await waitForSlideReady(page, i);
      await new Promise((r) => setTimeout(r, 250));
      const png = await page.screenshot({ type: "png", fullPage: false, animations: "disabled" });
      const image = await pdf.embedPng(png);
      const pdfPage = pdf.addPage([PDF_W, PDF_H]);
      pdfPage.drawImage(image, { x: 0, y: 0, width: PDF_W, height: PDF_H });
      process.stderr.write(`  slide ${i}/${count}\n`);
    }

    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, await pdf.save());
    process.stdout.write(`${out}\n${count} pages\n`);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  if (String(err?.message || err).includes("playwright") || err?.code === "ERR_MODULE_NOT_FOUND") {
    console.error(`Install deps: cd ${SKILL_DIR} && npm install && npx playwright install chromium`);
  }
  process.exit(1);
});
