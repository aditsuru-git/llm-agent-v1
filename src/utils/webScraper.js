import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Takes a screenshot of a webpage with advanced error handling and cleanup
 * @param {string} url - The URL to screenshot
 * @param {number} scrollPosition - Vertical scroll position (default: 0)
 * @returns {Promise<Object>} - Screenshot path and context information
 */
async function takeWebScreenshot(url, scrollPosition = 0) {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL provided");
  }

  // Validate and normalize scroll position
  scrollPosition = Math.max(0, parseInt(scrollPosition) || 0);

  // Ensure screenshots directory exists
  const screenshotsDir = path.join(
    __dirname,
    "..",
    "playground",
    "screenshots"
  );
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
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
    // Launch browser with security args
    browser = await chromium.launch({
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
      ],
    });

    // Create new context with viewport settings
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    const page = await context.newPage();

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000, // 30 second timeout
    });

    // Wait for page load with timeout
    await page
      .waitForLoadState("load", {
        timeout: 30000,
      })
      .catch((error) => {
        console.warn(
          "Page load timeout, continuing with partial content:",
          error.message
        );
      });

    // Handle scrolling if specified
    if (scrollPosition > 0) {
      await page.evaluate((scrollY) => {
        window.scrollTo({
          top: scrollY,
          behavior: "smooth",
        });
      }, scrollPosition);

      // Wait for scroll and any lazy-loaded content
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
    // Delete partial screenshot if it exists
    if (fs.existsSync(screenshotPath)) {
      fs.unlinkSync(screenshotPath);
    }

    console.error("Screenshot error:", {
      url,
      scrollPosition,
      error: error.message,
      stack: error.stack,
    });

    throw new Error(`Failed to take screenshot: ${error.message}`);
  } finally {
    // Ensure cleanup happens even if there's an error
    if (context) await context.close().catch(console.error);
    if (browser) await browser.close().catch(console.error);
  }
}

export { takeWebScreenshot };
