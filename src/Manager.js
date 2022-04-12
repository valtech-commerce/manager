//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import { guidelines } from "@absolunet/brand-guidelines";
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
		const mainColor = guidelines.color.achromatic.gray;
		const secondaryColor = guidelines.color.achromatic.gray;

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
	 * Initialize the manager.
	 *
	 * @async
	 * @param {ManagerOptions} [options] - Options to customize the manager.
	 * @returns {Promise} When method completed.
	 * @example
	 * manager.init({
	 * 	repositoryType: "single-package",
	 * 	dist: {
	 *  	node: {},
	 *  },
	 * 	tasks: {
	 *		build: {
	 *			postRun: async () => {},
	 * 		},
	 *
	 * 		prepare: {
	 * 			preRun:  async () => {},
	 * 			postRun: async ({ terminal }) => {
	 * 				terminal.print("Enjoy");
	 * 			},
	 * 		},
	 * 	},
	 * });
	 */
	async init(options = {}) {
		validateArgument(
			"options",
			options,
			Joi.object({
				repositoryType: Joi.string().valid(...Object.values(environment.REPOSITORY_TYPE)),

				dist: Joi.object({
					source: Joi.absolutePath(),
					destination: Joi.absolutePath(),
					node: Joi.object({
						type: Joi.string().valid(...Object.values(environment.DISTRIBUTION_NODE_TYPE)),
						target: Joi.string().empty(),
					}),
					browser: Joi.array()
						.items(
							Joi.object({
								type: Joi.string()
									.valid(...Object.values(environment.DISTRIBUTION_BROWSER_TYPE))
									.required(),
								target: Joi.string().empty(),
								name: Joi.variableName().when("type", {
									is: Joi.valid(environment.DISTRIBUTION_BROWSER_TYPE.script),
									then: Joi.required(),
								}),
								externals: Joi.object().pattern(/^[a-z0-9/@-]+$/iu, Joi.variableName()),
							})
						)
						.min(1)
						.unique(),
					include: Joi.array().items(Joi.string()),
				})
					.or("node", "browser")
					.required(),

				tasks: Joi.object(
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
			case environment.TASK.version:
				await managerType.version();
				break;
			case environment.TASK.rebuild:
				await managerType.rebuild();
				break;

			default:
				break;
		}

		terminal.completionBox();
	}
}

export default Manager;
