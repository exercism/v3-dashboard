const yargs = require('yargs')
const fs = require('fs')
const { execSync } = require('child_process')
const openUrl = require('openurl')

const argv = yargs
  .options({
    bump: {
      alias: 'b',
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
execSync(`npm version ${argv.bump} -m "${argv.message}"`)

const version = JSON.parse(fs.readFileSync('./package.json')).version
const tag = `v${version}`

console.log('Push commit and tag')
execSync(`git push`)
execSync(`git push origin ${tag}`)

console.log('Open create GitHub release page')
const newReleaseUrl = `https://github.com/exercism/v3-dashboard/releases/new?tag=${tag}&title=${argv.message}`
openUrl.open(newReleaseUrl)
