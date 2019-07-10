# @absolunet/manager

[![npm](https://img.shields.io/npm/v/@absolunet/manager.svg)](https://www.npmjs.com/package/@absolunet/manager)
[![npm dependencies](https://david-dm.org/absolunet/node-manager/status.svg)](https://david-dm.org/absolunet/node-manager)
[![npms](https://badges.npms.io/%40absolunet%2Fmanager.svg)](https://npms.io/search?q=%40absolunet%2Fmanager)
[![Travis CI](https://api.travis-ci.org/absolunet/node-manager.svg?branch=master)](https://travis-ci.org/absolunet/node-manager/builds)
[![Code style](https://img.shields.io/badge/code_style-@absolunet/node-659d32.svg)](https://github.com/absolunet/eslint-config)

> Manager for Node.js projects


## Install

```bash
$ npm install @absolunet/manager
```


## Usage

In your `package.json` file add
```json
{
	"scripts": {
		"installer": "node manager.js --task=installer",      // For single-package repository
		"postinstall": "node manager.js --task=postinstall",  // For multi-package repository
		"outdated": "node manager.js --task=outdated",
		"build": "node manager.js --task=build",
		"watch": "node manager.js --task=watch",
		"assemble": "node manager.js --task=assemble",
		"deploy": "node manager.js --task=deploy"
	}
}
```


In a `manager.js` file
```js
const manager = require('@absolunet/manager');

manager.singleScriptsRunner();
```

or


```js
const manager = require('@absolunet/manager');

manager.multiScriptsRunner();
```


## API

View [API documentation](https://absolunet.github.io/absolunet/node-manager)






<br><br>

## License

MIT © [Absolunet](https://absolunet.com)
