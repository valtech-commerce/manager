//--------------------------------------------------------
//-- Abstract manager
//--------------------------------------------------------
import __           from '@absolunet/private-registry';
import { terminal } from '@absolunet/terminal';
import documenter   from '../helpers/documenter';
import env          from '../helpers/environment';
import util         from '../helpers/util';


const runTask = ({ task, subtask = '', context, grouped, toExecute }) => {
	return util.taskRunner({
		task:  env.TASK[task + subtask],
		hooks: __(context).get('tasks')[task],
		grouped
	}, toExecute);
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
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	install({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'install',
			context: this,
			grouped,
			toExecute
		});
	}


	/**
	 * Outdated task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	outdated({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'outdated',
			context: this,
			grouped,
			toExecute: async () => {
				await util.npmOutdated();
				await toExecute();
			}
		});
	}


	/**
	 * Build task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	build({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'build',
			context: this,
			grouped,
			toExecute: async () => {
				if (__(this).get('dist')) {
					await toExecute();
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
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	watch({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'watch',
			context: this,
			grouped,
			toExecute: async () => {
				if (__(this).get('dist')) {
					await toExecute();
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
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	documentation({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'documentation',
			context: this,
			grouped,
			toExecute: async () => {
				await documenter.generateCommonAssets();
				await toExecute();
			}
		});
	}


	/**
	 * Prepare task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	prepare({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'prepare',
			context: this,
			grouped,
			toExecute
		});
	}


	/**
	 * Rebuild task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	rebuild({ grouped } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'rebuild',
			context: this,
			grouped,
			toExecute: async () => {
				await this.build({ grouped: true });
				await this.prepare({ grouped: true });
				await this.documentation({ grouped: true });
				await toExecute();
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
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	publish({ grouped, unsafe = false } = {}, toExecute = async () => { /**/ }) {
		return runTask({
			task: 'publish',
			subtask: unsafe ? 'Unsafe' : '',
			context: this,
			grouped,
			toExecute: async () => {
				if (!unsafe) {
					await this.outdated({ grouped: true });
					await this.rebuild({ grouped: true });
					terminal.process.run('npm test');
				}

				await toExecute();
			}
		});
	}

}


export default AbstractManager;
