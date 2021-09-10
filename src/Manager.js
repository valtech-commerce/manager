//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import brand from "@absolunet/brand-guidelines";
import { Joi, validateArgument } from "@absolunet/joi";
import { terminal } from "@absolunet/terminal";
import emoji from "node-emoji";
import environment from "./helpers/environment.js";
import util from "./helpers/util.js";
import MultiManager from "./managers/MultiManager.js";
import SingleManager from "./managers/SingleManager.js";

/**
 * Absolunet's npm packages manager.
 *
 * @hideconstructor
 */
class Manager {
	/**
	 * Create a Manager.
	 */
	constructor() {
		const mainColor = brand.styleguide.color.greyscale.nevada;
		const secondaryColor = brand.styleguide.color.greyscale.geyser;

		terminal.setTheme({
			logo: emoji.get("technologist"), // 🧑‍💻
			textColor: mainColor,
			backgroundColor: mainColor,
			textOnBackgroundColor: secondaryColor,
			borderColor: mainColor,
			spinnerColor: terminal.basicColor.grey,
		});
	}

	/**
	 * Update package meta.
	 *
	 * @async
	 * @param {string} [absolutePath={@link PackagePaths}.root] - Directory path of license.
	 * @returns {Promise} When method completed.
	 */
	// eslint-disable-next-line require-await
	async updatePackageMeta(absolutePath) {
		validateArgument("absolutePath", absolutePath, Joi.absolutePath());

		util.updateLicense(absolutePath);
	}

	/**
	 * Lists outdated packages.
	 *
	 * @async
	 * @param {string} [absolutePath={@link PackagePaths}.root] - Directory path of the package.json.
	 * @returns {Promise} When method completed.
	 */
	async testOutdated(absolutePath) {
		validateArgument("absolutePath", absolutePath, Joi.absolutePath());

		await util.npmOutdated(absolutePath);
	}

	/**
	 * Reinstall packages.
	 *
	 * @async
	 * @param {string} [absolutePath={@link PackagePaths}.root] - Directory path of the package.json.
	 * @returns {Promise} When method completed.
	 */
	async installPackage(absolutePath) {
		validateArgument("absolutePath", absolutePath, Joi.absolutePath());

		await util.npmInstall(absolutePath);
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
	async init(options = {}) {
		validateArgument(
			"options",
			options,
			Joi.object({
				repositoryType: Joi.string().valid(...Object.values(environment.REPOSITORY_TYPE)),
				restricted: Joi.boolean(),
				useOTP: Joi.boolean(),

				dist: Joi.object({
					source: Joi.absolutePath(),
					destination: Joi.absolutePath(),
					node: Joi.boolean(),
					web: Joi.object({
						types: Joi.array()
							.items(Joi.string().valid(...Object.values(environment.DISTRIBUTION_WEB_TYPE)))
							.min(1)
							.unique()
							.required(),
						name: Joi.variableName().required(),
						externals: Joi.object().pattern(/^[a-z0-9-/@]$/iu, Joi.variableName()),
					}),
					include: Joi.array().items(Joi.string()),
				}).required(),

				tasks: Joi.object(
					// eslint-disable-next-line unicorn/prefer-object-from-entries
					Object.values(environment.TASK).reduce((list, task) => {
						list[task] = {
							preRun: Joi.function(),
							postRun: Joi.function(),
						};

						return list;
					}, {})
				),
			})
		);

		const { repositoryType } = options;
		delete options.repositoryType;

		let managerType;

		if (repositoryType === environment.REPOSITORY_TYPE.singlePackage) {
			managerType = new SingleManager(options);
		} else if (repositoryType === environment.REPOSITORY_TYPE.multiPackage) {
			managerType = new MultiManager(options);
		}

		switch (util.getTask()) {
			case environment.TASK.install:
				await managerType.install();
				break;
			case environment.TASK.outdated:
				await managerType.outdated();
				break;

			case environment.TASK.build:
				await managerType.build();
				break;
			case environment.TASK.watch:
				await managerType.watch();
				break;
			case environment.TASK.fix:
				await managerType.fix();
				break;
			case environment.TASK.documentation:
				await managerType.documentation();
				break;
			case environment.TASK.prepare:
				await managerType.prepare();
				break;
			case environment.TASK.rebuild:
				await managerType.rebuild();
				break;

			case environment.TASK.publish:
				await managerType.publish();
				break;

			case environment.TASK.publishUnsafe:
				await util.confirmUnsafePublish();
				await managerType.publish({ unsafe: true });
				break;

			default:
				break;
		}

		terminal.completionBox();
	}
}

export default Manager;
