//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const multi = require('./lib/multi');


class Manager {

	async multiScriptsRunner() {
		await multi.scriptsRunner();
	}

}


module.exports = new Manager();
