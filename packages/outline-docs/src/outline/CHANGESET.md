# Creating Changesets

> This document will outline how to use [Changesets](https://github.com/changesets/changesets) to manage package versioning for Outline and Outline packages.

## References

* [github.com/changesets/changesets](https://github.com/changesets/changesets)
* [dnlytras.com/blog/using-changesets](https://dnlytras.com/blog/using-changesets/)
* [christopherbiscardi.com/post/shipping-multipackage-repos...](https://www.christopherbiscardi.com/post/shipping-multipackage-repos-with-github-actions-changesets-and-lerna)

## Using Changesets ([ref](https://github.com/changesets/changesets))

Changesets are designed to make your workflows easier, by allowing the person making contributions to make key decisions when they are making their contribution.

The overall tool after initialization should lead to a loop that looks like:

* Changesets added along with each change
* The version command is run when a release is ready, and the changes are verified
* The publish command is run afterwards.

The second two steps can be made part of a CI process.

## Adding changesets

```shell
npx changeset
```

or

```shell
yarn changeset
```

> Note: You can run `changeset add` to add a changeset if you want to, but running Changesets without any command works as well.

## Versioning and publishing

Once you decide you want to do a release, you can run

```shell
npx changeset version
```

or

```shell
yarn changeset version
```

This consumes all changesets, and updates to the most appropriate semver version based on those changesets. It also writes changelog entries for each consumed changeset.

We recommend at this step reviewing both the changelog entries and the version changes for packages. Once you are confident that these are correct, and have made any necessary tweeks to changelogs, you can publish your packages:

```shell
npx changeset publish
```

or

```shell
yarn changeset publish
```

This will run npm publish in each package that is of a later version than the one currently listed on npm.
