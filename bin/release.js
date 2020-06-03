const yargs = require('yargs')
const fs = require('fs')
const { execSync } = require('child_process')
const { Octokit } = require('@octokit/rest')
const opn = require('opn')

const argv = yargs
  .options({
    tag: {
      alias: 'a',
      demandOption: true,
      description: 'The release version',
      choices: ['major', 'minor', 'patch'],
    },
    message: {
      alias: 'm',
      demandOption: true,
      description: 'The release message',
      type: 'string',
    },
    token: {
      alias: 't',
      demandOption: false,
      description:
        'The GitHub token. If provided, the GitHub release will automatically be created.',
      type: 'string',
    },
  })
  .help().argv

console.log('Bump version')
execSync(`npm version ${argv.tag} -m "${argv.message}"`)

// console.log('Push commit and tags')
// execSync(`git push`)
// execSync(`git push --tags`)

const version = JSON.parse(fs.readFileSync('./package.json')).version

// if (argv.token) {
//   opn('https://github.com/exercism/v3-dashboard/releases/new')
// } else {
//   opn('https://github.com/exercism/v3-dashboard/releases/new')
// }
// Add to scripts in package.json that:

// yarn release "This is the best release"
// mimics yarn publish
// asks for the next version (free to type in for example)
// changes package.json
// checks if CHANGELOG contains ## master and renames to ## version and prepends ## master, unless ## version exists
// runs git tag -a <version> "This is the best release"
// runs git push --tags
// opens github releases
// alt command:

// yarn release -a 1.0.2 -m "This is the best release"
