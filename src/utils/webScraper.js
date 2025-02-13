import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Takes a screenshot of a webpage with graceful error handling
 * @param {string} url - The URL to screenshot
 * @param {number} scrollPosition - Vertical scroll position (default: 0)
 * @returns {Promise<Object|string>} - Screenshot info object or error message
 */
async function takeWebScreenshot(url, scrollPosition = 0) {
  // Validate URL
  try {
    new URL(url);
  } catch {
    return "System: Invalid URL provided";
  }

  // Validate scroll position
  scrollPosition = Math.max(0, parseInt(scrollPosition) || 0);

  // Ensure screenshots directory exists
  const screenshotsDir = path.join(
    __dirname,
    "..",
    "..",
    "playground",
    "screenshots"
  );
  if (!fs.existsSync(screenshotsDir)) {
    try {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    } catch {
      return "System: Failed to create screenshots directory";
    }
  }

  // Generate unique filename
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, "-");
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const scrollSuffix = scrollPosition > 0 ? `-scroll${scrollPosition}` : "";
  const filename = `${hostname}${scrollSuffix}-${uniqueId}.png`;
  const screenshotPath = path.join(screenshotsDir, filename);

  let browser = null;
  let context = null;

  try {
    browser = await chromium.launch({
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
      ],
    });

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    const page = await context.newPage();

    // Navigate with timeout
    const navigationResult = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    if (!navigationResult.ok()) {
      return `System: Failed to load page: ${navigationResult.status()}`;
    }

    // Wait for page load
    const loadState = await page
      .waitForLoadState("load", { timeout: 30000 })
      .then(() => true)
      .catch(() => false);

    if (!loadState) {
      return "System: Page load timeout, could not complete operation";
    }

    // Handle scrolling
    if (scrollPosition > 0) {
      await page.evaluate((scrollY) => {
        window.scrollTo({
          top: scrollY,
          behavior: "smooth",
        });
      }, scrollPosition);

      await page.waitForTimeout(1000);
    }

    // Take screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      timeout: 10000,
    });

    // Return success result
    return {
      path: screenshotPath,
      context: {
        type: "webpage",
        url: url,
        scrollPosition: scrollPosition,
        timestamp: new Date().toISOString(),
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    };
  } catch (error) {
    // Clean up partial screenshot
    if (fs.existsSync(screenshotPath)) {
      try {
        fs.unlinkSync(screenshotPath);
      } catch {
        // Ignore cleanup errors
      }
    }
    return `System: Failed to take screenshot: ${error.message}`;
  } finally {
    // Cleanup browser resources
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

export { takeWebScreenshot };
