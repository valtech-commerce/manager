//--------------------------------------------------------
//-- Helper
//--------------------------------------------------------
'use strict';

const fsp          = require('@absolunet/fsp');
const fss          = require('@absolunet/fss');
const { terminal } = require('@absolunet/terminal');


class Helper {

	updateNodeVersion({ path }) {
		const FILE = `${path}/package.json`;
		const data = fss.readJson(FILE);
		data.engines.node = `>= ${process.versions.node}`;
		fss.writeJson(FILE, data, { space: 2 });
	}

	updateLicense({ path }) {
		fss.copy('./license', `${path}/license`);
	}

	// eslint-disable-next-line require-await
	async npmOutdated({ path, name }) {
		terminal.echo(`\n\n${name || path}\n-----------------------------------`);
		terminal.run(`cd ${path}; npm outdated; true`);
	}

	async npmInstall({ path, name }) {
		terminal.echo(`\n\n${name || path}\n-----------------------------------`);
		await fsp.remove(`${path}/node_modules`);
		await fsp.remove(`${path}/package-lock.json`);
		terminal.run(`cd ${path} && npm install --no-audit`);
	}

}


module.exports = new Helper();
