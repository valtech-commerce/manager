"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _resolvePkg = _interopRequireDefault(require("resolve-pkg"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _terminal = require("@absolunet/terminal");

var _environment = _interopRequireDefault(require("./environment"));

var _paths = _interopRequireDefault(require("./paths"));

var _util = _interopRequireDefault(require("./util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Documenter
//--------------------------------------------------------

/**
 * Documentation builder.
 *
 * @hideconstructor
 */
class Documenter {
  /**
   * Documentation theme paths.
   *
   * @type {object}
   */
  get theme() {
    return {
      output: `${_paths.default.documentationTheme}/build`,
      images: `${_paths.default.documentationTheme}/sources/images`,
      scripts: `${_paths.default.documentationTheme}/sources/scripts`,
      styles: `${_paths.default.documentationTheme}/sources/styles`
    };
  }
  /**
   * Copy documentation common assets to output directory.
   *
   * @param {string} [destination={@link PackagePaths}.documentation] - Path to the generated documentation.
   */


  generateCommonAssets(destination = _paths.default.package.documentation) {
    _terminal.terminal.print('Copy documentation common assets').spacer();

    const commonPath = `${destination}/assets__`;

    _fss.default.remove(destination);

    _fss.default.ensureDir(commonPath);

    _fss.default.copy(`${_paths.default.documentationTheme}/build`, commonPath);
  }
  /**
   * Build API documentation via JSDoc.
   *
   * @param {object} [options] - Options.
   * @param {string} [options.root={@link PackagePaths}.root] - Root to the package.
   * @param {string} [options.source={@link PackagePaths}.sources] - Path to source code.
   * @param {string} [options.destination={@link PackagePaths}.documentation] - Path to the generated documentation.
   * @param {number} [options.depth=1] - Directory depth relative to the documentation root.
   */


  generateAPI({
    root = _paths.default.package.root,
    source = _paths.default.package.sources,
    destination = _paths.default.package.documentation,
    depth = 1
  } = {}) {
    _terminal.terminal.print(`Build API documentation for ${_util.default.relativizePath(source)}`).spacer();

    const output = `${destination}/api`;

    _fss.default.remove(output);

    _fss.default.ensureDir(output);

    const options = {
      root,
      source,
      destination: output,
      depth
    };
    const jsdocBin = `${(0, _resolvePkg.default)('jsdoc', {
      cwd: __dirname
    })}/jsdoc.js`;

    _terminal.terminal.process.run(`node ${jsdocBin} --configure ${_paths.default.documentationTheme}/jsdoc/config.js`, {
      environment: {
        [_environment.default.JSDOC_CLI_KEY]: JSON.stringify(options)
      }
    });

    _terminal.terminal.spacer(2);
  }
  /**
   * Build text documentation.
   *
   * @param {object} [options] - Options.
   * @param {string} [options.source={@link PackagePaths}.sources] - Path to source code.
   * @param {string} [options.destination={@link PackagePaths}.documentation] - Path to the generated documentation.
   */


  generateText({
    source = _paths.default.package.sources,
    destination = _paths.default.package.documentation
  } = {}) {
    _terminal.terminal.print(`Build text documentation for ${_util.default.relativizePath(source)}`).spacer(); // Temporarily redirect main url to API docs


    _fss.default.copy(`${_paths.default.documentationTheme}/redirect/index.html`, `${destination}/index.html`);
  }

}

var _default = new Documenter();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;