# @absolunet/manager

[![npm](https://img.shields.io/npm/v/@absolunet/manager.svg)](https://www.npmjs.com/package/@absolunet/manager)
[![npm dependencies](https://david-dm.org/absolunet/node-manager/status.svg)](https://david-dm.org/absolunet/node-manager)
[![npms](https://badges.npms.io/%40absolunet%2Fmanager.svg)](https://npms.io/search?q=%40absolunet%2Fmanager)
[![Travis CI](https://api.travis-ci.org/absolunet/node-manager.svg?branch=master)](https://travis-ci.org/absolunet/node-manager/builds)
[![Code style](https://img.shields.io/badge/code_style-@absolunet/node-659d32.svg)](https://github.com/absolunet/eslint-config)

> Manager for single/multi packages JavaScript projects


## Install

```bash
$ npm install @absolunet/manager
```


## Usage

In your `./package.json` file add
```json
{
	"scripts": {
		"postinstall": "npm run manager:install",  // For multi-package repository
		"manager:install": "node manager --task=install",
		"manager:outdated": "node manager --task=outdated",
		"manager:build": "node manager --task=build",
		"manager:watch": "node manager --task=watch",
		"manager:documentation": "node manager --task=documentation",
		"manager:prepare": "node manager --task=prepare",
		"manager:rebuild": "node manager --task=rebuild",
		"manager:publish": "node manager --task=publish",
		"manager:publish:unsafe": "node manager --task=publish:unsafe"
	}
}
```


In a `./manager.js` file
```js
import { manager } from '@absolunet/manager';

manager.singleScriptsRunner(options);
```

or


```js
import { manager } from '@absolunet/manager';

manager.multiScriptsRunner(options);
```


## API

View [API documentation](https://absolunet.github.io/absolunet/node-manager)






<br><br>

## License

MIT © [Absolunet](https://absolunet.com)
