//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const helper = require('./lib/helper');
const multi  = require('./lib/multi');


class Manager {

	get version() {
		return multi.version;
	}

	// eslint-disable-next-line require-await
	async updatePackageMeta(options) {
		helper.updateNodeVersion(options);
		helper.updateLicense(options);
	}

	async testOutdated(options) {
		await helper.npmOutdated(options);
	}

	async installPackage(options) {
		await helper.npmInstall(options);
	}

	async multiScriptsRunner(options) {
		await multi.scriptsRunner(options);
	}

}


module.exports = new Manager();
