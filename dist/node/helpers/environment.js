"use strict";

exports.default = void 0;

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
    return '__ABSOLUNET_MANAGER_JSDOC_CONFIG__';
  }
  /**
   * Types of repository.
   *
   * @type {object<string, RepositoryType>}
   * @property {string} singlePackage - Single package.
   * @property {string} multiPackage - Multi package.
   */


  get REPOSITORY_TYPE() {
    return {
      singlePackage: 'single-package',
      multiPackage: 'multi-package'
    };
  }
  /**
   * Tasks.
   *
   * @type {object<string, Task>}
   * @property {string} install - Install task.
   * @property {string} outdated - Outdated task.
   * @property {string} build - Build task.
   * @property {string} watch - Watch task.
   * @property {string} documentation - Documentation task.
   * @property {string} prepare - Prepare task.
   * @property {string} rebuild - Rebuild task.
   * @property {string} publish - Publish task.
   * @property {string} publishUnsafe - Unsafe publish task.
   */


  get TASK() {
    return {
      install: 'install',
      outdated: 'outdated',
      build: 'build',
      watch: 'watch',
      documentation: 'documentation',
      prepare: 'prepare',
      rebuild: 'rebuild',
      publish: 'publish',
      publishUnsafe: 'publish:unsafe'
    };
  }
  /**
   * Tasks data.
   *
   * @type {object<Task, {name: string, banner: string}>}
   */


  get TASK_DATA() {
    return {
      [this.TASK.install]: {
        name: 'Install',
        banner: 'Install extra stuff'
      },
      [this.TASK.outdated]: {
        name: 'Outdated',
        banner: 'Check for outdated package dependencies'
      },
      [this.TASK.build]: {
        name: 'Build',
        banner: 'Generate package distributions'
      },
      [this.TASK.watch]: {
        name: 'Watch',
        banner: 'Watch changes in sources'
      },
      [this.TASK.documentation]: {
        name: 'Documentation',
        banner: 'Generate documentation'
      },
      [this.TASK.prepare]: {
        name: 'Prepare',
        banner: 'Prepare package for publication'
      },
      [this.TASK.rebuild]: {
        name: 'Rebuild',
        banner: 'Rebuild package'
      },
      [this.TASK.publish]: {
        name: 'Publish',
        banner: 'Publish package'
      },
      [this.TASK.publishUnsafe]: {
        name: 'Publish',
        banner: 'Publish package (unsafe)'
      }
    };
  }

}

var _default = new EnvironmentHelper();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;