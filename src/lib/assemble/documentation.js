//--------------------------------------------------------
//-- Assemble - Documentation
//--------------------------------------------------------
'use strict';

const resolvePkg   = require('resolve-pkg');
const fss          = require('@absolunet/fss');
const { terminal } = require('@absolunet/terminal');

const THEME       = `${__dirname}/../../../theme-documentation`;
const THEME_BUILD = `${THEME}/build`;
const THEME_JSDOC = `${THEME}/jsdoc`;

const DEFAULT_OUTPUT = './docs';






/**
 * Documentation builder.
 *
 * @hideconstructor
 */
class AssembleDocumentation {

	/**
	 * Documentation theme paths.
	 *
	 * @type {object}
	 */
	get theme() {
		return {
			images:  `${THEME}/sources/images`,
			scripts: `${THEME}/sources/scripts`,
			styles:  `${THEME}/sources/styles`,
			output:  THEME_BUILD
		};
	}


	/**
	 * Copy documentation common assets to output directory.
	 *
	 * @param {string} [root=DEFAULT_OUTPUT] - Path to generated documentation root.
	 */
	generateCommon(root = DEFAULT_OUTPUT) {
		terminal.println('Copy documentation common assets');

		const commonPath = `${root}/common`;
		fss.remove(root);
		fss.ensureDir(commonPath);

		fss.copy(THEME_BUILD, commonPath);

		// Temporarily redirect main url to API docs
		fss.copy(`${THEME}/redirect/index.html`, `${root}/index.html`);
	}


	/**
	 * Build API documentation via JSDoc.
	 *
	 * @param {object} [options] - Options.
	 * @param {string} [options.root=DEFAULT_OUTPUT] - Path to generated documentation root.
	 * @param {string} [options.sub] - Name of subpackage.
	 */
	generateAPI({ root = DEFAULT_OUTPUT, sub = '' } = {}) {
		terminal.println('Build API documentation');

		const output = `${root}${sub ? `/${sub}` : ''}/api`;
		fss.remove(output);
		fss.ensureDir(output);

		const jsdocBin = `${resolvePkg('jsdoc', { cwd: __dirname })}/jsdoc.js`;
		terminal.run(`node ${jsdocBin} --configure ${THEME_JSDOC}/config.js --destination ${output}`);
	}

}


module.exports = new AssembleDocumentation();
