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
	 * Types of web distribution.
	 *
	 * @type {object<string, DistributionType>}
	 * @property {DistributionType} browser - Browser.
	 * @property {DistributionType} browserES5 - Browser transpilied into ECMAScript 5.
	 * @property {DistributionType} kafe - A kafe package.
	 * @property {DistributionType} kafeES5 - A kafe package transpilied into ECMAScript 5.
	 */
	get DISTRIBUTION_WEB_TYPE() {
		return {
			browser: "browser",
			browserES5: "browser-es5",
			kafe: "kafe",
			kafeES5: "kafe-es5",
		};
	}

	/**
	 * Types of distribution.
	 *
	 * @type {object<string, DistributionType>}
	 * @property {DistributionType} browser - Browser.
	 * @property {DistributionType} browserES5 - Browser transpilied into ECMAScript 5.
	 * @property {DistributionType} kafe - A kafe package.
	 * @property {DistributionType} kafeES5 - A kafe package transpilied into ECMAScript 5.
	 * @property {DistributionType} node - Node.js.
	 */
	get DISTRIBUTION_TYPE() {
		return Object.assign({}, this.DISTRIBUTION_WEB_TYPE, {
			node: "node",
		});
	}

	/**
	 * Tasks.
	 *
	 * @type {object<string, Task>}
	 * @property {Task} install - Install task.
	 * @property {Task} outdated - Outdated task.
	 * @property {Task} build - Build task.
	 * @property {Task} watch - Watch task.
	 * @property {Task} fix - Fix task.
	 * @property {Task} documentation - Documentation task.
	 * @property {Task} prepare - Prepare task.
	 * @property {Task} rebuild - Rebuild task.
	 * @property {Task} publish - Publish task.
	 * @property {Task} publishUnsafe - Unsafe publish task.
	 */
	get TASK() {
		return {
			install: "install",
			outdated: "outdated",
			build: "build",
			watch: "watch",
			fix: "fix",
			documentation: "documentation",
			prepare: "prepare",
			rebuild: "rebuild",
			publish: "publish",
			publishUnsafe: "publish:unsafe",
		};
	}

	/**
	 * Tasks data.
	 *
	 * @type {object<Task, {name: string, banner: string}>}
	 */
	get TASK_DATA() {
		return {
			[this.TASK.install]: { name: "Install", banner: "Install extra stuff" },
			[this.TASK.outdated]: { name: "Outdated", banner: "Check for outdated package dependencies" },
			[this.TASK.build]: { name: "Build", banner: "Generate package distributions" },
			[this.TASK.watch]: { name: "Watch", banner: "Watch changes in sources" },
			[this.TASK.fix]: { name: "Fix", banner: "Fix code" },
			[this.TASK.documentation]: { name: "Documentation", banner: "Generate documentation" },
			[this.TASK.prepare]: { name: "Prepare", banner: "Prepare package for publication" },
			[this.TASK.rebuild]: { name: "Rebuild", banner: "Rebuild package" },
			[this.TASK.publish]: { name: "Publish", banner: "Publish package" },
			[this.TASK.publishUnsafe]: { name: "Publish", banner: "Publish package (unsafe)" },
		};
	}
}

export default new EnvironmentHelper();
