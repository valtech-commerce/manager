# @absolunet/manager

[![npm](https://img.shields.io/npm/v/@absolunet/manager.svg)](https://www.npmjs.com/package/@absolunet/manager)
[![npm dependencies](https://david-dm.org/absolunet/node-manager/status.svg)](https://david-dm.org/absolunet/node-manager)
[![npms](https://badges.npms.io/%40absolunet%2Fmanager.svg)](https://npms.io/search?q=%40absolunet%2Fmanager)
[![Travis CI](https://api.travis-ci.org/absolunet/node-manager.svg?branch=master)](https://travis-ci.org/absolunet/node-manager/builds)
[![Code style](https://img.shields.io/badge/code_style-@absolunet/node-659d32.svg)](https://github.com/absolunet/eslint-config)

> Manager for Node.js projects


## Install

```sh
$ npm install @absolunet/manager
```


## Usage for single-package repository

In a `manager.js` file
```js
const manager = require('@absolunet/manager');

manager.singleScriptsRunner();
```

In your `package.json` file
```json
"scripts": {
  "postinstall": "node manager.js --task=install",
  "outdated": "node manager.js --task=outdated",
  "build": "node manager.js --task=build",
  "deploy": "node manager.js --task=deploy"
}
```


## Usage for multi-packages repository

In a `manager.js` file
```js
const manager = require('@absolunet/manager');

manager.multiScriptsRunner();
```

In your `package.json` file
```json
"scripts": {
  "postinstall": "rm -rf packages/*/package-lock.json; lerna clean --yes; lerna bootstrap --no-ci; node manager.js --task=install",
  "outdated": "node manager.js --task=outdated",
  "build": "node manager.js --task=build",
  "deploy": "node manager.js --task=deploy"
}
```


## API

### version

Main project version
- Single-package uses `package.json`
- Multi-packages uses `lerna.json`



<br>

### singleScriptsRunner(*[options]*) *async*
Bootstraps the CLI runner for single-package repository.

####  options.restricted
Type: `Boolean` <br>
_Default: false_<br>
When publishing, tell the registry the package should be published restricted instead of public.

####  options.useOTP
Type: `Boolean` <br>
_Default: true_<br>
When publishing, use the two-factor authentication if enabled.

####  options.tasks

Type: `Object` <br>
List of tasks (install, outdated, build, deploy) with `preRun` and `postRun` hooks to call before and after

Hooks receive a reference to the [terminal](https://github.com/absolunet/node-terminal) instance

Example:
```js
{
	build: {
		postRun: async () => {}
	},
	deploy: {
		preRun:  async () => {},
		postRun: async ({ terminal }) => {
			terminal.print('Enjoy');
		}
	}
}
```



<br>

### multiScriptsRunner(*[options]*) *async*
Bootstraps the CLI runner for multi-packages repository.

####  options
_Options are identical to `singleScriptsRunner`_<br>



<br>

### updatePackageMeta(*[root]*) *async*
Updates Node version and license

####  root
Type: `String` <br>
Path where the `package.json` and `license` files are



<br>

### testOutdated(*[root]*) *async*
Lists outdated packages

####  root
Type: `String` <br>
Path where the `package.json` file is



<br>

### installPackage(*[root]*) *async*
Reinstall packages

####  root
Type: `String` <br>
Path where the `package.json` file is






<br><br>

## License

MIT © [Absolunet](https://absolunet.com)
