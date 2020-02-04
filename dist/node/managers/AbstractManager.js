"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _privateRegistry = _interopRequireDefault(require("@absolunet/private-registry"));

var _terminal = require("@absolunet/terminal");

var _documenter = _interopRequireDefault(require("../helpers/documenter"));

var _environment = _interopRequireDefault(require("../helpers/environment"));

var _util = _interopRequireDefault(require("../helpers/util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Abstract manager
//--------------------------------------------------------
const runTask = ({
  task,
  subtask = '',
  context,
  grouped,
  toExecute
}) => {
  return _util.default.taskRunner({
    task: _environment.default.TASK[task + subtask],
    hooks: (0, _privateRegistry.default)(context).get('tasks')[task],
    grouped
  }, toExecute);
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
   * @param {Function} [toExecute] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  install({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'install',
      context: this,
      grouped,
      toExecute
    });
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


  outdated({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'outdated',
      context: this,
      grouped,
      toExecute: async () => {
        await _util.default.npmOutdated();
        await toExecute();
      }
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


  build({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'build',
      context: this,
      grouped,
      toExecute: async () => {
        if ((0, _privateRegistry.default)(this).get('dist')) {
          await toExecute();
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
   * @param {Function} [toExecute] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  watch({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'watch',
      context: this,
      grouped,
      toExecute: async () => {
        if ((0, _privateRegistry.default)(this).get('dist')) {
          await toExecute();
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
   * @param {Function} [toExecute] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  documentation({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'documentation',
      context: this,
      grouped,
      toExecute: async () => {
        await _documenter.default.generateCommonAssets();
        await toExecute();
      }
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


  prepare({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'prepare',
      context: this,
      grouped,
      toExecute
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


  rebuild({
    grouped
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'rebuild',
      context: this,
      grouped,
      toExecute: async () => {
        await this.build({
          grouped: true
        });
        await this.prepare({
          grouped: true
        });
        await this.documentation({
          grouped: true
        });
        await toExecute();
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
   * @param {Function} [toExecute] - Async function to execute.
   * @returns {Promise} When task completed.
   */


  publish({
    grouped,
    unsafe = false
  } = {}, toExecute = async () => {
    /**/
  }) {
    return runTask({
      task: 'publish',
      subtask: unsafe ? 'Unsafe' : '',
      context: this,
      grouped,
      toExecute: async () => {
        if (!unsafe) {
          await this.outdated({
            grouped: true
          });
          await this.rebuild({
            grouped: true
          });

          _terminal.terminal.process.run('npm test');
        }

        await toExecute();
      }
    });
  }

}

var _default = AbstractManager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;