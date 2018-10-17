/**
 * Scrapes the lesson list from  https://learn.freecodecamp.org into
 * a JSON Object, then writes that object to lesson_map.json
 * 
 * Usage: node lesson_map.js
 * 
 *  { 'section1': {
 *      'subsection1': [
 *        'exercise1',
 *        'exercise2', 
 *        ...
 *      ],
 *      'subsection2': [...],
 *      ...
 *    },
 *    'section2': {...},
 *    ... 
 *  }
*/

// Fetch html using puppeteer
let getHTML = async (url) => {
  const puppeteer = require('puppeteer');
  
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

// Create map of curriculum as JSON object
let createMap = (html) => {
  const $ = require('cheerio').load(html);
  let jsonObj = {};
  
  // Assemble the data to convert to JSON
  // Crawl the major sections in .superblock
  $('.superblock').each(function (index, element) {
    // Get the major section titles
    let section = $(this).find('h4').text();
    
    let sectionObj = {};
    // Crawl the subsections in .block
    $(this).find('.block')
      .each(function (index, element) {
        // Get the minor section titles
        let subsection = $(this).find('h5').text();
        
        let exercises = [];
        // Get the individual exercises for the subsection
        $(this).find('a')
          .each(function (index, element) {
            // First item is an 'Intro item', which we can ignore
            if (index != 0) {
              let exercise = $(this).text();
              exercises.push(exercise);
            }
          });
        
        // Store the exercise array as 'subsection' => exercises
        sectionObj[subsection] = exercises;
      });
      
    // Store the section object as 
    // 'section' => {subsection1 => exercises,
    //               subsection2 => exercise, ...}
    jsonObj[section] = sectionObj;
  });
  
  return jsonObj;
}

// Writes the JSON object to a file
let writeJSON = (json) => {
  const fs = require('fs');
  const outputFile = 'lesson_map.json';
  // Format the json for readability
  const jsonString = JSON.stringify(json, null, 2);
  
  fs.writeFile(outputFile, jsonString, (err) => {
      // Report success / failure
      const successMessage = 'FCC curriculum was written to ' + outputFile;
      err ? console.log(err) : console.log(successMessage);
  }); 
};

// Runs the program
let run = () => {
  const url = 'https://learn.freecodecamp.org';
  
  getHTML(url)
    .then(createMap)
    .then(writeJSON);
};

run();