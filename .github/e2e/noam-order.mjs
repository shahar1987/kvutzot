// one-off end-to-end check: real phone-sized browser, live site, real tap on the order button
import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7'] });
const page = await ctx.newPage();
const seen = { form: null, formStatus: null, wa: null };
page.on('request', r => { if (r.url().includes('/formResponse')) seen.form = r.postData(); });
page.on('response', r => { if (r.url().includes('/formResponse')) seen.formStatus = r.status(); });
ctx.on('page', p => { seen.wa = p.url(); p.on('framenavigated', f => { if (f === p.mainFrame()) seen.wa = f.url(); }); });
await page.goto('https://shahar1987.github.io/kvutzot/noam/?t=' + Date.now(), { waitUntil: 'networkidle' });
// stop on each cake screen like a person would, then tap its +
for (const i of [0, 2]) {
  await page.evaluate(i => scrollTo(0, document.querySelectorAll('.field')[i].offsetTop), i);
  await page.waitForTimeout(600);
  await page.locator('.qty .add').nth(i).tap();
}
await page.locator('.order').scrollIntoViewIfNeeded();
await page.fill('#fn', 'בדיקה');
await page.fill('#ln', 'אוטומטית');
await page.fill('#ph', '0500000001');
await page.fill('#ct', 'בדיקה');
await page.fill('#tm', '11:00');
await page.fill('#nt', 'הזמנת בדיקה של המערכת, לא לאפות');
await page.check('#ag');
await page.locator('#cta').tap();
await page.waitForTimeout(5000);
console.log('FORM_BODY', decodeURIComponent((seen.form || '').replace(/\+/g, ' ')));
console.log('FORM_STATUS', seen.formStatus);
console.log('WA_URL', decodeURIComponent(seen.wa || ''));
await b.close();
