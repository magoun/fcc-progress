# Greenville Codes Student Progress Tracker

## Overview

This script takes a newline-delimited list of FreeCodeCamp profile URLs and returns a report on their progress as a newline-delimited list of comma-separated percentages. These can be easily pasted into a Google sheet used for tracking a cohort's progress through the Greenville Codes program.

## Installation

Requires Node v7.6 or higher (testing done with v10.1.0).
Clone the repo and cd into it.
Install the dependencies with `npm install`.

## Usage

Create the FreeCodeCamp curriculum map with `node map_fcc_path.js`.
It will create fcc_path.json or overwrite the existing file.

Use `node get_fcc_progress.js` to get a detailed progress report for a single FCC profile. You can specify to track the overall FCC curriculum or the Greenville Codes specific path in the file head.

Use `node get_bulk_fcc_progress.js` to get a csv report of a full list of student profiles. By default, these are pulled from fcc_profiles.txt, but this can be modified in the file head.

## Troubleshooting
~~Running `node get_bulk_fcc_progress.js` with an invalid url will return an error. This includes newline characters at the end of the file! I'll work on fixing this.~~ Fixed.

I ran into a few problems getting this to work on another computer. My errors were related to dependencies for Chrome. I resolved them by following the advice [here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md).

`npm install` loads the dependencies locally, so `ldd chrome | grep not` won't work in the base directory. You'll have to navigate all the way down to the node_modules directory for puppeteer, through the .local-chromium directory until you find the chrome binary, then run the command. This should give you the missing dependencies that need to be installed.