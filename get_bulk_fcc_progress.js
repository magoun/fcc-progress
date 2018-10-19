/**
 * Scrapes a user profile from https://www.freecodecamp.org/{username} and 
 * compares completed challenges against the FCC curriculum. The results are
 * output in JSON format to outputFile.
 * 
 * Track Greenville Codes progress with gvl_codes_path.json.
 * Track overall FreeCodeCamp progress with fcc_path.json.
 * 
 * Usage: node fcc_progress.js
 * 
 */

const outputFile = 'fcc_progress.json',
      url = 'https://www.freecodecamp.org/magoun',
      trackFile = 'gvl_codes_path.json';
 
const fs = require('fs');
const puppeteer = require('puppeteer');

// Fetch html using puppeteer
let getHTML = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Wait for React components to load
  await page.goto(url, { waitUntil: 'networkidle0'});
  
  const html = await page.content();
  await browser.close();
  return html;
};

// Parse the HTML for completed challenges
// Returns an array of challenge names
let parseHTML = (html) => {
  const $ = require('cheerio').load(html);
  let challenges = [];
  
  $('tr', 'tbody').each(function (index, element) {
    let challenge = $(this).find('a').text();
    challenges.push(challenge);
  });
  
  return challenges;
};

// Compare progress to overall curriculum
// Returns a JSON object
let getProgress = (completedChallenges) => {
  const rawJSON = fs.readFileSync(trackFile);
  let challengeMap = JSON.parse(rawJSON);
  
  // Inconsistent capitalization, thus map to lower case
  completedChallenges = completedChallenges.map(x => x.toLowerCase());

  // Loop through curriculum JSON
  for (let section of Object.keys(challengeMap)) {
    for (let subsection of Object.keys(challengeMap[section])) {
      let numChallenges = challengeMap[section][subsection].length;
      
      // Inconsistent capitalization, thus map to lower case
      let subsectionArray = challengeMap[section][subsection].map(x => x.toLowerCase());
      
      let numCompleted = subsectionArray.reduce((acc, val) => {
        return completedChallenges.indexOf(val) != -1 ? ++acc : acc;
      }, 0);
      
      challengeMap[section][subsection] = `${Math.round(100 * numCompleted / numChallenges)}%`;
    }
  }

  return challengeMap;
};

// Writes the JSON object to a file
let writeJSON = (json) => {
  // Format the json for readability
  const jsonString = JSON.stringify(json, null, 2);
  
  fs.writeFile(outputFile, jsonString, (err) => {
      // Report success / failure
      const successMessage = 'Greenville Codes progress was written to ' + outputFile;
      err ? console.log(err) : console.log(successMessage);
  }); 
};

// Runs the program
let run = () => {
  getHTML(url)
    .then(parseHTML)
    .then(getProgress)
    .then(writeJSON);
};

run();