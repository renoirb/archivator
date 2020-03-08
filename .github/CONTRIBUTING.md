# Archivator Contributing Guide

Hello and thank you for interest in helping make Archivator better.
Please take a few moments to review the following guidelines.

## Pull Requests

- Always work on a new branch. Making changes on your fork's `dev` or `master` branch can cause problems. (See [The beginner's guide to contributing to a GitHub project](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/))
- New features and breaking changes should be submitted to the `v3.x-dev` branch.
- Any change should not break the build process. (See [Leveraging Rush.js](#leveraging-rushjs))
- Use a descriptive title no more than 64 characters long. This will be used as the commit message when your PR is merged.
- For changes and feature requests, please include an example of what you are trying to solve and an example of the markup. It is preferred that you create an issue first however, as that will allow the team to review your proposal before you start.
- Please reference the issue # that the PR resolves, something like `Fixes #1234` or `Resolves #6458` (See [closing issues using keywords](https://help.github.com/articles/closing-issues-using-keywords/))

## Leveraging RushJS

This project is built from smaller modules leveraging [Microsoft’s Monorepo _Rush Stack_][rushstack]

You can follow [Rush’s docs][rushstack-docs] getting started, but instead of following their example, you can use this project.

### Setup

From any folder from this project, you can run commands globally using `rush` command.

```terminal
rush update
rush build
```

If you make a change to a module, you can run build again, and only changed bits will be rebuilt (it won’t rebuild everything — Thanks rush!)

```terminal
rush rebuild
```

### Changing a module

From a module project (e.g. [_@archivator/archivable_  in `packages/archivable`](../packages/archivable)), you can run commands on that package only,
you can run commands locally using `rush` command.
Notice the `x` suffix to `rushx`.

```terminal
rushx test
rushx lint
rushx fix
rushx build
```

### Linting, Testing, Formatting

Is supported automatically via Rush, see [Changing a module](#changing-a-module)

[rushstack]: https://github.com/microsoft/rushstack 'Rush Stack for managing Monorepos'
[rushstack-docs]: https://rushjs.io/pages/intro/get_started/
