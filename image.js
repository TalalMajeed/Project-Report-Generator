require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const path = require("path");
const http = require("http");
const fs = require("fs");
const code = fs.readFileSync(path.join(__dirname, "Sample/test.js"), "utf8");

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
    headless: false,
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
      "--window-size=1280,900",
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
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.click("body");
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyV");
  await page.keyboard.up("Control");

  await page.screenshot({ path: "screenshot.png" });
  console.log("Screenshot saved.");

  await browser.close();
  console.log("Browser closed.");

  server.close(() => {
    console.log("Server shut down.");
  });
};
