const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs"); // For file system operations (saving screenshots)

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Define the path to the downloaded Chrome executable for Render deployment.
// Adjust this path if your Puppeteer cache directory is different.
const chromePath = path.resolve(
  __dirname,
  ".cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome"
);

// Ensure the screenshots directory exists
const screenshotsDir = path.join(__dirname, "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

app.get("/", (req, res) => {
  res.send(`
        <h1>Puppeteer W3Schools Scraper</h1>
        <p>Click the link below to start the scraping process:</p>
        <p><a href="/scrape-w3schools">Scrape W3Schools</a></p>
    `);
});

// Endpoint to scrape W3Schools
app.get("/scrape-w3schools", async (req, res) => {
  let browser; // Declare browser outside try block for finally
  try {
    console.log("🚀 Launching Puppeteer browser...");
    browser = await puppeteer.launch({
      headless: "new", // Use 'new' for the new headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Recommended for Docker/Linux environments
      ],
      executablePath: chromePath, // Must match downloaded path
      ignoreHTTPSErrors: true, // Added for broader compatibility, be cautious in production
    });

    const page = await browser.newPage();

    // Set a generous default timeout for all page operations
    await page.setDefaultNavigationTimeout(60000); // 60 seconds
    await page.setDefaultTimeout(60000); // 60 seconds for other operations

    const targetUrl = "https://www.w3schools.com/";
    console.log(`🌐 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded", // Wait for the basic HTML to load
      timeout: 60000, // Explicit timeout for this navigation
    });
    console.log("✅ Navigation complete.");

    // Get the page title
    const pageTitle = await page.title();
    console.log(`📄 Page Title: "${pageTitle}"`);

    // Extract the text from the main heading (e.g., "Learn to Code")
    // We'll look for an <h1> element within a specific section, or a general <h1>
    const mainHeadingText = await page.evaluate(() => {
      // Try to find the main heading for "Learn to Code" or similar
      const heading = document.querySelector(".learntocodeh1, h1");
      return heading ? heading.textContent.trim() : "Heading not found";
    });
    console.log(`📝 Main Heading Text: "${mainHeadingText}"`);

    // Take a screenshot
    const screenshotFileName = `w3schools_screenshot_${Date.now()}.png`;
    const screenshotPath = path.join(screenshotsDir, screenshotFileName);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    res.json({
      success: true,
      message: "Scraping completed successfully!",
      data: {
        pageTitle: pageTitle,
        mainHeading: mainHeadingText,
        screenshot: screenshotFileName, // Return just the file name, client can request it
      },
      finalUrl: page.url(),
    });
  } catch (err) {
    console.error("❌ Automation failed:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error during scraping.",
      message: err.message,
      name: err.name || "Error",
    });
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
      console.log("Browser closed.");
    }
  }
});

// Serve screenshots (optional, but useful for debugging)
app.use("/screenshots", express.static(screenshotsDir));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `Access the scraper at: http://localhost:${PORT}/scrape-w3schools`
  );
  console.log(`(On Render, use your service URL instead of localhost)`);
});
