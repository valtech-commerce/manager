//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const multi = require('./lib/multi');


class Manager {

	get version() {
		return multi.version;
	}

	async multiScriptsRunner(options) {
		await multi.scriptsRunner(options);
	}

}


module.exports = new Manager();
