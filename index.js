require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const main = async () => {
    browser = await puppeteer.launch({
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

    await page.goto("https://developer.mozilla.org/en-US/");
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "example.png" });
    await browser.close();
};

main();
