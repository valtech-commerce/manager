/**
 * Type of repository: 'single-package', 'multi-package'.
 *
 * @typedef {string} RepositoryType
 */

/**
 * Task: 'install', 'outdated', 'build', 'watch', 'documentation', 'prepare', 'rebuild'.
 *
 * @typedef {string} Task
 */

/**
 * Types of distribution: 'browser', 'browser-es5', 'kafe', 'kafe-es5', 'node'.
 *
 * @typedef {string} DistributionType
 */

/**
 * Task hooks (install, outdated, build, watch, documentation, prepare, rebuild).
 *
 * @typedef {object} TaskHooks
 * @property {Function} preRun - Pre-run hook.
 * @property {Function} postRun - Post-run hook.
 */

/**
 * Distribution options.
 *
 * @typedef {object} DistributionOptions
 * @property {string} [source={@link PackagePaths}.sources] - Package source path.
 * @property {string} [destination={@link PackagePaths}.distributions] - Package distributions path.
 * @property {boolean} [node] - Add a Node.js distribution.
 * @property {string} [nodeEngine] - Supported Node.js versions.
 * @property {string} [nodeType] - CommonJS or Module.
 * @property {object} [web] - Web distributions options.
 * @property {Array<DistributionType>} web.types - List of web distributions.
 * @property {string} web.name - Public exposed name of package.
 * @property {object<string, string>} [web.externals] - List of required packages and their public name replacements ({@link https://webpack.js.org/configuration/externals docs}).
 * @property {Array<string>} [include] - List of globs or paths of extra files to copy from source to destination.
 */

/**
 * Manager options.
 *
 * @typedef {object} ManagerOptions
 * @property {RepositoryType} repositoryType - Type of repository.
 * @property {DistributionOptions} dist - Distribution options.
 * @property {object<Task, TaskHooks>} tasks - List of tasks with hooks to call before and after.
 */

/**
 * Current package paths.
 *
 * @typedef {object} PackagePaths
 * @property {string} root - Package root.
 * @property {string} config - Package package.json.
 * @property {string} distributions - Package distributions.
 * @property {string} documentation - Package documentation.
 * @property {string} sources - Package sources.
 */

/**
 * Subpackage paths.
 *
 * @typedef {object} SubpackagePaths
 * @property {string} distributions - Subpackage distributions.
 * @property {string} sources - Subpackage sources.
 */
