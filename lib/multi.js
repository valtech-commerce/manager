//--------------------------------------------------------
//-- Manager - Multi
//--------------------------------------------------------
'use strict';

const glob     = require('glob');
const inquirer = require('inquirer');
const minimist = require('minimist');
const fss      = require('@absolunet/fss');
const terminal = require('@absolunet/terminal');


class ManagerMulti {

	get version() {
		const { version } = fss.readJson('./lerna.json');

		return version;
	}


	spreadLicense() {
		glob.sync('packages/*/', { realpath:true }).forEach((path) => {
			fss.copy('./license', `${path}/license`);
		});
	}


	bump() {
		this.spreadLicense();
		terminal.run(`
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);
	}


	async publish() {
		this.spreadLicense();

		const { otp } = await inquirer.prompt([{
			name:     'otp',
			message:  `Veuillez fournir votre OTP npm :`,
			type:     'input',
			validate: (value) => {
				return (/^\d{6}$/u).test(value) ? true : `Votre OTP n'est pas valide`;
			}
		}]);

		terminal.run(`
			NPM_CONFIG_OTP=${otp}
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);
	}






	async scriptsRunner() {
		const { task } = minimist(process.argv.slice(2));

		//-- Tasks
		switch (task) {

			case 'bump':
				this.bump();
				break;

			case 'publish':
				await this.publish();
				break;

			default:
				throw new Error('Task not defined');

		}
	}

}


module.exports = new ManagerMulti();
