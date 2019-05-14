//--------------------------------------------------------
//-- Single
//--------------------------------------------------------
'use strict';

const minimist     = require('minimist');
const fss          = require('@absolunet/fss');
const { terminal } = require('@absolunet/terminal');
const helper       = require('./helper');


class Single {

	get version() {
		const FILE = './package.json';

		if (fss.exists(FILE)) {
			const { version } = fss.readJson(FILE);

			return version;
		}

		return undefined;
	}






	async install({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Install dependencies');
		await helper.preRunner(preRun);
		await helper.postRunner(postRun);
	}


	async outdated({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Check for outdated dependencies');
		await helper.preRunner(preRun);

		await helper.npmOutdated();

		await helper.postRunner(postRun);
	}


	async build({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Build project');
		await helper.preRunner(preRun);

		helper.updateNodeVersion();

		await helper.postRunner(postRun);
	}


	async deploy({ preRun, postRun } = {}, { restricted, useOTP } = {}) {
		terminal.titleBox('Manager: Deploy package');
		await helper.preRunner(preRun);

		const { tarball, version } = await helper.npmPack();

		await helper.npmPublish({
			tarball:    tarball,
			tag:        helper.getTag(version),
			restricted: restricted,
			otp:        await helper.getOTP(useOTP)
		});

		await helper.postRunner(postRun);
	}






	async scriptsRunner({ tasks = {}, restricted = false, useOTP = true } = {}) {
		const { task } = minimist(process.argv.slice(2));

		//-- Tasks
		switch (task) {

			case 'install':
				await this.install(tasks.install);
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


module.exports = new Single();
