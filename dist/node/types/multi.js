"use strict";

exports.default = void 0;

var _minimist = _interopRequireDefault(require("minimist"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _terminal = require("@absolunet/terminal");

var _paths = _interopRequireDefault(require("../helpers/paths"));

var _util = _interopRequireDefault(require("../helpers/util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
let subPackagesList = [];
/**
 * Multi-package manager.
 *
 * @hideconstructor
 */

class Multi {
  /**
   * Current multi-package version.
   *
   * @type {string}
   */
  get version() {
    const FILE = `${_paths.default.package.root}/lerna.json`;

    if (_fss.default.exists(FILE)) {
      const {
        version
      } = _fss.default.readJson(FILE);

      return version;
    }

    return undefined;
  }
  /**
   * List of subpackages root directory.
   *
   * @type {Array<string>}
   */


  get topologicalPackagesPaths() {
    if (subPackagesList.length === 0) {
      const rawList = _terminal.terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');

      const list = rawList.replace(/^(?<header>info cli.+\n)(?<path>[\s\S]+)/u, '$<path>').split('\n');
      subPackagesList = list.filter(item => {
        return Boolean(item);
      }).map(item => {
        return _util.default.relativizePath(item);
      });
    }

    return subPackagesList;
  }
  /**
   * Post-install task.
   *
   * @async
   * @param {TaskHooks} [hooks] - Custom hooks.
   * @returns {Promise} When task completed.
   */


  async postinstall({
    preRun,
    postRun
  } = {}) {
    _terminal.terminal.titleBox('Manager: Install dependencies');

    await _util.default.preRunner(preRun);

    _terminal.terminal.println('Install packages dependencies and link siblings');

    _fss.default.removePattern(`${_paths.default.package.root}/packages/*/package-lock.json`);

    _terminal.terminal.run(`
			lerna clean --yes
			lerna bootstrap --no-ci
		`);

    await _util.default.postRunner(postRun);
  }
  /**
   * Outdated task.
   *
   * @async
   * @param {TaskHooks} [hooks] - Custom hooks.
   * @returns {Promise} When task completed.
   */


  async outdated({
    preRun,
    postRun
  } = {}) {
    _terminal.terminal.titleBox('Manager: Check for outdated dependencies');

    await _util.default.preRunner(preRun);
    await _util.default.npmOutdated();

    for (const path of this.topologicalPackagesPaths) {
      await _util.default.npmOutdated(path); // eslint-disable-line no-await-in-loop
    }

    await _util.default.postRunner(postRun);
  }
  /**
   * Build task.
   *
   * @async
   * @param {TaskHooks} [hooks] - Custom hooks.
   * @param {DistributionOptions} [dist] - Distribution options.
   * @returns {Promise} When task completed.
   */


  async build({
    preRun,
    postRun
  } = {}
  /* , dist */
  ) {
    _terminal.terminal.titleBox('Manager: Build project');

    await _util.default.preRunner(preRun);

    for (const path of this.topologicalPackagesPaths) {
      _util.default.updateLicense(path);

      _util.default.updateNodeVersion(path);
    }

    _terminal.terminal.run(`
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);

    await _util.default.postRunner(postRun);
  }
  /**
   * Watch task.
   *
   * @async
   * @param {TaskHooks} [hooks] - Custom hooks.
   * @param {DistributionOptions} [dist] - Distribution options.
   * @returns {Promise} When task completed.
   */


  async watch()
  /* { preRun, postRun } = {}, dist */
  {} //

  /**
   * Assemble task.
   *
   * @async
   * @param {TaskHooks} [hooks] - Custom hooks.
   * @returns {Promise} When task completed.
   */


  async assemble()
  /* { preRun, postRun } = {} */
  {} //

  /**
   * Deploy task.
   *
   * @async
   * @param {TaskHooks} [hooks] - Custom hooks.
   * @param {object} [options] - Options.
   * @param {boolean} options.restricted - When publishing, tell the registry the package should be published restricted instead of public.
   * @param {boolean} options.useOTP - When publishing, use the two-factor authentication if enabled.
   * @returns {Promise} When task completed.
   */


  async deploy({
    preRun,
    postRun
  } = {}, {
    restricted,
    useOTP
  } = {}) {
    _terminal.terminal.titleBox('Manager: Deploy package');

    await _util.default.preRunner(preRun);
    const tarballs = [];

    for (const path of this.topologicalPackagesPaths) {
      const {
        tarball
      } = await _util.default.npmPack(path); // eslint-disable-line no-await-in-loop

      tarballs.push(tarball);
    }

    const tag = _util.default.getTag(this.version);

    const otp = await _util.default.getOTP(useOTP);

    for (const tarball of tarballs) {
      await _util.default.npmPublish({
        tarball,
        tag,
        restricted,
        otp
      }); // eslint-disable-line no-await-in-loop
    }

    await _util.default.postRunner(postRun);
  }
  /**
   * Bootstrapper.
   *
   * @async
   * @param {ManagerOptions} [options] - Options to customize the runner.
   * @returns {Promise} When task completed.
   */


  async scriptsRunner({
    tasks = {},
    restricted = false,
    useOTP = true
  } = {}) {
    const {
      task
    } = (0, _minimist.default)(process.argv.slice(2)); //-- Tasks

    switch (task) {
      case 'postinstall':
        await this.postinstall(tasks.postinstall);
        break;

      case 'outdated':
        await this.outdated(tasks.outdated);
        break;

      case 'build':
        await this.build(tasks.build);
        break;

      case 'deploy':
        await this.deploy(tasks.deploy, {
          restricted,
          useOTP
        });
        break;

      default:
        throw new Error('Task not defined');
    }

    _terminal.terminal.completionBox('Completed');
  }

}

var _default = new Multi();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;