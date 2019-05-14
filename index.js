//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const { terminal } = require('@absolunet/terminal');
const { chalk }    = terminal;

const helper = require('./lib/helper');
const multi  = require('./lib/multi');
const single = require('./lib/single');


class Manager {

	constructor() {
		terminal.setDefault({
			logo:         ['👨‍💻', '👩‍💻'].sort(() => { return 0.5 - Math.random(); }).pop(),
			textColor:    chalk.hex('#765432'),
			bgColor:      chalk.bgHex('#654321')
		});
	}

	get version() {
		return multi.version || single.version;
	}

	// eslint-disable-next-line require-await
	async updatePackageMeta(...parameters) {
		helper.updateNodeVersion(...parameters);
		helper.updateLicense(...parameters);
	}

	async testOutdated(...parameters) {
		await helper.npmOutdated(...parameters);
	}

	async installPackage(...parameters) {
		await helper.npmInstall(...parameters);
	}

	async singleScriptsRunner(...parameters) {
		await single.scriptsRunner(...parameters);
	}

	async multiScriptsRunner(...parameters) {
		await multi.scriptsRunner(...parameters);
	}

}


module.exports = new Manager();
