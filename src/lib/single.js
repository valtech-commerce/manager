//--------------------------------------------------------
//-- Single
//--------------------------------------------------------
'use strict';

const minimist       = require('minimist');
const fss            = require('@absolunet/fss');
const { terminal }   = require('@absolunet/terminal');
const helper         = require('./helper');
const buildHelper    = require('./build');
const assembleHelper = require('./assemble');


/**
 * Single package manager.
 *
 * @hideconstructor
 */
class Single {

	/**
	 * Current package version.
	 *
	 * @type {string}
	 */
	get version() {
		const FILE = './package.json';

		if (fss.exists(FILE)) {
			const { version } = fss.readJson(FILE);

			return version;
		}

		return undefined;
	}




	/**
	 * Installer task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @returns {Promise} When task completed.
		*/
	async installer({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Install dependencies');
		await helper.preRunner(preRun);
		await helper.postRunner(postRun);
	}


	/**
	 * Outdated task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @returns {Promise} When task completed.
	 */
	async outdated({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Check for outdated dependencies');
		await helper.preRunner(preRun);

		await helper.npmOutdated();

		await helper.postRunner(postRun);
	}


	/**
	 * Build task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @param {DistributionOptions} [dist] - Distribution options.
	 * @returns {Promise} When task completed.
	 */
	async build({ preRun, postRun } = {}, dist) {
		terminal.titleBox('Manager: Build project');
		await helper.preRunner(preRun);

		if (dist) {
			await buildHelper.run(dist);
		}

		await helper.postRunner(postRun);
	}


	/**
	 * Watch task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @param {DistributionOptions} [dist] - Distribution options.
	 * @returns {Promise} When task completed.
	 */
	async watch({ preRun, postRun } = {}, dist) {
		terminal.titleBox('Manager: Watch project');
		await helper.preRunner(preRun);

		if (dist) {
			await buildHelper.watch(dist);
		}

		await helper.postRunner(postRun);
	}


	/**
	 * Assemble task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @returns {Promise} When task completed.
	 */
	async assemble({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Assemble project for release');
		await helper.preRunner(preRun);

		helper.updateNodeVersion();
		await assembleHelper.documentation.generateCommon();
		await assembleHelper.documentation.generateAPI();

		await helper.postRunner(postRun);
	}


	/**
	 * Deploy task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @param {object} [options] - Options.
	 * @param {boolean} options.restricted - When publishing, tell the registry the package should be published restricted instead of public.
	 * @param {boolean} options.useOTP - When publishing, use the two-factor authentication if enabled.
	 * @returns {Promise} When task completed.
	 */
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





	/**
	 * Bootstrapper.
	 *
	 * @async
	 * @param {RunnerOptions} [options] - Options to customize the runner.
	 * @returns {Promise} When task completed.
	 */
	async scriptsRunner({ restricted = false, useOTP = true, dist, tasks = {} } = {}) {
		const { task } = minimist(process.argv.slice(2));
		// const selfManage = fss.realpath('./') === fss.realpath(`${__dirname}/..`);

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

			case 'assemble':
				await this.assemble(tasks.assemble);
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
