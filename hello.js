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

let createMap = (html) => {
  const $ = require('cheerio').load(html);
  let jsonObj = {};
  
  // Assemble the data to convert to JSON
  // Crawl the major sections in .superblock
  $('.superblock').each(function (index, element) {
    // Get the major section titles
    let section = $(this).find('h4').text();
    console.log(section);
    
    let sectionObj = {};
    // Crawl the subsections in .block
    $(this).find('.block')
      .each(function (index, element) {
        // Get the minor section titles
        let subsection = $(this).find('h5').text();
        console.log('  ' + subsection);
        
        let exercises = [];
        // Get the individual exercises for the subsection
        $(this).find('a')
          .each(function (index, element) {
            // First item is an 'Intro item', which we can ignore
            if (index != 0) {
              let exercise = $(this).text();
              exercises.push(exercise);
              console.log('    ' + exercise);
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
  
  // console.log(JSON.stringify(jsonObj));
  return JSON.stringify(jsonObj);
}

const url = 'https://learn.freecodecamp.org';
getHTML(url).then(createMap);
// getHTML(url).then( (html) => {
//   const $ = require('cheerio').load(html);
//   let jsonArray = [];
  
//   // Assemble the data to convert to JSON
//   // Crawl the major sections in .superblock
//   $('.superblock').each(function (index, element) {
//     // Get the major section titles
//     let section = $(this).find('h4').text();
//     jsonArray[index] = 
//     // Crawl the subsections in .block
//     $(this).find('.block')
//       .each(function (index, element) {
//         // Get the minor section titles
//         let subsection = $(this).find('h5').text();
//         console.log('  ' + subsection);
//         $(this).find('a')
//           .each(function (index, element) {
//             // First item is an 'Intro item', which we can ignore
//             if (index != 0) {
//               let exercise = $(this).text();
//               console.log('    ' + exercise);
//             }
//           });
//       });
//   });
// });

