const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFLUENCE_URL = process.argv[2] || 'https://confluence.dell.com/spaces/EISB/pages/165260779/RTR+LOOKUP+LOGIC';
const OUTPUT_DIR = path.join(__dirname, 'confluence-output');

function compactText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext('./chrome-user-data', {
    headless: false,
    channel: 'chrome',
    viewport: null,
    args: ['--start-maximized'],
  });

  const page = context.pages()[0] || await context.newPage();
  page.setDefaultTimeout(30000);

  console.log(`Opening Confluence page: ${CONFLUENCE_URL}`);
  await page.goto(CONFLUENCE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(5000);

  const title = await page.title().catch(() => '');
  const url = page.url();
  const bodyText = await page.locator('body').innerText({ timeout: 15000 }).catch(() => '');
  const text = compactText(bodyText);
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a'))
    .map((anchor) => ({
      text: (anchor.innerText || anchor.textContent || '').replace(/\s+/g, ' ').trim(),
      href: anchor.href,
    }))
    .filter((link) => link.text && link.href)
    .slice(0, 40));

  const screenshotPath = path.join(OUTPUT_DIR, 'confluence-page.png');
  const textPath = path.join(OUTPUT_DIR, 'confluence-page.txt');
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  fs.writeFileSync(textPath, bodyText, 'utf8');

  console.log(JSON.stringify({
    title,
    url,
    textLength: bodyText.length,
    firstText: text.slice(0, 800),
    links,
    screenshotPath,
    textPath,
  }, null, 2));

  await context.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
