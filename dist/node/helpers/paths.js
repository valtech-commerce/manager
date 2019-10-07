"use strict";

exports.default = void 0;

var _pkgDir = _interopRequireDefault(require("pkg-dir"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Paths
//--------------------------------------------------------
const __ = {
  root: _pkgDir.default.sync(__dirname),
  packageRoot: _fss.default.realpath(`.`)
};
/**
 * Paths.
 *
 * @hideconstructor
 */

class Paths {
  /**
   * Manager root.
   *
   * @type {string}
   */
  get root() {
    return __.root;
  }
  /**
   * Manager ressources.
   *
   * @type {string}
   */


  get ressources() {
    return `${this.root}/ressources`;
  }
  /**
   * Manager documentation theme.
   *
   * @type {string}
   */


  get documentationTheme() {
    return `${this.ressources}/documentation-theme`;
  }
  /**
   * Manager webpack entry points.
   *
   * @type {string}
   */


  get webpackEntryPoints() {
    return `${this.ressources}/webpack-entry-points`;
  }
  /**
   * Current package paths.
   *
   * @type {PackagePaths}
   */


  get package() {
    return {
      root: __.packageRoot,
      config: `${__.packageRoot}/package.json`,
      distributions: `${__.packageRoot}/dist`,
      documentation: `${__.packageRoot}/docs`,
      subpackages: `${__.packageRoot}/packages`,
      sources: `${__.packageRoot}/src`
    };
  }
  /**
   * Subpackage paths.
   *
   * @type {SubpackagePaths}
   */


  get subpackage() {
    return {
      distributions: `dist`,
      sources: `src`
    };
  }

}

var _default = new Paths();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;