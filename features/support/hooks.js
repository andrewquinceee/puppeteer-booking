const {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
} = require("@cucumber/cucumber");
const puppeteer = require("puppeteer");

setDefaultTimeout(60000);

let browser;

BeforeAll(async () => {
  browser = await puppeteer.launch({ headless: "new" });
});

Before(async function () {
  this.page = await browser.newPage();
});

After(async function () {
  await this.page.close();
});

AfterAll(async () => {
  await browser.close();
});
