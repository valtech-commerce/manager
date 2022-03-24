/**
 * Task: 'install', 'outdated', 'build', 'watch', 'documentation', 'prepare', 'rebuild'.
 *
 * @typedef {string} Task
 */

/**
 * Type of repository: 'single-package', 'multi-package'.
 *
 * @typedef {string} RepositoryType
 */

/**
 * Types of Node.js distribution: 'commonjs', 'module'.
 *
 * @typedef {string} NodeType
 */

/**
 * Types of browser distribution: 'script', 'module'.
 *
 * @typedef {string} BrowserType
 */

/**
 * Browser distribution options.
 *
 * @typedef {object} BrowserOptions
 * @property {BrowserType} type - Type of browser distribution.
 * @property {string} [target] - Supported browsers via a browserslist-compatible query ({@link https://babeljs.io/docs/en/options#targets docs}).
 * @property {string} [name] - Public exposed name of package for "script" distribution.
 * @property {object<string, string>} [externals] - List of required packages and their public name replacements ({@link https://webpack.js.org/configuration/externals docs}).
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
 * @property {object} [node] - Node.js distribution options.
 * @property {NodeType} [node.type=package.json type field] - Type of Node.js module system.
 * @property {string} [node.target=package.json engines.node field] - Node.js version to support ({@link https://babeljs.io/docs/en/options#targetsnode docs}).
 * @property {Array<BrowserOptions>} [browser] - Browser distributions options.
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
