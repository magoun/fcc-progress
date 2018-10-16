const puppeteer = require('puppeteer');

// Fetch html using puppeteer
let getHTML = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Need to click links to fully expand map
  // Outer level uses superblock class
  let superblock = await page.$("li[class='superblock ']");
  while (superblock) {
    await superblock.click();
    superblock = await page.$("li[class='superblock ']");
  }
  
  // Inner level uses block class
  let block = await page.$("li[class='block ']");
  while (block) {
    await block.click();
    block = await page.$("li[class='block ']");
  }
  
  // Map is now fully expanded. Get content and close browser.
  const html = await page.content();
  await browser.close();
  return html;
};


const url = 'https://learn.freecodecamp.org';
getHTML(url).then( (html) => {
  const $ = require('cheerio').load(html);
  $("li[class='map-challenge-title'] > a").each(function () {
    // console.log($(this).text());
    });
});

