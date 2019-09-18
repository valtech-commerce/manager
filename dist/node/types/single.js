"use strict";

exports.default = void 0;

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _terminal = require("@absolunet/terminal");

var _builder = _interopRequireDefault(require("../helpers/builder"));

var _documenter = _interopRequireDefault(require("../helpers/documenter"));

var _paths = _interopRequireDefault(require("../helpers/paths"));

var _util = _interopRequireDefault(require("../helpers/util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Single
//--------------------------------------------------------
const {
  chalk
} = _terminal.terminal;
const __ = {}; //-- Install

const install = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Install',
    banner: 'Install extra stuff',
    hooks: __.tasks.install,
    subTask
  }, async () => {
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
}; //-- Outdated


const outdated = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Outdated',
    banner: 'Check for outdated package dependencies',
    hooks: __.tasks.outdated,
    subTask
  }, async () => {
    await _util.default.npmOutdated();
  });
}; //-- Build


const build = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Build',
    banner: 'Generate package distributions',
    hooks: __.tasks.build,
    subTask
  }, async () => {
    if (__.dist) {
      await _builder.default.run(__.dist);
    }
  });
}; //-- Watch


const watch = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Watch',
    banner: 'Watch changes in sources',
    hooks: __.tasks.watch,
    subTask
  }, async () => {
    if (__.dist) {
      await _builder.default.watch(__.dist);
    }
  });
}; //-- Documentation


const documentation = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Documentation',
    banner: 'Generate documentation',
    hooks: __.tasks.documentation,
    subTask
  }, async () => {
    await _documenter.default.generateCommonAssets();
    await _documenter.default.generateAPI();
  });
}; //-- Prepare


const prepare = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Prepare',
    banner: 'Prepare package for publication',
    hooks: __.tasks.prepare,
    subTask
  }, async () => {
    // eslint-disable-line require-await
    _util.default.updateNodeVersion(); // Update version if self-reference


    const config = _fss.default.readJson(_paths.default.package.config);

    if (Object.keys(config.devDependencies).includes(config.name)) {
      config.devDependencies[config.name] = config.version;

      _fss.default.writeJson(_paths.default.package.config, config, {
        space: 2
      });

      _terminal.terminal.println(`Update self-reference version in ${chalk.underline(_util.default.relativizePath(_paths.default.package.config))}`);
    }
  });
}; //-- Rebuild


const rebuild = async ({
  subTask
} = {}) => {
  await _util.default.taskRunner({
    name: 'Rebuild',
    banner: 'Rebuild package',
    hooks: __.tasks.rebuild,
    subTask
  }, async () => {
    await build({
      subTask: true
    });
    await documentation({
      subTask: true
    });
    await prepare({
      subTask: true
    });
  });
}; //-- Publish


const publish = async ({
  subTask,
  unsafe = false
} = {}) => {
  await _util.default.taskRunner({
    name: 'Publish',
    banner: `Publish package${unsafe ? ' (unsafe)' : ''}`,
    hooks: __.tasks.publish,
    subTask
  }, async () => {
    if (!unsafe) {
      await outdated({
        subTask: true
      });
      await rebuild({
        subTask: true
      });

      _terminal.terminal.run('npm test');
    }

    const {
      tarball,
      version
    } = await _util.default.npmPack();
    await _util.default.npmPublish({
      tarball,
      tag: _util.default.getTag(version),
      restricted: __.publish.restricted,
      otp: await _util.default.getOTP(__.publish.useOTP)
    });
  });
};
/**
 * Single package manager.
 *
 * @hideconstructor
 */


class Single {
  /**
   * Current package version.
   *
   * @type {string}
   */
  get version() {
    const FILE = `${_paths.default.package.root}/package.json`;

    if (_fss.default.exists(FILE)) {
      const {
        version
      } = _fss.default.readJson(FILE);

      return version;
    }

    return undefined;
  }
  /**
   * Bootstrapper.
   *
   * @async
   * @param {ManagerOptions} [options] - Options to customize the runner.
   * @returns {Promise} When task completed.
   */


  async scriptsRunner({
    restricted = false,
    useOTP = true,
    dist,
    tasks = {}
  } = {}) {
    __.publish = {
      restricted,
      useOTP
    };
    __.dist = dist;
    __.tasks = tasks; //-- Tasks

    switch (_util.default.getTask()) {
      case 'install':
        await install();
        break;

      case 'outdated':
        await outdated();
        break;

      case 'build':
        await build();
        break;

      case 'watch':
        await watch();
        break;

      case 'documentation':
        await documentation();
        break;

      case 'prepare':
        await prepare();
        break;

      case 'rebuild':
        await rebuild();
        break;

      case 'publish':
        await publish();
        break;

      case 'publish:unsafe':
        await _util.default.confirmUnsafePublish();
        await publish({
          unsafe: true
        });
        break;

      default:
        throw new Error('Task not defined');
    }

    _terminal.terminal.completionBox('Completed');
  }

}

var _default = new Single();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;