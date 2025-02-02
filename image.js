require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const path = require("path");
const http = require("http");
const fs = require("fs");
const code = fs.readFileSync(path.join(__dirname, "Sample/test.js"), "utf8"); // Reading content from test.js
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "Service")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Service/index.html"));
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  startScraping();
});

const startScraping = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
    args: [
      "--incognito",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-infobars",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=angle",
      "--use-angle=gl",
      "--enable-unsafe-webgpu",
      "--disable-setuid-sandbox",
      "--use-fake-device-for-media-stream",
      "--window-size=1280,900", // Adjusted for better compatibility
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });

  await page.goto(`http://localhost:${PORT}`);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for the page to load

  // Check if Monaco Editor is available
  const isMonacoLoaded = await page.evaluate(() => window.monaco !== undefined);
  if (!isMonacoLoaded) {
    console.error("Monaco Editor failed to load!");
    await browser.close();
    return;
  }
  
  console.log("Monaco Editor loaded successfully.");

  // Inject the JavaScript file (test.js) into the page dynamically
  await page.evaluate((codeContent) => {
    if (window.monaco) {
      const editor = window.monaco.editor.getEditors()[0]; // Get the first active editor
      if (editor) {
        editor.getModel().setValue(codeContent); // Set the content of Monaco editor with code from test.js
      }
    } else {
      console.error("Monaco Editor not found!");
    }
  }, code);

  // Wait for the Monaco editor to load
  await page.waitForSelector(".monaco-editor");

  const lineHeight = 20; // Adjust this to match the actual height of one line in Monaco editor
  const linesPerScreenshot = 36; // 36 lines per screenshot, for 72 lines total

  // Get the total height of the Monaco editor
  const totalHeight = await page.evaluate(() => {
    const editor = document.querySelector(".monaco-editor");
    return editor ? editor.scrollHeight : document.body.scrollHeight;
  });

  console.log(`Total height of editor: ${totalHeight}`);

  // Calculate scroll positions and step sizes
  const scrollStep = linesPerScreenshot * lineHeight; // Step size for each screenshot
  const totalScreenshots = 2; // We want exactly 2 screenshots

  let currentPosition = 0;
  let screenshotCount = 1;

  // Capture the first screenshot (first 36 lines)
  await page.screenshot({ path: `screenshot-${screenshotCount}.png` });
  console.log(`Screenshot ${screenshotCount} saved.`);
  screenshotCount++;

  // Scroll down for the next screenshot (next 36 lines)
  currentPosition += scrollStep;  // Move to the next 36 lines (after the first 36)
  await page.evaluate((position) => {
    window.scrollTo(0, position); // Scroll to the next position
  }, currentPosition);

  // Wait for the scroll to complete and content to load
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Capture the second screenshot (next 36 lines)
  await page.screenshot({ path: `screenshot-${screenshotCount}.png` });
  console.log(`Screenshot ${screenshotCount} saved.`);

  await browser.close();
  console.log("Browser closed.");

  server.close(() => {
    console.log("Server shut down.");
  });
};
