import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { playGroundPath } from "../config/configPath.js";

const resolvedPlayGroundPath = fs.realpathSync(playGroundPath); // Resolve symlinks

async function takeWebScreenshot(url, scrollPosition = 0) {
  // Validate URL
  try {
    new URL(url);
  } catch {
    return { status: "error", message: "System: Invalid URL provided" };
  }

  // Ensure scrollPosition is a valid number
  scrollPosition = Math.max(0, parseInt(scrollPosition) || 0);

  // Create screenshots directory if it doesn’t exist
  const screenshotsDir = path.join(resolvedPlayGroundPath, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    try {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    } catch {
      return {
        status: "error",
        message: "System: Failed to create screenshots directory",
      };
    }
  }

  // Generate a unique filename using crypto
  const { hostname } = new URL(url);
  const sanitizedHostname = hostname.replace(/[^a-z0-9]/gi, "-");
  const uniqueId = crypto.randomUUID();
  const scrollSuffix = scrollPosition > 0 ? `-scroll${scrollPosition}` : "";
  const filename = `${sanitizedHostname}${scrollSuffix}-${Date.now()}-${uniqueId}.png`;
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

    // Retry logic for page navigation
    let navigationSuccess = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        navigationSuccess = true;
        break;
      } catch (err) {
        if (attempt === 1) throw err; // Fail after 2 attempts
      }
    }

    if (!navigationSuccess) {
      return { status: "error", message: "System: Failed to load page" };
    }

    // Wait for full page load
    const loadState = await page
      .waitForLoadState("load", { timeout: 30000 })
      .then(() => true)
      .catch(() => false);
    if (!loadState) {
      return {
        status: "error",
        message: "System: Page load timeout, could not complete operation",
      };
    }

    // Scroll if needed
    if (scrollPosition > 0) {
      await page.evaluate(
        (scrollY) => window.scrollTo({ top: scrollY, behavior: "smooth" }),
        scrollPosition
      );
      await page.waitForTimeout(1000);
    }

    // Take screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      timeout: 10000,
    });

    return {
      status: "success",
      path: screenshotPath,
      context: {
        type: "webpage",
        url,
        scrollPosition,
        timestamp: new Date().toISOString(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
    return {
      status: "error",
      message: `System: Failed to take screenshot: ${error.message}`,
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

export { takeWebScreenshot };
