"use strict";

exports.default = void 0;

var _resolvePkg = _interopRequireDefault(require("resolve-pkg"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _terminal = require("@absolunet/terminal");

var _paths = _interopRequireDefault(require("./paths"));

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
   * @param {string} [root={@link PackagePaths}.documentation] - Path to generated documentation root.
   */


  generateCommonAssets(root = _paths.default.package.documentation) {
    _terminal.terminal.println('Copy documentation common assets');

    const commonPath = `${root}/common`;

    _fss.default.remove(root);

    _fss.default.ensureDir(commonPath);

    _fss.default.copy(`${_paths.default.documentationTheme}/build`, commonPath); // Temporarily redirect main url to API docs


    _fss.default.copy(`${_paths.default.documentationTheme}/redirect/index.html`, `${root}/index.html`);
  }
  /**
   * Build API documentation via JSDoc.
   *
   * @param {object} [options] - Options.
   * @param {string} [options.root={@link PackagePaths}.documentation] - Path to generated documentation root.
   * @param {string} [options.sub] - Name of subpackage.
   */


  generateAPI({
    root = _paths.default.package.documentation,
    sub = ''
  } = {}) {
    _terminal.terminal.println('Build API documentation');

    const output = `${root}${sub ? `/${sub}` : ''}/api`;

    _fss.default.remove(output);

    _fss.default.ensureDir(output);

    const jsdocBin = `${(0, _resolvePkg.default)('jsdoc', {
      cwd: __dirname
    })}/jsdoc.js`;

    _terminal.terminal.run(`node ${jsdocBin} --configure ${_paths.default.documentationTheme}/jsdoc/config.js --destination ${output}`);
  }

}

var _default = new Documenter();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;