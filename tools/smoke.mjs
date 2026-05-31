import { chromium } from "playwright";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const url = process.env.APP_URL || "http://127.0.0.1:5174";
const screenshot = (name) => fileURLToPath(new URL(`../work/${name}`, import.meta.url));
await fs.mkdir(new URL("../work/", import.meta.url), { recursive: true });

const paths = {
  home: screenshot("screenshot-1440.png"),
  calendar: screenshot("screenshot-calendar.png"),
  bundles: screenshot("screenshot-bundles.png"),
  fish: screenshot("screenshot-fish.png"),
  farm: screenshot("screenshot-farm.png"),
  villagers: screenshot("screenshot-villagers.png"),
  catalog: screenshot("screenshot-catalog.png"),
  recipes: screenshot("screenshot-recipes.png"),
  endgame: screenshot("screenshot-endgame.png"),
  perfection: screenshot("screenshot-perfection.png"),
  mobile: screenshot("screenshot-mobile.png"),
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 920 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (msg) => {
  if (["error", "warning"].includes(msg.type())) errors.push(`${msg.type()}: ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

async function clickTab(name) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(800);
}

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: paths.home, fullPage: false });

await clickTab("Календарь");
await page.screenshot({ path: paths.calendar, fullPage: false });
await clickTab("Центр");
await page.screenshot({ path: paths.bundles, fullPage: false });
await clickTab("Рыбалка");
await page.screenshot({ path: paths.fish, fullPage: false });
await clickTab("Ферма");
await page.screenshot({ path: paths.farm, fullPage: false });
await clickTab("Жители");
await page.screenshot({ path: paths.villagers, fullPage: false });
await clickTab("Каталог");
await page.screenshot({ path: paths.catalog, fullPage: false });
await clickTab("Рецепты");
await page.screenshot({ path: paths.recipes, fullPage: false });
await clickTab("Endgame");
await page.screenshot({ path: paths.endgame, fullPage: false });
await clickTab("Perfection");
await page.screenshot({ path: paths.perfection, fullPage: false });

await page.setViewportSize({ width: 390, height: 900 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: paths.mobile, fullPage: false });

const report = await page.evaluate(() => {
  const imgs = [...document.images].map((img) => ({
    src: img.getAttribute("src"),
    ok: img.complete && img.naturalWidth > 0,
    w: img.naturalWidth,
    h: img.naturalHeight,
  }));
  const broken = imgs.filter((img) => !img.ok);
  const possibleOverflow = [...document.querySelectorAll("button, .game-panel, .catalog-cell, .slot-card")]
    .filter((el) => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)
    .slice(0, 20)
    .map((el) => ({
      className: String(el.className),
      text: el.textContent?.trim().slice(0, 80),
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
    }));
  return {
    title: document.title,
    text: document.body.innerText.slice(0, 320),
    imageCount: imgs.length,
    broken,
    panels: document.querySelectorAll(".game-panel").length,
    pageOverflow: {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
    },
    possibleOverflow,
  };
});

await browser.close();
console.log(JSON.stringify({ url, screenshots: Object.values(paths), errors, report }, null, 2));
