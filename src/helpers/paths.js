//--------------------------------------------------------
//-- Paths
//--------------------------------------------------------
import fss from '@absolunet/fss';


const __ = {
	root:        fss.realpath(`${__dirname}/../../..`),
	packageRoot: fss.realpath(`.`)
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
			root:          __.packageRoot,
			config:        `${__.packageRoot}/package.json`,
			distributions: `${__.packageRoot}/dist`,
			documentation: `${__.packageRoot}/docs`,
			subpackages:   `${__.packageRoot}/packages`,
			sources:       `${__.packageRoot}/src`
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
			sources:       `src`
		};
	}

}


export default new Paths();
