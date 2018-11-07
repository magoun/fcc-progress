/**
 * Scrapes multiple user profile from fcc_profiles.txt and 
 * compares completed challenges against the Greenville Codes curriculum. 
 * 
 * Track Greenville Codes progress with gvl_codes_path.json.
 * 
 * Usage: node bulk_fcc_progress.js
 * 
 */

const outputFile = 'student_progress.csv',
      urlFile = 'fcc_profiles.txt',
      trackFile = 'gvl_codes_path.json';

const fs = require('fs');
const puppeteer = require('puppeteer');
const URL = require('url');

// Function for filtering bad inputs from urlFile
let validateURL = (str) => {
  const url = URL.parse(str);
  
  if (url.hostname) {
    return true;
  } else {
    console.log('Skipping ' + str + ' (invalid URL)');
    return false;
  }
};

// Read list of profile urls
// Returns an array of profile URLs
let readURLs = (file) => {
  let profiles = fs.readFileSync(file, 'utf8');
  console.log('Reading profile urls from ' + urlFile);
  
  // Splitting the return on new line yields an array
  return profiles.split('\n').filter(validateURL);
};

// Fetch html using puppeteer
let getHTML = async (url) => {
  console.log('Getting HTML from ' + url);
  
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
// Returns a comma delimited string
let getProgress = (completedChallenges) => {
  const rawJSON = fs.readFileSync(trackFile);
  let challengeMap = JSON.parse(rawJSON);
  
  // Inconsistent capitalization, thus map to lower case
  completedChallenges = completedChallenges.map(x => x.toLowerCase());

  let progress = '';

  // Loop through curriculum JSON
  for (let section of Object.keys(challengeMap)) {
    for (let subsection of Object.keys(challengeMap[section])) {
      let numChallenges = challengeMap[section][subsection].length;
      
      // Inconsistent capitalization, thus map to lower case
      let subsectionArray = challengeMap[section][subsection].map(x => x.toLowerCase());
      
      let numCompleted = subsectionArray.reduce((acc, val) => {
        return completedChallenges.indexOf(val) != -1 ? ++acc : acc;
      }, 0);
      
      progress += `${Math.round(100 * numCompleted / numChallenges)}%` + ',';
    }
  }

  return progress;
};

// Writes the url and progress strings to a file
let writeProgress = (writeArray, file) => {
  const outputString = writeArray.join('\n');
  
  fs.writeFile(file, outputString, (err) => {
      // Report success / failure
      const successMessage = 'Greenville Codes progress was written to ' + file;
        
      err ? console.log(err) : console.log(successMessage);
  }); 
};

// Runs the program
let run = async () => {
  // Get urls from urlFile
  const urlArray = readURLs(urlFile);
  let writeArray = [];
  
  // Assemble student progress into array
  for (let url of urlArray) {
    let progress = await getHTML(url)
                          .then(parseHTML)
                          .then(getProgress);
                       
    writeArray[urlArray.indexOf(url)] = url + ',' + progress;
  }
  
  writeProgress(writeArray, outputFile);
};

run();