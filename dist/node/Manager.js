"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _joi = _interopRequireDefault(require("@hapi/joi"));

var _terminal = require("@absolunet/terminal");

var _dataValidation = _interopRequireDefault(require("./helpers/data-validation"));

var _environment = _interopRequireDefault(require("./helpers/environment"));

var _util = _interopRequireDefault(require("./helpers/util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------

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
    _terminal.terminal.setDefault({
      logo: ['👨‍💻', '👩‍💻'].sort(() => {
        return 0.5 - Math.random();
      }).pop(),
      textColor: _chalk.default.hex('#765432'),
      bgColor: _chalk.default.bgHex('#654321')
    });
  }
  /**
   * Update package meta.
   *
   * @async
   * @param {string} [absolutePath={@link PackagePaths}.root] - Directory path of license.
   * @returns {Promise} When method completed.
   */


  async updatePackageMeta(absolutePath) {
    // eslint-disable-line require-await
    _dataValidation.default.argument('absolutePath', absolutePath, _dataValidation.default.absolutePath);

    _util.default.updateLicense(absolutePath);
  }
  /**
   * Lists outdated packages.
   *
   * @async
   * @param {string} [absolutePath={@link PackagePaths}.root] - Directory path of the package.json.
   * @returns {Promise} When method completed.
   */


  async testOutdated(absolutePath) {
    _dataValidation.default.argument('absolutePath', absolutePath, _dataValidation.default.absolutePath);

    await _util.default.npmOutdated(absolutePath);
  }
  /**
   * Reinstall packages.
   *
   * @async
   * @param {string} [absolutePath={@link PackagePaths}.root] - Directory path of the package.json.
   * @returns {Promise} When method completed.
   */


  async installPackage(absolutePath) {
    _dataValidation.default.argument('absolutePath', absolutePath, _dataValidation.default.absolutePath);

    await _util.default.npmInstall(absolutePath);
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
    _dataValidation.default.argument('options', options, _joi.default.object({
      repositoryType: _joi.default.string().valid(...Object.values(_environment.default.REPOSITORY_TYPE)),
      restricted: _joi.default.boolean(),
      useOTP: _joi.default.boolean(),
      dist: _joi.default.object({
        source: _dataValidation.default.absolutePath,
        destination: _dataValidation.default.absolutePath,
        node: _joi.default.boolean(),
        web: _joi.default.object({
          types: _joi.default.array().items(_joi.default.string().valid(...Object.values(_environment.default.DISTRIBUTION_WEB_TYPE))).min(1).unique().required(),
          name: _dataValidation.default.variableName.required(),
          externals: _joi.default.object().pattern(/^[a-z0-9-/@]$/iu, _dataValidation.default.variableName)
        }),
        include: _joi.default.array().items(_joi.default.string())
      }).required(),
      tasks: _joi.default.object(Object.values(_environment.default.TASK).reduce((list, task) => {
        list[task] = {
          preRun: _joi.default.function(),
          postRun: _joi.default.function()
        };
        return list;
      }, {}))
    }));

    const {
      repositoryType
    } = options;
    delete options.repositoryType;
    let managerType;

    if (repositoryType === _environment.default.REPOSITORY_TYPE.singlePackage) {
      const SingleManager = require('./managers/SingleManager'); // eslint-disable-line global-require


      managerType = new SingleManager(options);
    } else if (repositoryType === _environment.default.REPOSITORY_TYPE.multiPackage) {
      const MultiManager = require('./managers/MultiManager'); // eslint-disable-line global-require


      managerType = new MultiManager(options);
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

      default:
        break;
    }

    _terminal.terminal.completionBox('Completed');
  }

}

var _default = Manager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;