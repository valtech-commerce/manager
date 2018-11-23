//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
'use strict';

const inquirer = require('inquirer');
const minimist = require('minimist');
const fss      = require('@absolunet/fss');
const terminal = require('@absolunet/terminal');
const helper   = require('./helper');

const __ = {};






class Multi {

	get version() {
		const { version } = fss.readJson('./lerna.json');

		return version;
	}

	get topologicalPackagesPaths() {
		if (!__.list) {
			const rawList = terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');
			const list    = rawList.replace(/^(info cli.+\n)([\s\S]+)/u, '$2').split('\n');

			__.list = list.filter((item) => { return Boolean(item); });
		}

		return __.list;
	}






	outdated() {
		terminal.echo(`\n\nMain\n-----------------------------------`);
		terminal.run(`npm outdated; true`);

		this.topologicalPackagesPaths.forEach((path) => {
			terminal.echo(`\n\n${path}\n-----------------------------------`);
			terminal.run(`cd ${path}; npm outdated; true`);
		});
	}


	build() {
		this.topologicalPackagesPaths.forEach((path) => {

			// Spread license
			fss.copy('./license', `${path}/license`);

			// Keep Node.js version to current
			helper.updateNodeVersion(path);
		});

		terminal.run(`
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);
	}


	async deploy() {
		const { otp } = await inquirer.prompt([{
			name:     'otp',
			message:  `Please write your npm OTP :`,
			type:     'input',
			validate: (value) => {
				return (/^\d{6}$/u).test(value) ? true : `Your OTP isn't valid`;
			}
		}]);

		this.topologicalPackagesPaths.forEach((path) => {
			terminal.run(`
				cd ${path}
				npm publish --otp=${otp}
			`);
		});
	}






	async scriptsRunner() {
		const { task } = minimist(process.argv.slice(2));

		//-- Tasks
		switch (task) {

			case 'outdated':
				this.outdated();
				break;

			case 'build':
				this.build();
				break;

			case 'deploy':
				await this.deploy();
				break;

			default:
				throw new Error('Task not defined');

		}
	}

}


module.exports = new Multi();
