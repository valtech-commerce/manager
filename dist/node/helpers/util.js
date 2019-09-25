"use strict";

exports.default = void 0;

var _figures = _interopRequireDefault(require("figures"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _lodash = _interopRequireDefault(require("lodash.kebabcase"));

var _minimist = _interopRequireDefault(require("minimist"));

var _npmCheck = _interopRequireDefault(require("npm-check"));

var _path = _interopRequireDefault(require("path"));

var _semver = _interopRequireDefault(require("semver"));

var _stringLength = _interopRequireDefault(require("string-length"));

var _textTable = _interopRequireDefault(require("text-table"));

var _tmp = _interopRequireDefault(require("tmp"));

var _fsp = _interopRequireDefault(require("@absolunet/fsp"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _terminal = require("@absolunet/terminal");

var _environment = _interopRequireDefault(require("./environment"));

var _paths = _interopRequireDefault(require("./paths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Util
//--------------------------------------------------------
const {
  chalk
} = _terminal.terminal;

const getTemporaryDirectory = (id = 'tmp') => {
  _tmp.default.setGracefulCleanup();

  return new Promise(resolve => {
    _tmp.default.dir({
      prefix: `absolunetmanager-${id}-`,
      unsafeCleanup: true
    }, (error, temporaryPath) => {
      if (error) {
        _terminal.terminal.error(error);

        _terminal.terminal.exit();
      }

      resolve(temporaryPath);
    });
  });
};
/**
 * Manager utils.
 *
 * @hideconstructor
 */


class Util {
  /**
   * Relativize path from package root.
   *
   * @param {string} absolutePath - Absolute package path.
   * @returns {string} Relativized path.
   */
  relativizePath(absolutePath) {
    return absolutePath.replace(_paths.default.package.root, '.');
  }
  /**
   * Post-runner wrapper.
   *
   * @returns {string} Task fetch from terminal.
   */


  getTask() {
    return (0, _minimist.default)(process.argv.slice(2)).task;
  }
  /**
   * Task runner.
   *
   * @async
   * @param {object} options - Options.
   * @param {Task} options.task - Task.
   * @param {TaskHooks} [options.hooks] - Custom hooks.
   * @param {boolean} [options.grouped=false] - Options.
   * @param {Function} main - Main runner.
   * @returns {Promise} When post-runner completed.
   */


  async taskRunner({
    task,
    hooks = {},
    grouped = false
  }, main) {
    const {
      name,
      banner
    } = _environment.default.TASK_DATA[task]; // Banner

    if (grouped) {
      _terminal.terminal.infoBox(`${name}: ${banner}`);
    } else {
      _terminal.terminal.titleBox(`Manager: ${banner}`);
    } // Pre-runner


    if (hooks.preRun) {
      _terminal.terminal.infoBox(`${name}: Custom pre-runner`);

      await hooks.preRun({
        terminal: _terminal.terminal
      });

      _terminal.terminal.infoBox(`${name}: Generic runner`);
    } else {
      _terminal.terminal.echo(`${_figures.default.pointer} ${name}: No custom pre-runner\n\n`);
    } // Generic runner


    await main(); // Post-runner

    if (hooks.postRun) {
      _terminal.terminal.infoBox(`${name}: Custom post-runner`);

      await hooks.postRun({
        terminal: _terminal.terminal
      });
    } else {
      _terminal.terminal.echo(`\n${_figures.default.pointer} ${name}: No custom post-runner`);
    } // Completion banner


    if (grouped) {
      _terminal.terminal.infoBox(`${name}: ${_figures.default.tick} Completed`);
    }
  }
  /**
   * Update Node.js engine version in package.json.
   *
   * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
   */


  updateNodeVersion(root = _paths.default.package.root) {
    const FILE = `${root}/package.json`;

    _terminal.terminal.println(`Update Node version in ${chalk.underline(this.relativizePath(FILE))}`);

    const data = _fss.default.readJson(FILE);

    data.engines.node = `>= ${process.versions.node}`;

    _fss.default.writeJson(FILE, data, {
      space: 2
    });
  }
  /**
   * Copy license file from project root to sub-package root.
   *
   * @param {string} [root={@link PackagePaths}.root] - Directory path of the sub-package licence.
   */


  updateLicense(root = _paths.default.package.root) {
    const LICENSE = `${root}/license`;

    _terminal.terminal.println(`Update license in ${chalk.underline(this.relativizePath(LICENSE))}`);

    _fss.default.copy(`${_paths.default.package.root}/license`, LICENSE);
  }
  /**
   * Check for outdated packages.
   *
   * @async
   * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
   * @param {boolean} [verbose=false] - Verbose mode.
   * @returns {Promise} When method completed.
   */


  async npmOutdated(root = _paths.default.package.root, verbose = false) {
    _terminal.terminal.println(`Checking ${chalk.underline(this.relativizePath(`${root}/package.json`))} for outdated dependencies`); // Dependencies


    const currentState = await (0, _npmCheck.default)({
      cwd: root
    });
    const results = [];

    for (const {
      moduleName: name,
      isInstalled,
      packageJson: wantedRaw,
      installed,
      latest: latestRaw
    } of currentState.get('packages')) {
      const latest = latestRaw === undefined || latestRaw === null ? 'NOT FOUND' : latestRaw;

      if (wantedRaw) {
        const wanted = _semver.default.coerce(wantedRaw).version;

        if (isInstalled) {
          if (_semver.default.coerce(latest) && _semver.default.lte(installed, latest) && _semver.default.lte(wanted, latest)) {
            if (installed === latest && wanted === latest) {
              // All is good
              if (verbose) {
                results.push([name, chalk.green(installed), chalk.green(wantedRaw), chalk.green(latest)]);
              } // Mismatch between versions

            } else {
              results.push([chalk.yellow(name), installed === latest ? installed : chalk.yellow(installed), wanted === latest ? wantedRaw : chalk.red(wantedRaw), chalk.magenta(latest)]);
            } // Current or wanted greater than latest (wut?)

          } else {
            results.push([chalk.red(name), chalk.red(installed), chalk.red(wantedRaw), chalk.red(latest)]);
          } // Not installed

        } else {
          results.push([chalk.red(name), chalk.red('NOT INSTALLED'), chalk.red(wantedRaw), chalk.red(latest)]);
        }
      }
    }

    if (results.length !== 0) {
      results.unshift([chalk.underline('Package'), ` ${chalk.underline('Current')}`, ` ${chalk.underline('Wanted')}`, ` ${chalk.underline('Latest')}`]);

      _terminal.terminal.echoIndent((0, _textTable.default)(results, {
        align: ['l', 'r', 'r', 'r'],
        stringLength: text => {
          return (0, _stringLength.default)(text);
        }
      }));

      _terminal.terminal.spacer();
    } else {
      _terminal.terminal.success(`All is good`);
    }

    _terminal.terminal.spacer();
  }
  /**
   * Install npm packages.
   *
   * @async
   * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
   * @returns {Promise} When method completed.
   */


  async npmInstall(root = _paths.default.package.root) {
    _terminal.terminal.println(`Install dependencies in ${chalk.underline(this.relativizePath(root))}`);

    await _fsp.default.remove(`${root}/node_modules`);
    await _fsp.default.remove(`${root}/package-lock.json`);

    _terminal.terminal.run(`cd ${root} && npm install --no-audit`);

    _terminal.terminal.spacer();
  }
  /**
   * Pack directory and return tarball path.
   *
   * @async
   * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
   * @returns {Promise<object<{tarball: string, version: string}>>} Tarball path and version used.
   */


  async npmPack(root = _paths.default.package.root) {
    _terminal.terminal.println(`Pack package in ${chalk.underline(this.relativizePath(root))}`);

    const directory = await getTemporaryDirectory('package-tarball');

    _terminal.terminal.run(`
			cd ${directory}
			npm pack ${_fss.default.realpath(root)}
		`);

    _terminal.terminal.spacer();

    const {
      name,
      version
    } = _fss.default.readJson(`${root}/package.json`);

    const tarball = `${directory}/${(0, _lodash.default)(name)}-${version}.tgz`;

    if (_fss.default.exists(tarball)) {
      return {
        tarball,
        version
      };
    }

    throw new Error(`Tarball name mismatch '${tarball}'`);
  }
  /**
   * Publish package.
   *
   * @async
   * @param {object} parameters - Parameters.
   * @param {string} parameters.tarball - Tarball path.
   * @param {string} parameters.tag - Tag to use.
   * @param {boolean} parameters.restricted - Tell the registry the package should be published restricted instead of public.
   * @param {boolean} parameters.otp - Use the two-factor authentication if enabled.
   * @returns {Promise} When method completed.
   */


  async npmPublish({
    tarball,
    tag,
    restricted,
    otp
  }) {
    // eslint-disable-line require-await
    _terminal.terminal.println(`Publish tarball ${chalk.underline(_path.default.basename(tarball))}`); // terminal.run(`


    console.log(`
			npm publish ${tarball} --tag=${tag} --access=${restricted ? 'restricted' : 'public'} ${otp ? `--otp=${otp}` : ''}
		`);

    _terminal.terminal.spacer();
  }
  /**
   * Get publish tag depending on version.
   *
   * @param {string} version - Version to check.
   * @returns {string} Tag.
   */


  getTag(version) {
    return _semver.default.prerelease(version) === null ? 'latest' : 'next';
  }
  /**
   * Ask user for npm's one-time password or confirm publication.
   *
   * @async
   * @param {boolean} useOTP - Get one-time password or confirm publication.
   * @returns {Promise<string|undefined>} User's one-time password.
   */


  async getOTP(useOTP) {
    const {
      otp,
      confirm
    } = await _inquirer.default.prompt([{
      name: 'otp',
      message: `Please write your npm OTP:`,
      type: 'input',
      when: () => {
        return useOTP;
      },
      validate: value => {
        return /^\d{6}$/u.test(value) ? true : `Your OTP isn't valid`;
      }
    }, {
      name: 'confirm',
      message: `Are you sure you want to publish?`,
      type: 'confirm',
      when: () => {
        return !useOTP;
      }
    }]);

    if (!(otp || confirm)) {
      _terminal.terminal.exit('Publication cancelled');
    }

    _terminal.terminal.spacer();

    return otp;
  }
  /**
   * Ask user for consent for unsafe publishing.
   *
   * @async
   * @returns {Promise} Completes if user consents.
   */


  async confirmUnsafePublish() {
    const {
      confirm
    } = await _inquirer.default.prompt([{
      name: 'confirm',
      message: `Are you sure you want to publish without any safeguards?`,
      type: 'confirm'
    }]);

    if (!confirm) {
      _terminal.terminal.exit('Publication cancelled');
    }

    _terminal.terminal.spacer();
  }

}

var _default = new Util();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;