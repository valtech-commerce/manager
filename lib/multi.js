//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
'use strict';

const minimist     = require('minimist');
const fss          = require('@absolunet/fss');
const { terminal } = require('@absolunet/terminal');
const helper       = require('./helper');

let subPackagesList = [];






class Multi {

	get version() {
		const FILE = './lerna.json';

		if (fss.exists(FILE)) {
			const { version } = fss.readJson(FILE);

			return version;
		}

		return undefined;
	}

	get topologicalPackagesPaths() {
		if (subPackagesList.length === 0) {
			const rawList = terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');
			const list    = rawList.replace(/^(?<header>info cli.+\n)(?<path>[\s\S]+)/u, '$<path>').split('\n');

			subPackagesList = list
				.filter((item) => { return Boolean(item); })
				.map((item) => { return item.replace(fss.realpath('./'), '.'); });
		}

		return subPackagesList;
	}






	async postinstall({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Install dependencies');
		await helper.preRunner(preRun);

		terminal.println('Install packages dependencies and link siblings');
		fss.removePattern('./packages/*/package-lock.json');
		terminal.run(`
			lerna clean --yes
			lerna bootstrap --no-ci
		`);

		await helper.postRunner(postRun);
	}


	async outdated({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Check for outdated dependencies');
		await helper.preRunner(preRun);

		await helper.npmOutdated();
		for (const path of this.topologicalPackagesPaths) {
			await helper.npmOutdated(path);  // eslint-disable-line no-await-in-loop
		}

		await helper.postRunner(postRun);
	}


	async build({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Build project');
		await helper.preRunner(preRun);

		for (const path of this.topologicalPackagesPaths) {
			helper.updateLicense(path);
			helper.updateNodeVersion(path);
		}

		terminal.run(`
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);

		await helper.postRunner(postRun);
	}


	async deploy({ preRun, postRun } = {}, { restricted, useOTP } = {}) {
		terminal.titleBox('Manager: Deploy package');
		await helper.preRunner(preRun);

		const tarballs = [];
		for (const path of this.topologicalPackagesPaths) {
			const { tarball } = await helper.npmPack(path);  // eslint-disable-line no-await-in-loop
			tarballs.push(tarball);
		}

		const tag = helper.getTag(this.version);
		const otp = await helper.getOTP(useOTP);

		for (const tarball of tarballs) {
			await helper.npmPublish({ tarball, tag, restricted, otp });  // eslint-disable-line no-await-in-loop
		}

		await helper.postRunner(postRun);
	}






	async scriptsRunner({ tasks = {}, restricted = false, useOTP = true } = {}) {
		const { task } = minimist(process.argv.slice(2));

		//-- Tasks
		switch (task) {

			case 'postinstall':
				await this.postinstall(tasks.postinstall);
				break;

			case 'outdated':
				await this.outdated(tasks.outdated);
				break;

			case 'build':
				await this.build(tasks.build);
				break;

			case 'deploy':
				await this.deploy(tasks.deploy, { restricted, useOTP });
				break;

			default:
				throw new Error('Task not defined');

		}

		terminal.completionBox('Completed');
	}

}


module.exports = new Multi();
