[![npm](https://img.shields.io/npm/v/@deep-foundation/deep-export.svg)](https://www.npmjs.com/package/@deep-foundation/deep-export)
[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/deep-export) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

Cli utility that allows you to export links from your deep.

# Table Of Contents
<!-- TABLE_OF_CONTENTS_START -->
- [Table Of Contents](#table-of-contents)
- [Library](#library)
- [Cli](#cli)
  - [Cli Usage](#cli-usage)
    - [`deep-export`](#`deep-export`)
  - [Cli Usage Ways](#cli-usage-ways)
    - [Directly running using npx](#directly-running-using-npx)
    - [Global Installation](#global-installation)
      - [Global installation and running using binary name](#global-installation-and-running-using-binary-name)
      - [Global installation and running using npx](#global-installation-and-running-using-npx)
    - [Local installation](#local-installation)
      - [Local installation and running using npx](#local-installation-and-running-using-npx)
      - [Local installation and running using npm script](#local-installation-and-running-using-npm-script)

<!-- TABLE_OF_CONTENTS_END -->

# Library
See [Documentation] for examples and API

# Cli
## Cli Usage
<!-- CLI_HELP_START -->

### `deep-export`
```
Options:
  --version         Show version number                                [boolean]
  --url             The url of graphql to export data from   [string] [required]
  --jwt             The JWT token for authentication to the graphql server
                                                             [string] [required]
  --directory-name  The directory name to save data to                  [string]
  --help            Show help                                          [boolean]
```

<!-- CLI_HELP_END -->

## Cli Usage Ways
<!-- CLI_USAGE_WAYS_START -->
If you are going to use this package in a project - it is recommended to install it is [Locally](#local-installation)  
If you are going to use this package for yourself - it is recommended to install it [Globally](#global-installation) or run it directly using [npx](#directly-running-using-npx)
### Directly running using npx
```shell
npx --yes deep-export
```

### Global Installation
#### Global installation and running using binary name
```shell
npm install --global deep-export
/home/runner/work/deep-export/deep-export/dist/cli/deep-export
```

#### Global installation and running using npx
```shell
npm install --global deep-export
npx /home/runner/work/deep-export/deep-export/dist/cli/deep-export
```

### Local installation

#### Local installation and running using npx
```shell
npm install deep-export
npx /home/runner/work/deep-export/deep-export/dist/cli/deep-export
```

#### Local installation and running using npm script
```shell
npm install deep-export
```
Add npm script to package.json. Note that you can name  your script as you want but it must call binary file provided by the package
```json
{
  "scripts": {
    "/home/runner/work/deep-export/deep-export/dist/cli/deep-export": "/home/runner/work/deep-export/deep-export/dist/cli/deep-export"
  }
}
```
and run
```shell
npm run /home/runner/work/deep-export/deep-export/dist/cli/deep-export
```
<!-- CLI_USAGE_WAYS_END -->

[Documentation]: https://deep-foundation.github.io/create-typescript-npm-package/

