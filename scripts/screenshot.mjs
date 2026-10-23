import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const target = process.argv[2] ?? "/setup";
const slug = process.argv[3] ?? "page";
const sizes = [
  ["1440", 1440, 1000],
  ["1024", 1024, 900],
  ["390", 390, 844],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [name, width, height] of sizes) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.goto(`${base}${target}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: `/tmp/docket-shots/${slug}-${name}.png`,
    fullPage: width >= 1000,
  });
  await page.close();
}
await browser.close();
console.log("screenshots ready");
