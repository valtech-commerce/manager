"use strict";

exports.default = void 0;

var _terminal = require("@absolunet/terminal");

var _environment = _interopRequireDefault(require("./helpers/environment"));

var _util = _interopRequireDefault(require("./helpers/util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
const {
  chalk
} = _terminal.terminal;
/**
 * Absolunet's npm packages manager.
 *
 * @hideconstructor
 */

class Manager {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor() {
    _terminal.terminal.setDefault({
      logo: ['👨‍💻', '👩‍💻'].sort(() => {
        return 0.5 - Math.random();
      }).pop(),
      textColor: chalk.hex('#765432'),
      bgColor: chalk.bgHex('#654321')
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


  async updatePackageMeta(...parameters) {
    // eslint-disable-line require-await
    _util.default.updateNodeVersion(...parameters);

    _util.default.updateLicense(...parameters);
  }
  /**
   * Lists outdated packages.
   *
   * @async
   * @param {...*} parameters - Parameters of {@link Util#npmOutdated}.
   * @returns {Promise} When method completed.
   */


  async testOutdated(...parameters) {
    await _util.default.npmOutdated(...parameters);
  }
  /**
   * Reinstall packages.
   *
   * @async
   * @param {...*} parameters - Parameters of {@link Util#npmInstall}.
   * @returns {Promise} When method completed.
   */


  async installPackage(...parameters) {
    await _util.default.npmInstall(...parameters);
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
    const {
      repositoryType
    } = options;
    delete options.repositoryType;
    let managerType;

    if (repositoryType === _environment.default.REPOSITORY_TYPE.singlePackage) {
      const SingleManager = require('./managers/SingleManager');

      managerType = new SingleManager(options);
    } else if (repositoryType === _environment.default.REPOSITORY_TYPE.multiPackage) {
      const MultiManager = require('./managers/MultiManager');

      managerType = new MultiManager(options);
    } else {
      throw new TypeError('repositoryType option is not valid');
    }

    switch (_util.default.getTask()) {
      case _environment.default.TASK.install:
        await managerType.install();
        break;

      case _environment.default.TASK.outdated:
        await managerType.outdated();
        break;

      case _environment.default.TASK.build:
        await managerType.build();
        break;

      case _environment.default.TASK.watch:
        await managerType.watch();
        break;

      case _environment.default.TASK.documentation:
        await managerType.documentation();
        break;

      case _environment.default.TASK.prepare:
        await managerType.prepare();
        break;

      case _environment.default.TASK.rebuild:
        await managerType.rebuild();
        break;

      case _environment.default.TASK.publish:
        await managerType.publish();
        break;

      case _environment.default.TASK.publishUnsafe:
        await _util.default.confirmUnsafePublish();
        await managerType.publish({
          unsafe: true
        });
        break;
    }

    _terminal.terminal.completionBox('Completed');
  }

}

var _default = Manager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;