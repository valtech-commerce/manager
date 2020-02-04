//--------------------------------------------------------
//-- Documenter
//--------------------------------------------------------
import resolvePkg   from 'resolve-pkg';
import fss          from '@absolunet/fss';
import { terminal } from '@absolunet/terminal';
import env          from './environment';
import paths        from './paths';
import util         from './util';


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
	 * @param {string} [destination={@link PackagePaths}.documentation] - Path to the generated documentation.
	 */
	generateCommonAssets(destination = paths.package.documentation) {
		terminal.print('Copy documentation common assets').spacer();

		const commonPath = `${destination}/assets__`;
		fss.remove(destination);
		fss.ensureDir(commonPath);

		fss.copy(`${paths.documentationTheme}/build`, commonPath);
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
	generateAPI({ root = paths.package.root, source = paths.package.sources, destination = paths.package.documentation, depth = 1 } = {}) {
		terminal.print(`Build API documentation for ${util.relativizePath(source)}`).spacer();

		const output = `${destination}/api`;
		fss.remove(output);
		fss.ensureDir(output);

		const options = { root, source, destination: output, depth };
		const jsdocBin = `${resolvePkg('jsdoc', { cwd: __dirname })}/jsdoc.js`;
		terminal.process.run(`node ${jsdocBin} --configure ${paths.documentationTheme}/jsdoc/config.js`, {
			environment: { [env.JSDOC_CLI_KEY]: JSON.stringify(options) }
		});
		terminal.spacer(2);
	}


	/**
	 * Build text documentation.
	 *
	 * @param {object} [options] - Options.
	 * @param {string} [options.source={@link PackagePaths}.sources] - Path to source code.
	 * @param {string} [options.destination={@link PackagePaths}.documentation] - Path to the generated documentation.
	 */
	generateText({ source = paths.package.sources, destination = paths.package.documentation } = {}) {
		terminal.print(`Build text documentation for ${util.relativizePath(source)}`).spacer();

		// Temporarily redirect main url to API docs
		fss.copy(`${paths.documentationTheme}/redirect/index.html`, `${destination}/index.html`);
	}

}


export default new Documenter();
