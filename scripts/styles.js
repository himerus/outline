/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/* eslint-disable no-console */
const yargs = require('yargs');
const gaze = require('gaze');
const postcss = require('postcss');
const fs = require('fs');
const glob = require('glob');
const outline = require('../outline.config');
const config = require('@phase2/outline-config/postcss.config');

const options = yargs.option('watch', {
  type: 'boolean',
  describe: 'Watch the file system for changes and render automatically',
}).argv;

/**
 * Function declared via watcher to handle looping in any globally focus style generation.
 */
const createCssGlobals = () => {
  globalStylesheets();
};

/**
 * Function to loop over config declared CSS source files to process.
 */
const globalStylesheets = () => {
  outline.css.global.forEach(style => {
    global(style.src, style.dest);
  });
};

/**
 * Function to process a source file and output to a destination via postcss.
 *
 * @param {string} src
 * @param {string} dest
 */
const global = (src, dest) => {
  fs.readFile(src, (err, css) => {
    postcss([...config.plugins])
      .process(css, { from: src, to: dest })
      .then(result => {
        //console.log(`Writing ${src} to ${dest}...`);
        fs.writeFile(dest, result.css, () => true);
        if (result.map) {
          fs.writeFile(`${dest}.map`, result.map.toString(), () => true);
        }
      });
  });
};

/**
 * Function to wrap all generic .css files with CSS template literals suitable for consumption via Lit.
 *
 * @param {string} filepath
 */
const createCssLiterals = filepath => {
  const filename = filepath.replace(/^.*[\\\/]/, '');
  //console.log(filename);
  fs.readFile(filepath, (err, css) => {
    const nFilePath = `${filepath}.lit.ts`;
    postcss([...config.plugins])
      .process(css, { from: filepath, to: nFilePath })
      .then(result => {
        if (filepath.includes('css-variables')) {
          createVariableLiterals(result, nFilePath);
        } else {
          createComponentLiterals(result, nFilePath);
        }
      });
  });
};

const createComponentLiterals = (result, path) => {
  fs.writeFile(
    path,
    `
import { css } from 'lit';
export default css\`
/* Apply standardized box sizing to the component. */
:host {
  box-sizing: border-box;
}
:host *,
:host *::before,
:host *::after {
  box-sizing: inherit;
}
/* Apply proper CSS for accessibly hiding elements to each component. */
.visually-hidden {
  position: absolute !important;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  width: 1px;
  height: 1px;
  word-wrap: normal;
}
/* Apply component specific CSS */
${result.css}\`;`,
    () => true
  );
};

const createVariableLiterals = (result, path) => {
  fs.writeFile(
    path,
    `
import { css } from 'lit';
export default css\`
/* Apply CSS Variables to the host element. */
:host {
${result.css}\`;`,
    () => true
  );
};

// Run the global style generation.
createCssGlobals();

// Run the component style generation.
glob(
  'packages/**/*.css',
  { ignore: ['packages/outline-storybook/**/*.css', '.storybook/**/*.css'] },
  (err, files) => {
    files.forEach(createCssLiterals);
  }
);

// Watch mode with --watch in cli.
// if (options.watch) {
//   // Watch globals.
//   gaze('*.css', (err, watcher) => {
//     watcher.on('added', createCssGlobals);
//     watcher.on('changed', createCssGlobals);
//   });

//   // Watch components.
//   gaze(
//     'packages/**/*.css',
//     { ignore: ['**/dist/**/*.css', '**/packages/outline-storybook/**/*.css'] },
//     (err, watcher) => {
//       watcher.on('added', createCssLiterals);
//       watcher.on('changed', createCssLiterals);
//     }
//   );
// }
