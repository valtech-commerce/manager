//--------------------------------------------------------
//-- Helper
//--------------------------------------------------------
'use strict';

const fss = require('@absolunet/fss');


class Helper {

	updateNodeVersion(path) {
		const FILE = `${path}/package.json`;
		const data = fss.readJson(FILE);
		data.engines.node = `>= ${process.versions.node}`;
		fss.writeJson(FILE, data, { space:2 });
	}

}


module.exports = new Helper();
