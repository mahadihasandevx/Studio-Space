import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/studios", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
const info = await page.evaluate(() => {
  const el = document.elementFromPoint(150, 830);
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const keys = ["position","top","bottom","left","right","width","height","display","writingMode","whiteSpace","fontSize","lineHeight","letterSpacing","fontWeight","padding","gridArea","alignSelf","justifySelf","alignItems","justifyItems","placeSelf","contain","aspectRatio","inset","insetBlock","insetInline","minHeight","minWidth","maxHeight","maxWidth","translate","rotate","scale"];
  const out = {};
  for (const k of keys) out[k] = cs[k] ?? cs.getPropertyValue(k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`));
  return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, text: el.textContent, parent: el.parentElement.className, out };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
