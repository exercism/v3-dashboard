const yargs = require('yargs')
const fs = require('fs')
const { execSync } = require('child_process')
const openUrl = require('openurl')

const argv = yargs
  .options({
    bump: {
      alias: 'b',
      demandOption: false,
      description: 'What part of the version to bump',
      choices: ['major', 'minor', 'patch'],
    },
    message: {
      alias: 'm',
      demandOption: false,
      description:
        'Describe the release. If not specified, the latest commit message is used',
      type: 'string',
    },
  })
  .help().argv

const lastCommitMessage = () =>
  execSync(`git log -1 --pretty=%B`).toString().trim()

const bump = argv.bump || 'patch'
const message = argv.message || lastCommitMessage()

console.log('Bump version')
execSync(`npm version ${bump} -m "${message}"`)

const version = JSON.parse(fs.readFileSync('./package.json')).version
const tag = `v${version}`

console.log('Push commit and tag')
execSync(`git push`)
execSync(`git push origin ${tag}`)

console.log('Open create GitHub release page')
const newReleaseUrl = `https://github.com/exercism/v3-dashboard/releases/new?tag=${tag}&title=${message}`
openUrl.open(newReleaseUrl)
