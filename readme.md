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

Main project version (from `lerna.json` for multi-packages)



<br>

### multiScriptsRunner(*[options]*) *async*

Bootstraps the CLI runner.

####  options.tasks

Type: `Object` <br>
List of scripts name with `preRun` and `postRun` hooks to call before and after the script

Example:
```
{
	build: {
		postRun: async () => {}
	},
	deploy: {
		preRun:  async () => {},
		postRun: async () => {}
	}
}
```



<br>

### updatePackageMeta(*[options]*) *async*
Updates Node version and license

####  options.path
Type: `String` <br>
Path where the `package.json` and `license` files are



<br>

### testOutdated(*[options]*) *async*
Lists outdated packages

####  options.path
Type: `String` <br>
Path where the `package.json` file is



<br>

### installPackage(*[options]*) *async*
Reinstall packages

####  options.path
Type: `String` <br>
Path where the `package.json` file is






<br><br>

## License

MIT © [Absolunet](https://absolunet.com)
