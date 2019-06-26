//--------------------------------------------------------
//-- Single
//--------------------------------------------------------
'use strict';

const minimist     = require('minimist');
const fss          = require('@absolunet/fss');
const { terminal } = require('@absolunet/terminal');
const builder      = require('./builder');
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






	async installer({ preRun, postRun } = {}) {
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


	async build({ preRun, postRun } = {}, dist) {
		terminal.titleBox('Manager: Build project');
		await helper.preRunner(preRun);

		helper.updateNodeVersion();

		if (dist) {
			await builder.run(dist);
		}

		await helper.postRunner(postRun);
	}


	async watch({ preRun, postRun } = {}, dist) {
		terminal.titleBox('Manager: Watch project');
		await helper.preRunner(preRun);

		if (dist) {
			await builder.watch(dist);
		}

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






	async scriptsRunner({ tasks = {}, restricted = false, useOTP = true, dist } = {}) {
		const { task } = minimist(process.argv.slice(2));

		//-- Tasks
		switch (task) {

			case 'installer':
				await this.installer(tasks.installer);
				break;

			case 'outdated':
				await this.outdated(tasks.outdated);
				break;

			case 'build':
				await this.build(tasks.build, dist);
				break;

			case 'watch':
				await this.watch(tasks.watch, dist);
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
