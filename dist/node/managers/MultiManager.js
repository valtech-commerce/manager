"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _privateRegistry = _interopRequireDefault(require("@absolunet/private-registry"));

var _terminal = require("@absolunet/terminal");

var _builder = _interopRequireDefault(require("../helpers/builder"));

var _documenter = _interopRequireDefault(require("../helpers/documenter"));

var _paths = _interopRequireDefault(require("../helpers/paths"));

var _util = _interopRequireDefault(require("../helpers/util"));

var _AbstractManager = _interopRequireDefault(require("./AbstractManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------

/**
 * Multi package manager.
 *
 * @augments AbstractManager
 */
class MultiManager extends _AbstractManager.default {
  /**
   * Create a multi package manager.
   *
   * @inheritdoc
   */
  constructor(options) {
    super(options); // Get a list of all subpackages from lerna

    const rawList = _terminal.terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');

    const list = rawList.replace(/^(?<header>info cli.+\n)(?<path>[\s\S]+)/u, '$<path>').split('\n');
    const subpackagesList = list.filter(item => {
      return Boolean(item);
    }).map(item => {
      const root = _util.default.relativizePath(item);

      return {
        root,
        source: `${root}/${_paths.default.subpackage.sources}`,
        destination: `${root}/${_paths.default.subpackage.distributions}`,
        name: _path.default.basename(item)
      };
    });
    (0, _privateRegistry.default)(this).set('subpackages', subpackagesList);
  }
  /**
   * @inheritdoc
   */


  get version() {
    const file = `${_paths.default.package.root}/lerna.json`;

    if (_fss.default.exists(file)) {
      const {
        version
      } = _fss.default.readJson(file);

      return version;
    }

    return undefined;
  }
  /**
   * List of repository's subpackages.
   *
   * @type {Array<{root: string, source: string, destination: string, name: string}>}
   */


  get subpackages() {
    return (0, _privateRegistry.default)(this).get('subpackages');
  }
  /**
   * Execute async code within each subpackage.
   *
   * @async
   * @param {Function} [toExecute] - Async function to execute.
   * @returns {Promise} When all code is executed.
   */


  async forEachSubpackage(toExecute) {
    for (const subpackage of this.subpackages) {
      await toExecute(subpackage); // eslint-disable-line no-await-in-loop
    }
  }
  /**
   * @inheritdoc
   */


  install(options) {
    return super.install(options, async () => {
      // eslint-disable-line require-await
      // Let lerna do its subpackage interdependencies magic
      _terminal.terminal.println('Install subpackages dependencies and link siblings');

      _fss.default.removePattern(`${_paths.default.package.subpackages}/*/package-lock.json`);

      _terminal.terminal.run(`
				lerna clean --yes
				lerna bootstrap --no-ci
			`);
    });
  }
  /**
   * @inheritdoc
   */


  outdated(options) {
    return super.outdated(options, async () => {
      // Check outdated dependencies for all subpackages
      await this.forEachSubpackage(async ({
        root
      }) => {
        await _util.default.npmOutdated(root);
      });
    });
  }
  /**
   * @inheritdoc
   */


  build(options) {
    return super.build(options, async () => {
      // Run builder for all subpackages
      await _builder.default.run((0, _privateRegistry.default)(this).get('dist'), this.subpackages);
    });
  }
  /**
   * @inheritdoc
   */


  watch(options) {
    return super.watch(options, async () => {
      // Run watcher for all subpackages
      await _builder.default.watch((0, _privateRegistry.default)(this).get('dist'), this.subpackages);
    });
  }
  /**
   * @inheritdoc
   */


  documentation(options) {
    return super.documentation(options, async () => {
      // API and text documentation for all subpackages
      await this.forEachSubpackage(async ({
        root,
        name
      }) => {
        await _documenter.default.generateAPI({
          root,
          source: `${root}/${_paths.default.subpackage.sources}`,
          destination: `${_paths.default.package.documentation}/${name}`,
          depth: 2
        });
        await _documenter.default.generateText({
          source: `${root}/${_paths.default.subpackage.sources}`,
          destination: `${_paths.default.package.documentation}/${name}`
        });
      });
    });
  }
  /**
   * @inheritdoc
   */


  prepare(options) {
    return super.prepare(options, async () => {
      // eslint-disable-line require-await
      // Update license for all subpackages
      this.forEachSubpackage(({
        root
      }) => {
        _util.default.updateLicense(root);
      }); // Update version for all subpackages

      _terminal.terminal.run(`lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes`);
    });
  }
  /**
   * @inheritdoc
   */


  publish(options) {
    return super.publish(options, async () => {
      // Pack a tarball for all subpackages
      const tarballs = [];
      await this.forEachSubpackage(async ({
        root
      }) => {
        const {
          tarball
        } = await _util.default.npmPack(root);
        tarballs.push(tarball);
      }); // Fetch generic config

      const tag = _util.default.getTag(this.version);

      const {
        restricted
      } = (0, _privateRegistry.default)(this).get('publish');
      const otp = await _util.default.getOTP((0, _privateRegistry.default)(this).get('publish').useOTP); // Publish the tarball for all subpackages

      for (const tarball of tarballs) {
        await _util.default.npmPublish({
          tarball,
          tag,
          restricted,
          otp
        }); // eslint-disable-line no-await-in-loop
      }
    });
  }

}

var _default = MultiManager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;