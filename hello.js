const puppeteer = require('puppeteer');

// Fetch html using puppeteer
let getHTML = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();

  await browser.close();
  return html;
};


const url = 'https://learn.freecodecamp.org';
getHTML(url).then( (html) => {
  const $ = require('cheerio').load(html);
  $('li').each(function () {
    console.log($(this).text());
    });
});

