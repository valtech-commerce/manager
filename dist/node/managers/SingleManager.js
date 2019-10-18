"use strict";

exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

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
//-- Single manger
//--------------------------------------------------------

/**
 * Single package manager.
 *
 * @augments AbstractManager
 */
class SingleManager extends _AbstractManager.default {
  /**
   * @inheritdoc
   */
  get version() {
    if (_fss.default.exists(_paths.default.package.config)) {
      const {
        version
      } = _fss.default.readJson(_paths.default.package.config);

      return version;
    }

    return undefined;
  }
  /**
   * @inheritdoc
   */


  install(options) {
    return super.install(options, async () => {
      // eslint-disable-line require-await
      // Symlink if self-reference
      const config = _fss.default.readJson(_paths.default.package.config);

      if (Object.keys(config.devDependencies).includes(config.name)) {
        const dependenciesPath = `${_paths.default.package.root}/node_modules/${config.name}`;

        _fss.default.remove(dependenciesPath);

        _fss.default.symlink(_paths.default.package.root, dependenciesPath);

        _terminal.terminal.println(`Symlink self-reference dependency`);
      }
    });
  }
  /**
   * @inheritdoc
   */


  build(options) {
    return super.build(options, async () => {
      // Run builder
      await _builder.default.run((0, _privateRegistry.default)(this).get('dist'));
    });
  }
  /**
   * @inheritdoc
   */


  watch(options) {
    return super.watch(options, async () => {
      // Run watcher
      await _builder.default.watch((0, _privateRegistry.default)(this).get('dist'));
    });
  }
  /**
   * @inheritdoc
   */


  documentation(options) {
    return super.documentation(options, async () => {
      // API documentation
      await _documenter.default.generateAPI(); // Text documentation

      await _documenter.default.generateText();
    });
  }
  /**
   * @inheritdoc
   */


  prepare(options) {
    return super.prepare(options, async () => {
      // eslint-disable-line require-await
      // Update version if self-reference
      const config = _fss.default.readJson(_paths.default.package.config);

      if (Object.keys(config.devDependencies).includes(config.name)) {
        config.devDependencies[config.name] = config.version;

        _fss.default.writeJson(_paths.default.package.config, config, {
          space: 2
        });

        _terminal.terminal.println(`Update self-reference version in ${_chalk.default.underline(_util.default.relativizePath(_paths.default.package.config))}`);
      }
    });
  }
  /**
   * @inheritdoc
   */


  publish(options) {
    return super.publish(options, async () => {
      // Pack a tarball
      const {
        tarball,
        version
      } = await _util.default.npmPack(); // Publish the tarball

      await _util.default.npmPublish({
        tarball,
        tag: _util.default.getTag(version),
        restricted: (0, _privateRegistry.default)(this).get('publish').restricted,
        otp: await _util.default.getOTP((0, _privateRegistry.default)(this).get('publish').useOTP)
      });
    });
  }

}

var _default = SingleManager;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;