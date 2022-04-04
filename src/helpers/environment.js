//--------------------------------------------------------
//-- Environment
//--------------------------------------------------------

/**
 * Environment.
 *
 * @hideconstructor
 */
class EnvironmentHelper {
	/**
	 * Temporary env variable to pass custom config to JSDoc.
	 *
	 * @type {string}
	 */
	get JSDOC_CLI_KEY() {
		return "__ABSOLUNET_MANAGER_JSDOC_CONFIG__";
	}

	/**
	 * Types of repository.
	 *
	 * @type {object<string, RepositoryType>}
	 * @property {RepositoryType} singlePackage - Single package.
	 * @property {RepositoryType} multiPackage - Multi package.
	 */
	get REPOSITORY_TYPE() {
		return {
			singlePackage: "single-package",
			multiPackage: "multi-package",
		};
	}

	/**
	 * Types of Node.js distribution.
	 *
	 * @type {object<string, NodeType>}
	 * @property {NodeType} commonjs - CommonJS module system.
	 * @property {NodeType} module - ESM module system.
	 */
	get DISTRIBUTION_NODE_TYPE() {
		return {
			commonjs: "commonjs",
			module: "module",
		};
	}

	/**
	 * Types of browser distribution.
	 *
	 * @type {object<string, BrowserType>}
	 * @property {BrowserType} script - Standalone classic script.
	 * @property {BrowserType} module - ESM module system.
	 */
	get DISTRIBUTION_BROWSER_TYPE() {
		return {
			script: "script",
			module: "module",
		};
	}

	/**
	 * Browserlist query defaults for browser distributions.
	 *
	 * @type {object<BrowserType, string>}
	 * @property {string} script - Query for standalone classic script.
	 * @property {string} module - Query for ESM module system.
	 */
	get DEFAULT_BROWSER_TARGET() {
		return {
			script: "> 0.25%, not dead",
			module: "last 1 version, not ie 11, not dead",
		};
	}

	/**
	 * Tasks.
	 *
	 * @type {object<string, Task>}
	 * @property {Task} outdated - Outdated task.
	 * @property {Task} build - Build task.
	 * @property {Task} watch - Watch task.
	 * @property {Task} fix - Fix task.
	 * @property {Task} documentation - Documentation task.
	 * @property {Task} prepare - Prepare task.
	 * @property {Task} rebuild - Rebuild task.
	 */
	get TASK() {
		return {
			outdated: "outdated",
			build: "build",
			watch: "watch",
			fix: "fix",
			documentation: "documentation",
			prepare: "prepare",
			rebuild: "rebuild",
		};
	}

	/**
	 * Tasks data.
	 *
	 * @type {object<Task, {name: string, banner: string}>}
	 */
	get TASK_DATA() {
		return {
			[this.TASK.outdated]: { name: "Outdated", banner: "Check for outdated package dependencies" },
			[this.TASK.build]: { name: "Build", banner: "Generate package distributions" },
			[this.TASK.watch]: { name: "Watch", banner: "Watch changes in sources" },
			[this.TASK.fix]: { name: "Fix", banner: "Fix code" },
			[this.TASK.documentation]: { name: "Documentation", banner: "Generate documentation" },
			[this.TASK.prepare]: { name: "Prepare", banner: "Prepare package for publication" },
			[this.TASK.rebuild]: { name: "Rebuild", banner: "Rebuild package" },
		};
	}
}

export default new EnvironmentHelper();
