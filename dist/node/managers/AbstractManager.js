"use strict";

exports.default = void 0;

var _webpackMerge = _interopRequireDefault(require("webpack-merge"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _privateRegistry = _interopRequireDefault(require("@absolunet/private-registry"));

var _terminal = require("@absolunet/terminal");

var _builder = _interopRequireDefault(require("../helpers/builder"));

var _documenter = _interopRequireDefault(require("../helpers/documenter"));

var _environment = _interopRequireDefault(require("../helpers/environment"));

var _paths = _interopRequireDefault(require("../helpers/paths"));

var _util = _interopRequireDefault(require("../helpers/util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Abstract manager
//--------------------------------------------------------
const {
  chalk
} = _terminal.terminal;

const runTask = ({
  task,
  subtask = '',
  context,
  grouped,
  callback
}) => {
  return _util.default.taskRunner({
    task: _environment.default.TASK[task + subtask],
    hooks: (0, _privateRegistry.default)(context).get('tasks')[task],
    grouped
  }, callback);
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
  constructor({
    restricted = false,
    useOTP = true,
    dist,
    tasks = {}
  } = {}) {
    (0, _privateRegistry.default)(this).set({
      publish: {
        restricted,
        useOTP
      },
      dist,
      tasks
    });
  }
  /**
   * Current repository version.
   *
   * @type {string}
   */


  get version() {
    throw new Error('Not implemented');
  }
  /**
   * Install task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async install({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'install',
      context: this,
      grouped,
      callback
    });
  }
  /**
   * Outdated task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async outdated({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'outdated',
      context: this,
      grouped,
      callback: async () => {
        await _util.default.npmOutdated();
        await callback();
      }
    });
  }
  /**
   * Build task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async build({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'build',
      context: this,
      grouped,
      callback: async () => {
        if ((0, _privateRegistry.default)(this).get('dist')) {
          await callback();
        }
      }
    });
  }
  /**
   * Watch task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async watch({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'watch',
      context: this,
      grouped,
      callback: async () => {
        if ((0, _privateRegistry.default)(this).get('dist')) {
          await callback();
        }
      }
    });
  }
  /**
   * Documentation task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async documentation({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'documentation',
      context: this,
      grouped,
      callback: async () => {
        await _documenter.default.generateCommonAssets();
        await callback();
      }
    });
  }
  /**
   * Prepare task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async prepare({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'prepare',
      context: this,
      grouped,
      callback
    });
  }
  /**
   * Rebuild task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async rebuild({
    grouped
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'rebuild',
      context: this,
      grouped,
      callback: async () => {
        await this.build({
          grouped: true
        });
        await this.documentation({
          grouped: true
        });
        await this.prepare({
          grouped: true
        });
        await callback();
      }
    });
  }
  /**
   * Publish task.
   *
   * @async
   * @param {object} [options] - Options.
   * @param {boolean} [options.grouped=false] - If is called in a grouped task.
   * @param {boolean} [options.unsafe=false] - Publish without testing.
   * @param {Function} [callback] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  async publish({
    grouped,
    unsafe = false
  } = {}, callback = async () => {}) {
    return runTask({
      task: 'publish',
      subtask: unsafe ? 'Unsafe' : '',
      context: this,
      grouped,
      callback: async () => {
        if (!unsafe) {
          await this.outdated({
            grouped: true
          });
          await this.rebuild({
            grouped: true
          });

          _terminal.terminal.run('npm test');
        }

        await callback();
      }
    });
  }

}

var _default = AbstractManager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;