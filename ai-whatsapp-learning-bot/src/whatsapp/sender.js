const path = require("path");
const { chromium } = require("playwright");
const config = require("../config");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageMarkers(message) {
  return message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 12)
    .slice(0, 5);
}

async function waitForOutgoingMessageToSync(page, message) {
  const markers = messageMarkers(message);

  await page.waitForFunction(
    (expectedMarkers) => {
      const visibleText = document.body.innerText;
      return expectedMarkers.every((marker) => visibleText.includes(marker));
    },
    markers,
    { timeout: 30000 }
  );

  // WhatsApp obfuscates message bubble classes, so allow its client time to queue
  // the message after verifying the sent text is visible in the open chat.
  await page.waitForTimeout(5000);
}

async function waitForWhatsAppReady({ page, readyLocator, qrCanvas, screenshotPath, startedAt }) {
  const firstResult = await Promise.race([
    readyLocator.waitFor({ state: "visible", timeout: 90000 }).then(() => "ready"),
    qrCanvas.waitFor({ state: "visible", timeout: 90000 }).then(() => "qr"),
  ]).catch(() => "timeout");

  if (firstResult === "ready") return;

  if (firstResult === "qr") {
    await page.screenshot({ path: screenshotPath(`whatsapp-login-required-${startedAt}.png`), fullPage: true });
    console.log("WhatsApp QR login detected. Waiting up to 4 minutes for login to complete...");
    await readyLocator.waitFor({ state: "visible", timeout: 240000 });
    console.log("WhatsApp login completed.");
    return;
  }

  throw new Error("WhatsApp did not become ready within 90 seconds.");
}

async function sendToChat({ chatName, message, noSend = false, attempt = 1 }) {
  const startedAt = new Date().toISOString().replace(/[:.]/g, "-");
  const screenshotPath = (name) => path.join(config.rootDir, name);

  const context = await chromium.launchPersistentContext(config.whatsappChromeProfile, {
    executablePath: config.chromePath,
    headless: false,
    viewport: null,
    args: ["--start-maximized"],
  });

  try {
    const page = context.pages()[0] || await context.newPage();
    page.setDefaultTimeout(30000);
    console.log(`WhatsApp send attempt ${attempt} for chat: ${chatName}`);
    await page.goto("https://web.whatsapp.com/", { waitUntil: "domcontentloaded" });

    const qrCanvas = page.locator("canvas").first();
    const searchBox = page.locator(
      '[aria-label="Search input textbox"], [aria-label="Search or start a new chat"], div[contenteditable="true"][data-tab="3"]'
    ).first();

    await waitForWhatsAppReady({ page, readyLocator: searchBox, qrCanvas, screenshotPath, startedAt });

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
      console.log("No-send mode: message is ready but was not sent.");
      return;
    }

    const sendButton = page.locator('button[aria-label="Send"], button:has(span[data-icon="send"])').last();
    await sendButton.waitFor({ state: "visible", timeout: 30000 });
    await sendButton.click();
    await waitForOutgoingMessageToSync(page, message);
    await page.screenshot({ path: screenshotPath(`whatsapp-sent-${chatName}-${startedAt}.png`), fullPage: true });
    console.log(`WhatsApp confirmed outgoing message for chat: ${chatName}`);
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

async function sendWhatsAppMessage({ chatNames = config.whatsappChatNames, message, noSend = false }) {
  if (!chatNames.length) throw new Error("No WhatsApp chat names configured.");
  if (!message) throw new Error("Cannot send an empty WhatsApp message.");

  for (const chatName of chatNames) {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await sendToChat({ chatName, message, noSend, attempt });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed for ${chatName}: ${error.message}`);
        if (attempt < 3) await sleep(15000);
      }
    }

    if (lastError) throw lastError;
  }
}

module.exports = {
  sendWhatsAppMessage,
};

