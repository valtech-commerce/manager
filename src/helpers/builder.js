//--------------------------------------------------------
//-- Builder
//--------------------------------------------------------
import babelAddModuleExports from 'babel-plugin-add-module-exports';
import WebpackCopy           from 'copy-webpack-plugin';
import WebpackDisableOutput  from 'disable-output-webpack-plugin';
import figures               from 'figures';
import WebpackFriendlyErrors from 'friendly-errors-webpack-plugin';
import path                  from 'path';
import webpack               from 'webpack';
import merge                 from 'webpack-merge';
import fss                   from '@absolunet/fss';
import { terminal }          from '@absolunet/terminal';
import { transformAsync }    from '@babel/core';
import babelTransformModules from '@babel/plugin-transform-modules-commonjs';
import paths                 from './paths';


//-- Common
const COMMON_CONFIG = {
	mode:    'none',
	devtool: ''
};


//-- Node.js
const NODE_CONFIG = merge(COMMON_CONFIG, {
	target: 'node',
	entry:  `${paths.webpackEntryPoints}/node.js`,
	plugins: [
		new WebpackDisableOutput(),
		new WebpackCopy([{
			context: paths.package.sources,
			from: '**/*.js',
			to: '',
			cache: true,
			transform: (content) => {
				return transformAsync(content, {
					plugins: [
						[babelTransformModules, { strict: true }],
						[babelAddModuleExports, { addDefaultProperty: true }]
					]
				})
					.then(({ code }) => { return code; })
				;
			}
		}])

	]

});


//-- Browser
const BROWSER_CONFIG = merge(COMMON_CONFIG, {
	target: 'web',
	entry:  `${paths.webpackEntryPoints}/browser.js`,
	output: {
		filename: 'browser.js'
	}
});


//-- Browser ES5
const BROWSER_ES5_CONFIG = merge(BROWSER_CONFIG, {
	output: {
		filename: 'browser-es5.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/u,
				exclude: /node_modules/u,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [[
							'@babel/env',
							{
								targets: '> 0.25%, not dead',
								useBuiltIns: 'usage',
								corejs: '3'
							}
						]]
					}
				}
			}
		]
	}
});


//-- kafe
const KAFE_CONFIG = merge(BROWSER_CONFIG, {
	entry:  `${paths.webpackEntryPoints}/kafe.js`,
	output: {
		filename: 'kafe.js'
	}
});


//-- kafe ES5
const KAFE_ES5_CONFIG = merge(BROWSER_ES5_CONFIG, {
	entry:  `${paths.webpackEntryPoints}/kafe.js`,
	output: {
		filename: 'kafe-es5.js'
	}
});






//-- Generate a specific distribution config
const getConfig = (mainConfig, { source = paths.package.sources, destination = paths.package.distributions, name = '', externals = {} } = {}) => {
	const targetedDestination = `${destination}/${mainConfig.target}`;
	fss.ensureDir(targetedDestination);

	const finalSource      = fss.realpath(source);
	const finalDestination = fss.realpath(targetedDestination);

	if (mainConfig.output && mainConfig.output.filename) {
		fss.remove(`${finalDestination}/${mainConfig.output.filename}`);
	} else {
		fss.remove(finalDestination);
	}

	const config = merge(mainConfig, {
		output: {
			path: finalDestination
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env.__PACKAGE_NAME__': JSON.stringify(name),
				'process.env.__PACKAGE_ROOT__': JSON.stringify(finalSource)
			}),
			new WebpackFriendlyErrors({ clearConsole: false })
		],
		externals
	});

	return config;
};


//-- Generate all distributions configs
const getConfigs = ({ node, web = {}, ...options } = {}) => {
	const configs = [];

	const types = web.types || [];
	if (node) {
		types.push('node');
	}

	const webOptions = merge(web, options);

	types.forEach((id) => {
		switch (id) {

			case 'node':
				terminal.print(`${figures.pointerSmall} Add Node.js distribution`);
				configs.push(getConfig(NODE_CONFIG, options));
				break;

			case 'browser':
				terminal.print(`${figures.pointerSmall} Add browser distribution`);
				configs.push(getConfig(BROWSER_CONFIG, webOptions));
				break;

			case 'browserES5':
				terminal.print(`${figures.pointerSmall} Add browser ES5 distribution`);
				configs.push(getConfig(BROWSER_ES5_CONFIG, webOptions));
				break;

			case 'kafe':
				terminal.print(`${figures.pointerSmall} Add kafe distribution`);
				configs.push(getConfig(KAFE_CONFIG, webOptions));
				break;

			case 'kafeES5':
				terminal.print(`${figures.pointerSmall} Add kafe ES5 distribution`);
				configs.push(getConfig(KAFE_ES5_CONFIG, webOptions));
				break;

			default: break;

		}
	});

	terminal.spacer();

	return configs;
};






//-- webpack run wrapper
const webpackRunner = (configs) => {
	return new Promise((resolve) => {
		webpack(configs).run((error, stats) => {
			terminal.echo(stats.toString({ colors: true }));
			resolve();
		});
	});
};


//-- webpack watch wrapper
const webpackWatcher = (configs, output) => {
	return new Promise((resolve) => {
		webpack(configs).watch({
			ignored: [output],
			poll: 2000
		}, (/* error, stats */) => {
			resolve();
		});
	});
};






/**
 * Distribution options.
 *
 * @typedef {object} DistributionOptions
 * @property {string} [source={@link PackagePaths}.sources] - Package source path.
 * @property {string} [destination={@link PackagePaths}.distributions] - Package distributions path.
 * @property {boolean} [node] - Add a Node.js distribution.
 * @property {object} [web] - Web distributions options.
 * @property {Array<string>} web.types - List of web distributions (browser, browerES5, kafe, kafe, kafeES5).
 * @property {string} web.name - Public exposed name of package.
 * @property {object<string>} [web.externals] - List of required packages and their public name replacements ({@link https://webpack.js.org/configuration/externals docs}).
 */

 /**
  * Distribution builder.
  *
  * @hideconstructor
  */
class Builder {

	/**
	 * Build distributions.
	 *
	 * @async
	 * @param {DistributionOptions} options - Options.
	 * @returns {Promise} When runner completed.
	 */
	run(options) {
		terminal.print('Build distributions');

		return webpackRunner(getConfigs(options));
	}


	/**
	 * Watch distributions builds.
	 *
	 * @async
	 * @param {DistributionOptions} options - Options.
	 * @returns {Promise} When watcher completed.
	 */
	watch(options) {
		terminal.print('Start watching distributions');

		return webpackWatcher(getConfigs(options));
	}


	/**
	 * Build documentation theme scripts.
	 *
	 * @async
	 * @param {object} options - Options.
	 * @param {string} options.source - Path to documentation source scripts.
	 * @param {string} options.destination - Path to documentation build script file.
	 * @returns {Promise} When builder completed.
	 */
	documentationTheme({ source, destination }) {
		const [config] = getConfigs({ web: { types: ['browserES5'] }, source });

		return webpackRunner([merge(config, {
			mode: 'production',
			output: {
				filename: path.basename(destination),
				path:     path.dirname(destination)
			}
		})]);
	}

}


export default new Builder();
