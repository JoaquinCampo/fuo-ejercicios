/**
 * pnpm pdf:build
 * Genera un PDF por ficha en out/pdf/{slug}.pdf usando Playwright.
 * Requiere `next start` corriendo en http://localhost:3000 (concurrently lo hace).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fichas } from "../lib/content/fichas";

const BASE = process.env.PDF_BASE_URL ?? "http://localhost:3000";
const OUT = "out/pdf";

async function main() {
  mkdirSync(OUT, { recursive: true });

  const eligible = fichas.filter((f) => {
    const status: string = f.status;
    return status === "published" || status === "draft";
  });
  if (eligible.length === 0) {
    console.warn(`No fichas marked as published yet. Filter on lib/content/fichas.ts.`);
    return;
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ colorScheme: "light" });

  for (const ficha of eligible) {
    const page = await ctx.newPage();
    const url = `${BASE}/${ficha.slug}?print=1`;
    console.log(`→ ${url}`);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => !document.querySelector("[data-loading]"));
    await page.pdf({
      path: `${OUT}/${ficha.slug}.pdf`,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
      displayHeaderFooter: true,
      footerTemplate: `<div style="font-size:9px;width:100%;text-align:center;color:#888;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
      headerTemplate: `<div></div>`,
    });
    console.log(`  ✓ ${OUT}/${ficha.slug}.pdf`);
    await page.close();
  }

  await browser.close();
  console.log(`\nDone, ${eligible.length} PDFs en ${OUT}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
