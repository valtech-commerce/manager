//--------------------------------------------------------
//-- Documenter
//--------------------------------------------------------
import resolvePkg   from 'resolve-pkg';
import fss          from '@absolunet/fss';
import { terminal } from '@absolunet/terminal';
import paths        from './paths';


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
			output:  `${paths.documentationTheme}/build`,
			images:  `${paths.documentationTheme}/sources/images`,
			scripts: `${paths.documentationTheme}/sources/scripts`,
			styles:  `${paths.documentationTheme}/sources/styles`
		};
	}


	/**
	 * Copy documentation common assets to output directory.
	 *
	 * @param {string} [root={@link PackagePaths}.documentation] - Path to generated documentation root.
	 */
	generateCommonAssets(root = paths.package.documentation) {
		terminal.println('Copy documentation common assets');

		const commonPath = `${root}/common`;
		fss.remove(root);
		fss.ensureDir(commonPath);

		fss.copy(`${paths.documentationTheme}/build`, commonPath);

		// Temporarily redirect main url to API docs
		fss.copy(`${paths.documentationTheme}/redirect/index.html`, `${root}/index.html`);
	}


	/**
	 * Build API documentation via JSDoc.
	 *
	 * @param {object} [options] - Options.
	 * @param {string} [options.root={@link PackagePaths}.documentation] - Path to generated documentation root.
	 * @param {string} [options.sub] - Name of subpackage.
	 */
	generateAPI({ root = paths.package.documentation, sub = '' } = {}) {
		terminal.println('Build API documentation');

		const output = `${root}${sub ? `/${sub}` : ''}/api`;
		fss.remove(output);
		fss.ensureDir(output);

		const jsdocBin = `${resolvePkg('jsdoc', { cwd: __dirname })}/jsdoc.js`;
		terminal.run(`node ${jsdocBin} --configure ${paths.documentationTheme}/jsdoc/config.js --destination ${output}`);
	}

}


export default new Documenter();
