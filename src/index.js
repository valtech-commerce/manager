//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import { terminal } from '@absolunet/terminal';
import util         from './helpers/util';
import multi        from './multi';
import single       from './single';
const { chalk } = terminal;


/**
 * Task hooks (installer, postinstall, outdated, build, watch, assemble, deploy).
 *
 * @typedef {object} TaskHooks
 * @property {Function} preRun - Pre-run hook.
 * @property {Function} postRun - Post-run hook.
 */
/**
 * Manager options.
 *
 * @typedef {object} ManagerOptions
 * @property {Function} [restricted=false] - When publishing, tell the registry the package should be published restricted instead of public.
 * @property {Function} [useOTP=true] - When publishing, use the two-factor authentication if enabled.
 * @property {DistributionOptions} dist - Distribution options.
 * @property {object<TaskHooks>} tasks - List of tasks with hooks to call before and after.
 */

/**
 * Absolunet's npm packages manager.
 *
 * @hideconstructor
 */
class Manager {

	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		terminal.setDefault({
			logo:         ['👨‍💻', '👩‍💻'].sort(() => { return 0.5 - Math.random(); }).pop(),
			textColor:    chalk.hex('#765432'),
			bgColor:      chalk.bgHex('#654321')
		});
	}


	/**
	 * Current package or multi-package version.
	 *
	 * @type {string}
	 */
	get version() {
		return multi.version || single.version;
	}


	/**
	 * Update package meta.
	 *
	 * @async
	 * @param {...*} parameters - Parameters of {@link Util#updateNodeVersion} and {@link Util#updateLicense}.
	 * @returns {Promise} When method completed.
	 */
	async updatePackageMeta(...parameters) {  // eslint-disable-line require-await
		util.updateNodeVersion(...parameters);
		util.updateLicense(...parameters);
	}


	/**
	 * Lists outdated packages.
	 *
	 * @async
	 * @param {...*} parameters - Parameters of {@link Util#npmOutdated}.
	 * @returns {Promise} When method completed.
	 */
	async testOutdated(...parameters) {
		await util.npmOutdated(...parameters);
	}


	/**
	 * Reinstall packages.
	 *
	 * @async
	 * @param {...*} parameters - Parameters of {@link Util#npmInstall}.
	 * @returns {Promise} When method completed.
	 */
	async installPackage(...parameters) {
		await util.npmInstall(...parameters);
	}

	/**
	 * Bootstrap the CLI runner for single-package repository.
	 *
	 * @async
	 * @param {...*} parameters - Parameters of {@link Single#scriptsRunner}.
	 * @returns {Promise} When method completed.
	 * @example
	 * manager.singleScriptsRunner({
	 * 	tasks: {
	 *		build: {
	 *			postRun: async () => {}
	 * 		},
	 *
	 * 		deploy: {
	 * 			preRun:  async () => {},
	 * 			postRun: async ({ terminal }) => {
	 * 				terminal.print('Enjoy');
	 * 			}
	 * 		}
	 * 	}
	 * });
	 */
	async singleScriptsRunner(...parameters) {
		await single.scriptsRunner(...parameters);
	}

	/**
	 * Bootstrap the CLI runner for multi-package repository.
	 *
	 * @async
	 * @param {...*} parameters - Parameters of {@link Multi#scriptsRunner}.
	 * @returns {Promise} When method completed.
	 * @example
	 * manager.multiScriptsRunner({
		* tasks: {
		*		build: {
		*			postRun: async () => {}
		* 		},
		*
		* 		deploy: {
		* 			preRun:  async () => {},
		* 			postRun: async ({ terminal }) => {
		* 				terminal.print('Enjoy');
		* 			}
		* 		}
		* 	}
		* });
		*/
	async multiScriptsRunner(...parameters) {
		await multi.scriptsRunner(...parameters);
	}

}

/**
 * Exports an instance of {@link Manager}.
 *
 * @module @absolunet/manager
 */
export default new Manager();
