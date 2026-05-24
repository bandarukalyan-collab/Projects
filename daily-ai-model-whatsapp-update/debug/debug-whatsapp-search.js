const { chromium } = require("playwright");

const query = process.argv.slice(2).join(" ") || "Keep Learning";

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

  const searchBox = page.locator(
    '[aria-label="Search input textbox"], [aria-label="Search or start a new chat"], div[contenteditable="true"][data-tab="3"]'
  ).first();
  await searchBox.waitFor({ state: "visible", timeout: 90000 });
  await searchBox.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(query, { delay: 20 });
  await page.waitForTimeout(5000);

  const titles = await page.locator("span[title]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("title")).filter(Boolean)
  );

  console.log(`Search query: ${query}`);
  console.log(titles.join("\n"));
  await page.screenshot({ path: "whatsapp-search-debug.png", fullPage: true });
  await context.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
