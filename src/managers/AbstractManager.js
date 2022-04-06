//--------------------------------------------------------
//-- Abstract manager
//--------------------------------------------------------
import fss from "@absolunet/fss";
import __ from "@absolunet/private-registry";
import documenter from "../helpers/documenter.js";
import environment from "../helpers/environment.js";
import paths from "../helpers/paths.js";
import util from "../helpers/util.js";

const runTask = ({ task, subtask = "", context, grouped, toExecute }) => {
	return util.taskRunner(
		{
			task: environment.TASK[task + subtask],
			hooks: __(context).get("tasks")[task],
			grouped,
		},
		toExecute
	);
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
	constructor({ dist, tasks = {} } = {}) {
		if (dist.node && !(dist.node.type && dist.node.target) && fss.exists(paths.package.config)) {
			const { engines: { node: version } = {}, type = environment.DISTRIBUTION_NODE_TYPE.commonjs } = fss.readJson(
				paths.package.config
			);

			dist.node.type = dist.node.type || type;
			dist.node.target = dist.node.target || version;
		}

		__(this).set({
			dist,
			tasks,
		});
	}

	/**
	 * Current repository version.
	 *
	 * @type {string}
	 */
	get version() {
		throw new Error("Not implemented");
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
	outdated(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "outdated",
			context: this,
			grouped,
			toExecute: async () => {
				await util.npmOutdated();
				await toExecute();
			},
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
	build(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "build",
			context: this,
			grouped,
			toExecute: async () => {
				if (__(this).get("dist")) {
					await toExecute();
				}
			},
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
	watch(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "watch",
			context: this,
			grouped,
			toExecute: async () => {
				if (__(this).get("dist")) {
					await toExecute();
				}
			},
		});
	}

	/**
	 * Fix task.
	 *
	 * @async
	 * @param {object} [options] - Options.
	 * @param {boolean} [options.grouped=false] - If is called in a grouped task.
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When task completed.
	 */
	fix(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "fix",
			context: this,
			grouped,
			toExecute,
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
	documentation(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "documentation",
			context: this,
			grouped,
			toExecute: async () => {
				await documenter.generateCommonAssets();
				await toExecute();
			},
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
	prepare(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "prepare",
			context: this,
			grouped,
			toExecute: async () => {
				await util.updateLicense();
				await toExecute();
			},
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
	rebuild(
		{ grouped } = {},
		toExecute = async () => {
			/**/
		}
	) {
		return runTask({
			task: "rebuild",
			context: this,
			grouped,
			toExecute: async () => {
				await this.fix({ grouped: true });
				await this.build({ grouped: true });
				await this.prepare({ grouped: true });
				await this.documentation({ grouped: true });
				await toExecute();
			},
		});
	}
}

export default AbstractManager;
