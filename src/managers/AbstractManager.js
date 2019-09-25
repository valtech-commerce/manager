//--------------------------------------------------------
//-- Abstract manager
//--------------------------------------------------------
import merge        from 'webpack-merge';
import fss          from '@absolunet/fss';
import __           from '@absolunet/private-registry';
import { terminal } from '@absolunet/terminal';
import builder      from '../helpers/builder';
import documenter   from '../helpers/documenter';
import env          from '../helpers/environment';
import paths        from '../helpers/paths';
import util         from '../helpers/util';
const { chalk } = terminal;


const runTask = ({ task, subtask = '', context, grouped, callback }) => {
	return util.taskRunner({
		task:  env.TASK[task + subtask],
		hooks: __(context).get('tasks')[task],
		grouped
	}, callback);
};






/**
 * Abstract manager class.
 *
 * @abstract
 */
class AbstractManager {

	/**
	 * Create a package manager.
	 *
	 * @param {ManagerOptions} [options] - Options to customize the manager.
	 */
	constructor({ restricted = false, useOTP = true, dist, tasks = {} } = {}) {
		__(this).set({
			publish: { restricted, useOTP },
			dist,
			tasks
		});
	}


	/**
	 * Current repository version.
	 *
	 * @type {string}
	 */
	get version() {
		throw new Error('Not implemented');
	}


	/**
	 * Install task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async install({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'install',
			context: this,
			grouped,
			callback
		});
	}


	/**
	 * Outdated task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async outdated({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'outdated',
			context: this,
			grouped,
			callback: async () => {
				await util.npmOutdated();
				await callback();
			}
		});
	}


	/**
	 * Build task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async build({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'build',
			context: this,
			grouped,
			callback: async () => {
				if (__(this).get('dist')) {
					await callback();
				}
			}
		});
	}


	/**
	 * Watch task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async watch({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'watch',
			context: this,
			grouped,
			callback: async () => {
				if (__(this).get('dist')) {
					await callback();
				}
			}
		});
	}


	/**
	 * Documentation task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async documentation({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'documentation',
			context: this,
			grouped,
			callback: async () => {
				await documenter.generateCommonAssets();
				await callback();
			}
		});
	}


	/**
	 * Prepare task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async prepare({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'prepare',
			context: this,
			grouped,
			callback
		});
	}


	/**
	 * Rebuild task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async rebuild({ grouped } = {}, callback = async () => {}) {
		return runTask({
			task: 'rebuild',
			context: this,
			grouped,
			callback: async () => {
				await this.build({ grouped: true });
				await this.documentation({ grouped: true });
				await this.prepare({ grouped: true });
				await callback();
			}
		});
	}


	/**
	 * Publish task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {boolean} [options.unsafe=false] - Publish without testing.
	 * @param {Function} [callback] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	async publish({ grouped, unsafe = false } = {}, callback = async () => {}) {
		return runTask({
			task: 'publish',
			subtask: unsafe ? 'Unsafe' : '',
			context: this,
			grouped,
			callback: async () => {
				if (!unsafe) {
					await this.outdated({ grouped: true });
					await this.rebuild({ grouped: true });
					terminal.run('npm test');
				}

				await callback();
			}
		});
	}

}


export default AbstractManager;
