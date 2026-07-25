const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DELL_URL = 'https://b2bpvisibility.dell.com/dataquality/xclient/dell/';
const CHROME_DEBUG_URL = process.env.CHROME_DEBUG_URL || 'http://localhost:9222';
const TARGET_DOCUMENT_TITLE = 'XML-LABEL DATA ATTACHMENT-V3-ODM';
const DEBUG_SCREENSHOTS = process.env.DEBUG_SCREENSHOTS === '1';

async function timed(label, action) {
  const startedAt = Date.now();
  try {
    return await action();
  } finally {
    console.log(`${label} took ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
  }
}

async function saveDebugScreenshot(page, filename) {
  if (!DEBUG_SCREENSHOTS) return;
  await page.screenshot({ path: filename, fullPage: true }).catch(() => {});
}

async function loginIfNeeded(page, username, password) {
  const main = await waitForLoginOrPortalShell(page);

  const usernameField = main.locator('input[name="username"]');
  if (!(await usernameField.isVisible().catch(() => false))) return;

  console.log('Login page detected');
  await usernameField.fill(username);
  await main.locator('input[name="password-display"]').fill(password);
  await main.locator('input[name="loginButton"]').click();
  await waitForPortalShell(page);
}

async function waitForMainFrame(page, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const main = page.frame('main');
    if (main) return main;
    await page.waitForTimeout(250);
  }

  throw new Error('Main frame not found.');
}

async function waitForPortalShell(page, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const main = await waitForMainFrame(page, 5000);
    const hamburgerVisible = await main.locator('img#lhsNavBar-deco').isVisible().catch(() => false);
    if (hamburgerVisible) return main;
    await page.waitForTimeout(500);
  }

  throw new Error('Portal shell did not load.');
}

async function waitForLoginOrPortalShell(page, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const main = await waitForMainFrame(page, 5000);
    const loginVisible = await main.locator('input[name="username"]').isVisible().catch(() => false);
    const shellVisible = await main.locator('img#lhsNavBar-deco').isVisible().catch(() => false);
    if (loginVisible || shellVisible) return main;
    await page.waitForTimeout(500);
  }

  throw new Error('Neither login form nor portal shell loaded.');
}

async function clickVisibleTextInLeftMenu(frame, text) {
  const matches = await frame.locator(`text=${text}`).elementHandles();

  for (const match of matches) {
    const box = await match.boundingBox();
    const visible = await match.isVisible();
    const actualText = ((await match.textContent()) || '').trim();

    if (visible && box && box.x < 520 && actualText === text) {
      await frame.page().mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      return true;
    }
  }

  return false;
}

async function clickVisibleText(frame, text) {
  const matches = await frame.locator(`text=${text}`).elementHandles();

  for (const match of matches) {
    const box = await match.boundingBox();
    const visible = await match.isVisible();
    const actualText = ((await match.textContent()) || '').trim();

    if (visible && box && actualText === text) {
      await match.click({ force: true });
      return true;
    }
  }

  return false;
}

async function hasVisibleTextInLeftMenu(frame, text) {
  const matches = await frame.locator(`text=${text}`).elementHandles();

  for (const match of matches) {
    const box = await match.boundingBox();
    const visible = await match.isVisible();
    const actualText = ((await match.textContent()) || '').trim();

    if (visible && box && box.x < 520 && actualText === text) {
      return true;
    }
  }

  return false;
}

async function ensureLeftMenuOpen(frame) {
  if (await hasVisibleTextInLeftMenu(frame, 'Community') && await hasVisibleTextInLeftMenu(frame, 'Activities')) {
    console.log('Left menu is already open.');
    return;
  }

  console.log('Clicking top-left hamburger menu...');
  await frame.locator('img#lhsNavBar-deco').click({ force: true });
  await frame.waitForFunction(() => {
    const normalized = (value) => value.replace(/\s+/g, ' ').trim();
    return Array.from(document.querySelectorAll('body *')).some((element) => {
      const box = element.getBoundingClientRect();
      return normalized(element.textContent || '') === 'Documents' &&
        box.width > 0 &&
        box.height > 0 &&
        box.left < 520;
    });
  });
}

async function selectOptionContainingText(frame, targetText) {
  const normalizedTarget = normalizeSearchText(targetText);
  const selects = await frame.locator('select').elementHandles();

  for (const select of selects) {
    const options = await select.evaluate((element) => {
      return Array.from(element.options).map((option) => ({
        text: option.textContent || '',
        value: option.value,
      }));
    });
    const match = options.find((option) => normalizeSearchText(option.text).includes(normalizedTarget));

    if (match) {
      await select.selectOption({ value: match.value });
      return true;
    }
  }

  return false;
}

async function fillKeywordInput(frame, value) {
  const keywordBox = await frame.evaluate(() => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const ownText = (element) => Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || '')
      .join(' ');
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const labels = Array.from(document.querySelectorAll('label, div, span, td'))
      .filter(isVisible)
      .map((element) => ({
        element,
        text: normalized(ownText(element) || element.textContent || ''),
        box: element.getBoundingClientRect(),
      }))
      .filter(({ box }) => box.left < 390);

    const keywordLabel = labels.find(({ text }) => text === 'keyword(s)');
    if (!keywordLabel) return null;

    const nextLabel = labels
      .filter(({ box }) => box.top > keywordLabel.box.bottom + 2)
      .sort((left, right) => left.box.top - right.box.top)[0];
    const lowerBound = nextLabel ? nextLabel.box.top : keywordLabel.box.bottom + 90;

    const fields = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea'))
      .filter(isVisible)
      .map((element) => ({ element, box: element.getBoundingClientRect() }))
      .filter(({ box }) => {
        return box.left < 390 &&
          box.top >= keywordLabel.box.bottom - 4 &&
          box.top < lowerBound &&
          box.height > 10;
      })
      .sort((left, right) => {
        const leftDistance = Math.abs(left.box.top - keywordLabel.box.bottom);
        const rightDistance = Math.abs(right.box.top - keywordLabel.box.bottom);
        return leftDistance - rightDistance;
      });

    const field = fields[0];
    if (!field) return null;

    return {
      x: field.box.left + field.box.width / 2,
      y: field.box.top + field.box.height / 2,
    };
  });

  if (!keywordBox) return false;

  await frame.page().mouse.click(keywordBox.x, keywordBox.y);
  await frame.page().keyboard.press('Control+A');
  await frame.page().keyboard.press('Backspace');
  await frame.page().keyboard.type(value);
  await frame.page().keyboard.press('Tab');

  const actualValue = await frame.evaluate(() => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const ownText = (element) => Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || '')
      .join(' ');
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const labels = Array.from(document.querySelectorAll('label, div, span, td'))
      .filter(isVisible)
      .map((element) => ({
        text: normalized(ownText(element) || element.textContent || ''),
        box: element.getBoundingClientRect(),
      }))
      .filter(({ box }) => box.left < 390);

    const keywordLabel = labels.find(({ text }) => text === 'keyword(s)');
    if (!keywordLabel) return '';

    const nextLabel = labels
      .filter(({ box }) => box.top > keywordLabel.box.bottom + 2)
      .sort((left, right) => left.box.top - right.box.top)[0];
    const lowerBound = nextLabel ? nextLabel.box.top : keywordLabel.box.bottom + 90;

    const fields = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea'))
      .filter(isVisible)
      .map((element) => ({ element, box: element.getBoundingClientRect() }))
      .filter(({ box }) => {
        return box.left < 390 &&
          box.top >= keywordLabel.box.bottom - 4 &&
          box.top < lowerBound &&
          box.height > 10;
      })
      .sort((left, right) => {
        const leftDistance = Math.abs(left.box.top - keywordLabel.box.bottom);
        const rightDistance = Math.abs(right.box.top - keywordLabel.box.bottom);
        return leftDistance - rightDistance;
      });

    return fields[0]?.element.value || '';
  });

  return actualValue === value;
}

async function clickVisibleApply(frame) {
  const applyControl = await frame.evaluateHandle(() => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const candidates = Array.from(document.querySelectorAll('button, input, a, div'))
      .filter(isVisible)
      .map((element) => ({
        element,
        box: element.getBoundingClientRect(),
        text: normalized(element.textContent || ''),
        value: normalized(element.getAttribute('value') || ''),
      }));

    return candidates.find(({ box, text, value }) => {
      return box.x < 220 && box.y > 600 && (text === 'apply' || value === 'apply');
    })?.element || null;
  });

  const element = applyControl.asElement();
  if (!element) return false;

  await element.click({ force: true });
  return true;
}

async function doubleClickResultRow(frame, targetText, matchIndex = 0) {
  const cell = await frame.evaluateHandle((text) => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const ownText = (element) => Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || '')
      .join(' ');
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const target = normalized(text);
    const matches = Array.from(document.querySelectorAll('td, div, span, a'))
      .filter(isVisible)
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          element,
          box,
          area: box.width * box.height,
          ownText: normalized(ownText(element)),
          text: normalized(element.textContent || ''),
        };
      })
      .filter(({ box }) => box.left > 350 && box.top > 200)
      .filter(({ ownText, text }) => ownText === target || text === target)
      .sort((left, right) => left.area - right.area);

    return matches;
  }, targetText);

  const cells = await cell.evaluateHandle((matches, index) => matches[index]?.element || null, matchIndex);

  const element = cells.asElement();
  if (!element) return false;

  await element.dblclick({ force: true });
  return true;
}

async function clickDocumentSearchTab(frame) {
  return clickVisibleText(frame, 'Document Search') || clickVisibleText(frame, 'Document Sear...');
}

async function openResultDocument(context, page, frame, targetText, keyword) {
  for (let matchIndex = 0; matchIndex < 10; matchIndex += 1) {
    const popupPromise = context.waitForEvent('page', { timeout: 2500 }).catch(() => null);
    const clicked = await doubleClickResultRow(frame, targetText, matchIndex);
    if (!clicked && matchIndex === 0) throw new Error(`Could not find result row containing "${targetText}".`);
    if (!clicked) break;

    const popup = await Promise.race([
      popupPromise,
      page.waitForTimeout(800).then(() => null),
    ]);
    const detailPage = popup || page;
    await detailPage.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await detailPage.bringToFront().catch(() => {});
    await saveDebugScreenshot(detailPage, '09-document-detail.png');
    return detailPage;
  }

  throw new Error(`Could not find "${targetText}" detail containing keyword ${keyword}.`);
}

async function getAllFrameText(page) {
  const frameTexts = [];

  for (const frame of page.frames()) {
    const text = await frame.locator('body').innerText().catch(() => '');
    if (text) frameTexts.push(text);
  }

  return frameTexts.join('\n');
}

async function clickToolbarDownload(frame) {
  const downloadControl = await frame.evaluateHandle(() => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const candidates = Array.from(document.querySelectorAll('button, input, a, div, span'))
      .filter(isVisible)
      .map((element) => ({
        element,
        text: normalized(element.textContent || element.getAttribute('value') || element.getAttribute('title') || ''),
        box: element.getBoundingClientRect(),
      }));

    const download = candidates
      .filter(({ text, box }) => text === 'download' && box.top < 260)
      .sort((left, right) => left.box.top - right.box.top)[0] ||
      candidates.find(({ text }) => text === 'download');

    return download?.element || null;
  });

  const element = downloadControl.asElement();
  if (!element) return false;

  const box = await element.boundingBox();
  if (box) {
    await frame.page().mouse.click(box.x + 100, box.y + box.height / 2);
  } else {
    await element.click({ force: true });
  }
  return true;
}

async function clickDownloadMenuOption(frame) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 2000) {
    const option = await frame.evaluateHandle(() => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const candidates = Array.from(document.querySelectorAll('button, input, a, div, span, li'))
      .filter(isVisible)
      .map((element) => ({
        element,
        text: normalized(element.textContent || element.getAttribute('value') || element.getAttribute('title') || ''),
        box: element.getBoundingClientRect(),
      }))
      .filter(({ box }) => box.top > 150);

    const preferred = candidates.find(({ text }) => text === 'document contents') ||
      candidates.find(({ text }) => text.includes('document contents'));

    return preferred?.element || null;
    });

    const element = option.asElement();
    if (element) {
      await element.click({ force: true });
      return true;
    }

    await frame.page().waitForTimeout(100);
  }

  return false;
}

async function downloadDocumentContents(page) {
  const downloadsDir = path.join(os.homedir(), 'Downloads');
  fs.mkdirSync(downloadsDir, { recursive: true });
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    for (const frame of page.frames()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
      const clicked = await clickToolbarDownload(frame);
      if (!clicked) continue;

      let download = await Promise.race([
        downloadPromise,
        page.waitForTimeout(250).then(() => null),
      ]);
      if (!download) {
        await saveDebugScreenshot(page, '10-download-menu.png');

        const optionClicked = await clickDownloadMenuOption(frame);
        if (!optionClicked) continue;
        download = await downloadPromise;
      }

      if (!download) continue;

      const targetPath = getUniqueDownloadsPath(downloadsDir, download.suggestedFilename());
      await download.saveAs(targetPath);
      return targetPath;
    }

    await page.waitForTimeout(250);
  }

  throw new Error('Could not find a visible Download control in Document Contents.');
}

async function waitForDocumentSearchLoaded(frame) {
  await frame.locator('text=Loading...').waitFor({ state: 'hidden', timeout: 45000 }).catch(() => {
    console.log('Document Search was still showing a loader after 45 seconds.');
  });
}

async function waitForSearchRefresh(frame, previousBodyText) {
  await frame.waitForFunction(() => {
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const hasVisibleLoadingMask = Array.from(document.querySelectorAll('.x-mask, .x-mask-msg, .x-mask-loading, [class*="loading"], [class*="mask"]'))
      .some(isVisible);
    return hasVisibleLoadingMask;
  }, null, { timeout: 1500 }).catch(() => {});

  await frame.waitForFunction((previousText) => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const hasVisibleLoadingMask = Array.from(document.querySelectorAll('.x-mask, .x-mask-msg, .x-mask-loading, [class*="loading"], [class*="mask"]'))
      .some(isVisible);
    if (hasVisibleLoadingMask) return false;

    return normalized(document.body.innerText || '') !== previousText;
  }, normalizeText(previousBodyText), { timeout: 25000, polling: 250 }).catch(() => {});
}

async function waitForSearchResults(frame, targetText) {
  const startedAt = Date.now();
  await frame.waitForFunction((text) => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;
    };

    const visibleText = normalized(document.body.innerText || '');
    const target = normalized(text);
    const hasTargetRow = visibleText.includes(target);

    const hasVisibleLoadingMask = Array.from(document.querySelectorAll('.x-mask, .x-mask-msg, .x-mask-loading, [class*="loading"], [class*="mask"]'))
      .some(isVisible);
    if (hasVisibleLoadingMask) return false;
    return hasTargetRow;
  }, targetText, { timeout: 15000, polling: 200 }).catch(async () => {
    await frame.waitForFunction((elapsedMs) => {
      const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
      return elapsedMs > 10000 && normalized(document.body.innerText || '').includes('no search documents were found');
    }, Date.now() - startedAt, { timeout: 1000 }).catch(() => {});
  });

  const pageText = normalizeText(await frame.locator('body').innerText());
  return pageText.includes(normalizeText(targetText));
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeSearchText(value) {
  return value.replace(/[^a-z0-9]+/gi, '').toLowerCase();
}

function readKeywords() {
  const keywordsPath = path.join(__dirname, 'keywords.txt');
  if (!fs.existsSync(keywordsPath)) return ['1338845545'];

  const keywords = fs.readFileSync(keywordsPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return keywords.length ? keywords : ['1338845545'];
}

function sanitizeFilename(value) {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'download';
}

function getUniqueDownloadsPath(downloadsDir, suggestedFilename) {
  const parsed = path.parse(sanitizeFilename(suggestedFilename || 'document-download'));
  let candidate = path.join(downloadsDir, `${parsed.name}${parsed.ext}`);
  let index = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(downloadsDir, `${parsed.name}-${index}${parsed.ext}`);
    index += 1;
  }

  return candidate;
}

async function navigateToDocumentSearch(page) {
  const main = page.frame('main');
  if (!main) throw new Error('Main frame not found.');

  await ensureLeftMenuOpen(main);
  await page.waitForTimeout(500);

  console.log('Clicking Documents in the left menu...');
  const documentsClicked = await clickVisibleTextInLeftMenu(main, 'Documents');
  if (!documentsClicked) throw new Error('Could not find visible Documents item in left menu.');

  await page.waitForTimeout(500);

  console.log('Opening left menu again from Documents dashboard...');
  await main.locator('img#lhsNavBar-deco').click({ force: true });
  await page.waitForTimeout(500);

  console.log('Clicking Documents again to expand submenu...');
  const documentsSubmenuClicked = await clickVisibleTextInLeftMenu(main, 'Documents');
  if (!documentsSubmenuClicked) throw new Error('Could not click Documents before opening Document Search submenu.');

  await page.waitForTimeout(500);

  console.log('Clicking Document Search submenu item...');
  let documentSearchClicked = await clickVisibleTextInLeftMenu(main, 'Document Search');
  if (!documentSearchClicked) documentSearchClicked = await clickVisibleTextInLeftMenu(main, 'Documents Search');
  if (!documentSearchClicked) {
    throw new Error('Could not find visible Document Search submenu in left menu.');
  }

  await waitForDocumentSearchLoaded(main);
  await page.waitForTimeout(750);
  console.log('Finished navigation to Document Search.');
  console.log('Current URL:', page.url());

  return main;
}

async function returnToDocumentSearchTab(page) {
  const main = page.frame('main');
  if (!main) throw new Error('Main frame not found.');

  const tabPoint = await main.evaluate(() => {
    const normalized = (source) => source.replace(/\s+/g, ' ').trim().toLowerCase();
    const candidates = Array.from(document.querySelectorAll('div, span, a'))
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          element,
          text: normalized(element.textContent || ''),
          box,
        };
      })
      .filter(({ text, box }) => {
        return text.includes('document sear') &&
          box.top < 170 &&
          box.left > 100 &&
          box.width > 40 &&
          box.height > 10;
      })
      .sort((left, right) => left.box.left - right.box.left);

    const tab = candidates[0]?.element;
    if (!tab) return null;

    const box = tab.getBoundingClientRect();
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
    };
  });

  if (!tabPoint) throw new Error('Could not return to Document Search tab.');
  await page.mouse.click(tabPoint.x, tabPoint.y);
  await page.waitForTimeout(500);
  await waitForDocumentSearchLoaded(main);
  return main;
}

async function searchAndDownloadKeyword(context, page, keyword, index, total) {
  console.log(`\nProcessing keyword ${index + 1}/${total}: ${keyword}`);
  const keywordStartedAt = Date.now();
  const main = index === 0 ? await timed('Document Search navigation', () => navigateToDocumentSearch(page)) : await timed('Return to Document Search tab', () => returnToDocumentSearchTab(page));
  await saveDebugScreenshot(page, `keyword-${index + 1}-01-document-search.png`);

  console.log('Automating search form: Data Set + Keyword(s) only; leaving other fields untouched.');

  const dataSetSelected = await timed('Data Set selection', () => selectOptionContainingText(main, 'Manufacturing (ODM) Production'));
  if (!dataSetSelected) throw new Error('Could not select Manufacturing (ODM) Production from Data Set.');
  console.log('Selected Data Set: Manufacturing (ODM) Production');

  const keywordFilled = await timed('Keyword fill', () => fillKeywordInput(main, keyword));
  if (!keywordFilled) throw new Error('Could not fill Keyword(s).');
  console.log(`Filled Keyword(s): ${keyword}`);
  await saveDebugScreenshot(page, `keyword-${index + 1}-02-before-apply.png`);

  const beforeApplyText = await main.locator('body').innerText().catch(() => '');
  const applyClicked = await timed('Apply click', () => clickVisibleApply(main));
  if (!applyClicked) throw new Error('Could not click Apply.');
  console.log('Clicked Apply');

  console.log('Waiting for new search results to load...');
  await timed('Search refresh wait', () => waitForSearchRefresh(main, beforeApplyText));
  const hasResults = await timed('Search results wait', () => waitForSearchResults(main, TARGET_DOCUMENT_TITLE));
  await saveDebugScreenshot(page, `keyword-${index + 1}-03-search-results.png`);

  console.log(`Search results found: ${hasResults ? 'YES' : 'NO'}`);
  if (!hasResults) return { keyword, downloadedPath: null, status: 'no-results' };

  console.log(`Opening result document: ${TARGET_DOCUMENT_TITLE}`);
  const detailPage = await timed('Open matching document', () => openResultDocument(context, page, main, TARGET_DOCUMENT_TITLE, keyword));
  console.log('Clicking Download -> Document Contents...');
  const downloadedPath = await timed('Document Contents download', () => downloadDocumentContents(detailPage));
  const downloadedContent = fs.readFileSync(downloadedPath, 'utf8');
  if (!downloadedContent.includes(keyword)) {
    throw new Error(`Downloaded file does not contain keyword ${keyword}: ${downloadedPath}`);
  }
  console.log(`Downloaded file: ${downloadedPath}`);

  if (detailPage !== page) {
    await detailPage.close().catch(() => {});
    await page.bringToFront().catch(() => {});
  } else {
    await returnToDocumentSearchTab(page).catch(() => {});
  }

  console.log(`Keyword ${keyword} completed in ${((Date.now() - keywordStartedAt) / 1000).toFixed(1)}s`);
  return { keyword, downloadedPath, status: 'downloaded' };
}

async function openDocumentSearch() {
  const username = process.env.DELL_USERNAME;
  const password = process.env.DELL_PASSWORD;

  if (!username || !password) {
    throw new Error('Set DELL_USERNAME and DELL_PASSWORD before running this script.');
  }

  const { browser, context, closeBrowser } = await getBrowserContext();
  const { page, shouldNavigate } = await getOrCreateDellPage(context);
  page.setDefaultTimeout(15000);
  const keywords = readKeywords();
  const summary = [];

  try {
    if (shouldNavigate) {
      console.log('Opening Dell portal...');
      await page.goto(DELL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } else {
      console.log('Dell portal is already open. Reusing current page state.');
      await page.waitForTimeout(750);
    }

    await loginIfNeeded(page, username, password);
    await waitForPortalShell(page);

    await saveDebugScreenshot(page, '01-before-menu-click.png');

    console.log(`Loaded ${keywords.length} keyword(s) from keywords.txt.`);
    for (let index = 0; index < keywords.length; index += 1) {
      const result = await searchAndDownloadKeyword(context, page, keywords[index], index, keywords.length);
      summary.push(result);
    }

    console.log('\nBatch summary:');
    for (const item of summary) {
      console.log(`${item.keyword}: ${item.status}${item.downloadedPath ? ` -> ${item.downloadedPath}` : ''}`);
    }

    await page.waitForTimeout(1000);
  } finally {
    if (closeBrowser) {
      await browser.close();
    }
  }
}

async function getBrowserContext() {
  try {
    console.log(`Trying existing Chrome at ${CHROME_DEBUG_URL}...`);
    const browser = await chromium.connectOverCDP(CHROME_DEBUG_URL);
    const context = browser.contexts()[0] || await browser.newContext();
    console.log('Connected to existing Chrome.');
    return { browser, context, closeBrowser: false };
  } catch {
    console.log('Existing Chrome debugging session not found. Launching Chrome...');
    const context = await chromium.launchPersistentContext('./chrome-user-data', {
      headless: false,
      channel: 'chrome',
      acceptDownloads: true,
      viewport: null,
      args: ['--start-maximized'],
    });

    return { browser: context, context, closeBrowser: true };
  }
}

async function getOrCreateDellPage(context) {
  const dellPage = context.pages().find((existingPage) => {
    return existingPage.url().startsWith(DELL_URL);
  });

  if (dellPage) {
    console.log('Reusing existing Dell portal tab.');
    await dellPage.bringToFront();
    return { page: dellPage, shouldNavigate: false };
  }

  console.log('Opening a new Dell portal tab.');
  return { page: context.pages()[0] || await context.newPage(), shouldNavigate: true };
}

module.exports = { openDocumentSearch };

if (require.main === module) {
  openDocumentSearch().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
