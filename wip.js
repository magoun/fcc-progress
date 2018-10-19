const fs = require('fs');
const puppeteer = require('puppeteer');

// Read list of profile urls
// Returns an array of profile URLs
let readURLs = (file) => {
  let profiles = fs.readFileSync(file, 'utf8');
  
  // Splitting the return on new line yields an array
  return profiles.split('\n');
};

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
// Returns a semicolon delimited string
let getProgress = (completedChallenges) => {
  const rawJSON = fs.readFileSync('gvl_codes_path.json');
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
      
      progress += `${Math.round(100 * numCompleted / numChallenges)}%` + ';';
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
  const outputFile = 'test.json';
  const urlFile = 'fcc_profiles.txt';
  
  // Get urls from urlFile
  const urlArray = readURLs(urlFile);
  let writeArray = [];
  
  // Clear output file
  fs.writeFileSync(outputFile, '');
  
  // Assemble student progress into array
  for (let url of urlArray) {
    let progress = await getHTML(url)
                           .then(parseHTML)
                           .then(getProgress);
                       
    writeArray[urlArray.indexOf(url)] = url + ';' + progress;
  }
  
  writeProgress(writeArray, outputFile);
};

run();