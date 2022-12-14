# Test Observability Action: Contributing

## Release Process

1. Create a branch `release/<major>.<minor>.<patch>` from `main` - e.g. `release/1.3.0`
2. Bump the version number in `package.json`
3. Run `npm install` which will update the version in `package-lock.json` and also reveal whether there are any dependency vulnerabilities to be fixed
4. Run `npm run package` to compile the TypeScript into a single file (output will be in the `dist` folder)
5. Commit the changes to the `dist` folder from step 4, alongside the version change from steps 2 and 3, with a commit message like `"Create version 1.3.0."`
6. Open a pull request from the release branch into `main`
7. Wait for pull request to be approved and then merge it
8. Wait for CI to pass on `main`
9. Push a tag with the absolute new version number to GitHub, which must be in the form `v<major>.<minor>.<patch>` - e.g. `v1.3.0`
10. Move the tag for the `major` version number to the same commit, which will be in the form `v<major>` - e.g. `v1`

## See Also

- [Ably SDK Team: Guidance on Releases](https://github.com/ably/engineering/blob/main/sdk/releases.md)
- [GitHub Actions: Creating actions: About custom actions: Using tags for release management](https://docs.github.com/en/actions/creating-actions/about-custom-actions#using-tags-for-release-management)
