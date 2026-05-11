const { chromium } = require("playwright");

async function main() {
  const context = await chromium.launchPersistentContext(
    "C:\\Users\\Kalyan Bandaru\\Documents\\Codex\\2026-05-05\\hi\\whatsapp-chrome-profile",
    {
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: false,
      viewport: null,
      args: ["--start-maximized"],
    }
  );

  const page = context.pages()[0] || await context.newPage();
  await page.goto("https://web.whatsapp.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(15000);

  const selectors = [
    'canvas',
    '[aria-label="Search input textbox"]',
    '[aria-label="Search or start a new chat"]',
    'div[contenteditable="true"]',
    'span[title="Tech. Info"]',
    '[data-testid="chat-list-search"]',
  ];

  for (const selector of selectors) {
    console.log(`${selector}: ${await page.locator(selector).count()}`);
  }

  console.log(`title: ${await page.title()}`);
  await page.screenshot({ path: "whatsapp-debug.png", fullPage: true });
  await context.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
