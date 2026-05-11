const { chromium } = require("playwright");
const path = require("path");

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendOnce({ attempt }) {
  const phone = getArg("phone");
  const chatName = getArg("chatName");
  const message = Buffer.from(getArg("messageBase64"), "base64").toString("utf8");
  const noSend = process.argv.includes("--no-send");
  const startedAt = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = __dirname;
  const screenshotPath = (name) => path.join(outputDir, name);

  if (!phone && !chatName) throw new Error("Missing --phone or --chatName");
  if (!message) throw new Error("Missing --messageBase64");

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const userDataDir = "C:\\Users\\Kalyan Bandaru\\Documents\\Codex\\2026-05-05\\daily-ai-model-whatsapp-update\\whatsapp-chrome-profile";
  const encodedMessage = encodeURIComponent(message);
  const url = phone
    ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
    : "https://web.whatsapp.com/";

  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: chromePath,
    headless: false,
    viewport: null,
    args: ["--start-maximized"],
  });

  try {
    const page = context.pages()[0] || await context.newPage();
    page.setDefaultTimeout(30000);
    console.log(`WhatsApp send attempt ${attempt}.`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const qrCanvas = page.locator("canvas").first();

    if (chatName) {
      await page.waitForLoadState("domcontentloaded");
      const searchBox = page.locator(
        '[aria-label="Search input textbox"], [aria-label="Search or start a new chat"], div[contenteditable="true"][data-tab="3"]'
      ).first();

      const result = await Promise.race([
        searchBox.waitFor({ state: "visible", timeout: 90000 }).then(() => "ready"),
        qrCanvas.waitFor({ state: "visible", timeout: 90000 }).then(() => "qr"),
      ]).catch(() => "timeout");

      if (result === "qr") {
        await page.screenshot({ path: screenshotPath(`whatsapp-login-required-${startedAt}.png`), fullPage: true });
        throw new Error("WhatsApp QR login is required. Scan the QR code in the automation Chrome window, then run the script again.");
      }

      if (result !== "ready") {
        throw new Error("WhatsApp search did not become ready within 90 seconds.");
      }

      await searchBox.click();
      await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(500);
      await page.keyboard.type(chatName, { delay: 20 });

      let chat = page.locator(`span[title="${chatName}"]`).first();
      if (await chat.count() === 0) {
        chat = page.locator("span[title]").filter({ hasText: chatName }).first();
      }
      await chat.waitFor({ state: "visible", timeout: 30000 });
      await chat.click();

      const messageBox = page.locator(
        '[aria-label="Type a message"], [aria-placeholder="Type a message"], div[contenteditable="true"][data-tab="10"]'
      ).last();
      await messageBox.waitFor({ state: "visible", timeout: 30000 });
      await messageBox.click();
      await messageBox.fill(message);

      if (noSend) {
        console.log("Opened WhatsApp group with message ready. NoSend mode skipped sending.");
        return;
      }

      const groupSendButton = page.locator('button[aria-label="Send"], button:has(span[data-icon="send"])').last();
      await groupSendButton.waitFor({ state: "visible", timeout: 30000 });
      await groupSendButton.click();
      console.log(`Clicked WhatsApp send button for group: ${chatName}`);

      await page.waitForTimeout(5000);
      await page.screenshot({ path: screenshotPath(`whatsapp-sent-${chatName.replace(/[\\/:*?"<>|]/g, "_")}-${startedAt}.png`), fullPage: true })
        .catch((error) => console.log(`Sent, but confirmation screenshot failed: ${error.message}`));
      return;
    }

    const sendButton = page.locator('button[aria-label="Send"], button:has(span[data-icon="send"])').last();

    const result = await Promise.race([
      sendButton.waitFor({ state: "visible", timeout: 90000 }).then(() => "ready"),
      qrCanvas.waitFor({ state: "visible", timeout: 90000 }).then(() => "qr"),
    ]).catch(() => "timeout");

    if (result === "qr") {
      await page.screenshot({ path: screenshotPath(`whatsapp-login-required-${startedAt}.png`), fullPage: true });
      throw new Error("WhatsApp QR login is required. Scan the QR code in the automation Chrome window, then run the script again.");
    }

    if (result !== "ready") {
      throw new Error("WhatsApp did not become ready to send within 90 seconds.");
    }

    if (noSend) {
      console.log("Opened WhatsApp Web with message ready. NoSend mode skipped sending.");
      return;
    }

    await sendButton.click();
    console.log("Clicked WhatsApp send button.");

    await page.waitForTimeout(5000);
    await page.screenshot({ path: screenshotPath(`whatsapp-sent-phone-${startedAt}.png`), fullPage: true })
      .catch((error) => console.log(`Sent, but confirmation screenshot failed: ${error.message}`));
  } catch (error) {
    const page = context.pages()[0];
    if (page) {
      await page.screenshot({ path: screenshotPath(`whatsapp-error-${startedAt}.png`), fullPage: true }).catch(() => {});
    }
    throw error;
  } finally {
    await context.close();
  }
}

async function main() {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sendOnce({ attempt });
      return;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxAttempts) {
        await sleep(15000);
      }
    }
  }

  throw lastError;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
