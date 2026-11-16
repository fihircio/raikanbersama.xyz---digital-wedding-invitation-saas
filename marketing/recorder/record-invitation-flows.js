const { chromium, devices } = require('playwright-core');
const fs = require('fs');

const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent };
const VIDEO = { dir: '/tmp/rec/raw9', size: { width: 390, height: 844 } };
const SLUG = 'sample-pakej-kayangan';
const HOLD_MS = 4000;

const wheel = async (page, distance, ms) => {
  await page.mouse.move(195, 480);
  const steps = Math.max(10, Math.round(ms / 50));
  for (let i = 0; i < steps; i += 1) { await page.mouse.wheel(0, distance / steps); await page.waitForTimeout(ms / steps); }
};

const tapText = (page, re) => page.evaluate((src) => {
  const rx = new RegExp(src, 'i');
  const b = [...document.querySelectorAll('button')].find(x => rx.test((x.textContent || '').trim()));
  if (!b) return false;
  b.click();
  return true;
}, re.source);

const waitText = async (page, re, timeout = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await page.evaluate((s) => new RegExp(s, 'i').test(document.body.innerText), re.source)) return true;
    await page.waitForTimeout(250);
  }
  return false;
};

// wait for images (map tiles, QR) to finish loading
const settle = async (page) => {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => {
    const imgs = [...document.images].filter(i => !i.complete);
    await Promise.all(imgs.map(i => new Promise(r => { i.onload = r; i.onerror = r; setTimeout(r, 4000); })));
  });
  await page.waitForTimeout(1500); // modal fade/opacity settle
};

const openInvite = async (page) => {
  await page.goto(`https://www.raikanbersama.xyz/#/i/${SLUG}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2400);
  await tapText(page, /^Buka$/);
  await page.waitForTimeout(2600);
};

const flows = {
  async elite_hadiah(page) {
    await openInvite(page);
    await wheel(page, 1000, 1800);
    await page.waitForTimeout(800);
    if (!(await tapText(page, /^Hadiah$/))) throw new Error('no Hadiah button');
    if (!(await waitText(page, /maybank/i))) throw new Error('modal not open');
    await settle(page);
    await page.waitForTimeout(HOLD_MS);           // hold on the full QR
    await wheel(page, 330, 1500);                 // then reveal the wishlist
    await page.waitForTimeout(2200);
  },
  async elite_lokasi(page) {
    await openInvite(page);
    await wheel(page, 1000, 1800);
    await page.waitForTimeout(800);
    if (!(await tapText(page, /^Lokasi$/))) throw new Error('no Lokasi button');
    if (!(await waitText(page, /waze|google/i))) throw new Error('map modal not open');
    await settle(page);
    await page.waitForTimeout(2500); // extra time for map tiles
    await page.waitForTimeout(HOLD_MS);
  },
  async rsvp_flow(page) {
    await openInvite(page);
    await wheel(page, 360, 1600);
    await page.waitForTimeout(900);
    if (!(await tapText(page, /sahkan kehadiran/i))) throw new Error('no RSVP button');
    if (!(await waitText(page, /hadir|nama/i))) throw new Error('rsvp not open');
    await settle(page);
    await page.waitForTimeout(HOLD_MS);
  },
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const [name, run] of Object.entries(flows).filter(([n]) => (process.env.ONLY ? n === process.env.ONLY : true))) {
    const ctx = await browser.newContext({ ...MOBILE, recordVideo: VIDEO });
    const page = await ctx.newPage();
    try {
      await run(page);
      const v = page.video();
      await page.close(); await ctx.close();
      const p = await v.path();
      fs.writeFileSync(`/tmp/rec/raw9/${name}.map`, p);
      const dur = require('child_process').execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${p}"`).toString().trim();
      fs.writeFileSync(`/tmp/rec/raw9/${name}.dur`, dur);
      console.log(`OK ${name} dur=${dur}s`);
    } catch (e) {
      console.log(`FAIL ${name}: ${e.message.slice(0, 90)}`);
      await ctx.close();
    }
  }
  await browser.close();
})();
