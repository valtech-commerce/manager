//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
'use strict';

const inquirer  = require('inquirer');
const kebabcase = require('lodash.kebabcase');
const minimist  = require('minimist');
const semver    = require('semver');
const fss       = require('@absolunet/fss');
const terminal  = require('@absolunet/terminal');
const helper    = require('./helper');

const __           = {};
const TARBALLS_DIR = './.publish-tarballs';






class Multi {

	get version() {
		const { version } = fss.readJson('./lerna.json');

		return version;
	}

	get topologicalPackagesPaths() {
		if (!__.list) {
			const rawList = terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');
			const list    = rawList.replace(/^(?<header>info cli.+\n)(?<path>[\s\S]+)/u, '$<path>').split('\n');

			__.list = list.filter((item) => { return Boolean(item); });
		}

		return __.list;
	}






	async install({ preRun, postRun } = {}) {
		if (preRun) {
			await preRun();
		}

		if (postRun) {
			await postRun();
		}
	}


	async outdated({ preRun, postRun } = {}) {
		if (preRun) {
			await preRun();
		}

		helper.npmOutdated({ path: '.', name: 'Main' });

		this.topologicalPackagesPaths.forEach((path) => {
			helper.npmOutdated({ path });
		});

		if (postRun) {
			await postRun();
		}
	}


	async build({ preRun, postRun } = {}) {
		if (preRun) {
			await preRun();
		}

		this.topologicalPackagesPaths.forEach((path) => {

			// Spread license
			helper.updateNodeVersion({ path });

			// Keep Node.js version to current
			helper.updateNodeVersion({ path });
		});

		terminal.run(`
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);

		if (postRun) {
			await postRun();
		}
	}


	async deploy({ preRun, postRun } = {}) {
		if (preRun) {
			await preRun();
		}

		const tarballs = [];

		// Pack'em
		fss.ensureDir(TARBALLS_DIR);
		this.topologicalPackagesPaths.forEach((path) => {
			terminal.run(`
				cd ${TARBALLS_DIR}
				npm pack ${path}
			`);

			const { name, version } = fss.readJson(`${path}/package.json`);
			const tar = `${kebabcase(name)}-${version}.tgz`;

			if (fss.exists(`${TARBALLS_DIR}/${tar}`)) {
				tarballs.push(`${TARBALLS_DIR}/${tar}`);
			} else {
				throw new Error(`Tarball name mismatch '${tar}'`);
			}
		});


		// Prepare for publishing
		const tag = semver.prerelease(this.version) === null ? 'latest' : 'next';

		const { otp } = await inquirer.prompt([{
			name:     'otp',
			message:  `Please write your npm OTP :`,
			type:     'input',
			validate: (value) => {
				return (/^\d{6}$/u).test(value) ? true : `Your OTP isn't valid`;
			}
		}]);

		// Publish
		tarballs.forEach((tarball) => {
			terminal.run(`
				npm publish ${tarball} --tag=${tag} --otp=${otp}
			`);
		});

		if (postRun) {
			await postRun();
		}
	}






	async scriptsRunner({ tasks = {} } = {}) {
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
				await this.deploy(tasks.deploy);
				break;

			default:
				throw new Error('Task not defined');

		}
	}

}


module.exports = new Multi();
