import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.AUDIT_OUT ?? ".screenshots";
const THEME = process.env.AUDIT_THEME ?? "light";
const AUTH = process.env.AUDIT_AUTH !== "0";
const ONLY = process.env.AUDIT_ROUTES?.split(",").filter(Boolean);

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const publicRoutes = [
  ["home", "/"],
  ["studios", "/studios"],
  ["how-it-works", "/how-it-works"],
  ["about", "/about"],
  ["login", "/login"],
  ["register", "/register"],
  ["forgot-password", "/forgot-password"],
  ["not-found", "/this-route-does-not-exist"],
];

const authRoutes = [
  ["dashboard", "/dashboard"],
  ["my-listings", "/my-listings"],
  ["my-bookings", "/my-bookings"],
  ["saved-studios", "/saved-studios"],
  ["add-studio", "/add-studio"],
];

async function getFirstStudioId() {
  const response = await fetch(`${BASE}/api/server/api/v1/studios?limit=1`);
  const payload = await response.json();
  return payload?.data?.[0]?.id ?? null;
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#login-email", "examiner@studiospace.com");
  await page.fill("#login-password", "Examiner123");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => !location.pathname.startsWith("/login"), null, {
    timeout: 20000,
  });
  await page.waitForTimeout(1200);
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const studioId = await getFirstStudioId();
  const routes = [...publicRoutes];
  if (AUTH) routes.push(...authRoutes);
  if (studioId) {
    routes.push(["studio-details", `/studios/${studioId}`]);
    routes.push(["studio-edit", `/studios/edit/${studioId}`]);
  }
  const selected = ONLY ? routes.filter(([name]) => ONLY.includes(name)) : routes;

  const browser = await chromium.launch();
  const consoleErrors = [];
  let overflow = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      colorScheme: THEME,
    });
    await context.addInitScript((theme) => {
      window.localStorage.setItem("studiospace-theme", theme);
    }, THEME);
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push({
          viewport: viewport.name,
          theme: THEME,
          text: message.text().slice(0, 500),
        });
      }
    });
    page.on("pageerror", (error) => {
      consoleErrors.push({
        viewport: viewport.name,
        theme: THEME,
        text: `PAGE ERROR: ${error.message}`.slice(0, 500),
      });
    });

    if (AUTH) {
      await login(page);
    }

    for (const [name, route] of selected) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 45000 });
        await page.waitForTimeout(900);
        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          title: document.title,
        }));
        if (metrics.scrollWidth > metrics.innerWidth + 1) {
          overflow.push({
            route,
            viewport: viewport.name,
            theme: THEME,
            scrollWidth: metrics.scrollWidth,
            innerWidth: metrics.innerWidth,
          });
        }
        const file = path.join(OUT, THEME, `${viewport.name}-${name}.png`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        await page.screenshot({ path: file, fullPage: true });
        console.log(`captured ${file}`);
      } catch (error) {
        console.log(`FAILED ${route} @ ${viewport.name}: ${error.message}`);
      }
    }

    await context.close();
  }

  fs.writeFileSync(path.join(OUT, `console-${THEME}.json`), JSON.stringify(consoleErrors, null, 2));
  fs.writeFileSync(path.join(OUT, `overflow-${THEME}.json`), JSON.stringify(overflow, null, 2));
  console.log(`console errors: ${consoleErrors.length}`);
  console.log(`overflow issues: ${overflow.length}`);
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
