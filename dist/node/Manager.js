"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeEmoji = _interopRequireDefault(require("node-emoji"));

var _brandGuidelines = _interopRequireDefault(require("@absolunet/brand-guidelines"));

var _joi = require("@absolunet/joi");

var _terminal = require("@absolunet/terminal");

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
    const mainColor = _brandGuidelines.default.styleguide.color.greyscale.nevada;
    const secondaryColor = _brandGuidelines.default.styleguide.color.greyscale.geyser;

    _terminal.terminal.setTheme({
      logo: [_nodeEmoji.default.get('male-technologist'), _nodeEmoji.default.get('female-technologist')].sort(() => {
        return 0.5 - Math.random();
      }).pop(),
      // 👨‍💻👩‍💻
      textColor: mainColor,
      backgroundColor: mainColor,
      textOnBackgroundColor: secondaryColor,
      borderColor: mainColor,
      spinnerColor: _terminal.terminal.basicColor.grey
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
    (0, _joi.validateArgument)('absolutePath', absolutePath, _joi.Joi.absolutePath());

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
    (0, _joi.validateArgument)('absolutePath', absolutePath, _joi.Joi.absolutePath());
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
    (0, _joi.validateArgument)('absolutePath', absolutePath, _joi.Joi.absolutePath());
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
    (0, _joi.validateArgument)('options', options, _joi.Joi.object({
      repositoryType: _joi.Joi.string().valid(...Object.values(_environment.default.REPOSITORY_TYPE)),
      restricted: _joi.Joi.boolean(),
      useOTP: _joi.Joi.boolean(),
      dist: _joi.Joi.object({
        source: _joi.Joi.absolutePath(),
        destination: _joi.Joi.absolutePath(),
        node: _joi.Joi.boolean(),
        web: _joi.Joi.object({
          types: _joi.Joi.array().items(_joi.Joi.string().valid(...Object.values(_environment.default.DISTRIBUTION_WEB_TYPE))).min(1).unique().required(),
          name: _joi.Joi.variableName().required(),
          externals: _joi.Joi.object().pattern(/^[a-z0-9-/@]$/iu, _joi.Joi.variableName())
        }),
        include: _joi.Joi.array().items(_joi.Joi.string())
      }).required(),
      tasks: _joi.Joi.object(Object.values(_environment.default.TASK).reduce((list, task) => {
        list[task] = {
          preRun: _joi.Joi.function(),
          postRun: _joi.Joi.function()
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

    _terminal.terminal.completionBox();
  }

}

var _default = Manager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;