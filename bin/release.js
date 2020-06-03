const yargs = require('yargs')
const fs = require('fs')
const { execSync } = require('child_process')
const opn = require('opn')

const argv = yargs
  .options({
    patch: {
      alias: 'p',
      demandOption: true,
      description: 'What part of the version to bump',
      choices: ['major', 'minor', 'patch'],
    },
    message: {
      alias: 'm',
      demandOption: true,
      description: 'Describe the release',
      type: 'string',
    },
  })
  .help().argv

console.log('Bump version')
execSync(`npm version ${argv.patch} -m "${argv.message}"`)

const version = JSON.parse(fs.readFileSync('./package.json')).version
const tag = `v${version}`

console.log('Push commit and tag')
execSync(`git push temp`)
execSync(`git push temp ${tag}`)

console.log('Open create GitHub release page')
const newReleaseUrl = `https://github.com/erikschierboom/v3-dashboard/releases/new?tag=${tag}&title=${argv.message}`
opn(newReleaseUrl)
