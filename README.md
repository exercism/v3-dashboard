# V3 Progress Dashboard

A dashboard to help maintainers and contributors understand the state of the Tracks for v3. It is under active development.

If your track is not listed but you _are_ working on v3, please open an issue at the [main v3 repo](https://github.com/exercism/v3).

## Contributing

We welcome contributions to this repo. Please check out the [CONTRIBUTING.MD](https://github.com/exercism/v3-dashboard/blob/master/CONTRIBUTING.md) file for details on how to get things set up.

## Deploying

To deploy a new version of the dashboard, do:

- Run `git checkout master` to checkout the master branch
- Run `git pull` to update the `master` branch to the latest version
- Run `yarn release -p [major | minor | patch] -m <message>` which will:
  - Bump the version in the `package.json` file
  - Create a commit for the modified `package.json` file
  - Create a tag for the commit that was just added
  - Push the commit and the tag to the remote
  - Open a browser window to create a GitHub release for the new tag

Once the GitHub release has been created, a workflow will automatically start to deploy the latest version. This usually takes a minute or so.

## Licence

This project is licenced under MIT. It is copyright to Exercism.
