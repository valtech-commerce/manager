//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import { terminal } from '@absolunet/terminal';
import env          from './helpers/environment';
import util         from './helpers/util';
const { chalk } = terminal;


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
	 * Initialize the manager.
	 *
	 * @async
	 * @param {ManagerOptions} [options] - Options to customize the manager.
	 * @returns {Promise} When method completed.
	 * @example
	 * manager.init({
	 * 	repositoryType: 'single-package',
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
	async init(options) {
		const { repositoryType } = options;
		delete options.repositoryType;

		let managerType;

		if (repositoryType === env.REPOSITORY_TYPE.singlePackage) {
			const SingleManager = require('./managers/SingleManager');
			managerType = new SingleManager(options);

		} else if (repositoryType === env.REPOSITORY_TYPE.multiPackage) {
			const MultiManager = require('./managers/MultiManager');
			managerType = new MultiManager(options);

		} else {
			throw new TypeError('repositoryType option is not valid');
		}


		switch (util.getTask()) {

			case env.TASK.install:       await managerType.install(); break;
			case env.TASK.outdated:      await managerType.outdated(); break;

			case env.TASK.build:         await managerType.build(); break;
			case env.TASK.watch:         await managerType.watch(); break;
			case env.TASK.documentation: await managerType.documentation(); break;
			case env.TASK.prepare:       await managerType.prepare(); break;
			case env.TASK.rebuild:       await managerType.rebuild(); break;

			case env.TASK.publish:       await managerType.publish(); break;

			case env.TASK.publishUnsafe:
				await util.confirmUnsafePublish();
				await managerType.publish({ unsafe: true });
				break;

		}

		terminal.completionBox('Completed');
	}

}


export default Manager;
