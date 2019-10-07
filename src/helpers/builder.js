//--------------------------------------------------------
//-- Builder
//--------------------------------------------------------
import babelAddModuleExports from 'babel-plugin-add-module-exports';
import chalk                 from 'chalk';
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
import env                   from './environment';
import paths                 from './paths';
import util                  from './util';


//-- Actions
const BUILD = 'Build distribution for';
const WATCH = 'Start watching in';


//-- Common
const COMMON_CONFIG = {
	mode:    'none',
	devtool: ''
};


//-- Node.js
const nodeConfig = (source) => {
	return merge(COMMON_CONFIG, {
		target: 'node',
		entry:  `${paths.webpackEntryPoints}/node.js`,
		plugins: [
			new WebpackDisableOutput(),
			new WebpackCopy([{
				context: source,
				from: '**/!(*.d).js',
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
};


//-- Browser
const BROWSER_CONFIG = merge(COMMON_CONFIG, {
	target: 'web',
	entry:  `${paths.webpackEntryPoints}/browser.js`,
	output: {
		filename: `${env.DISTRIBUTION_TYPE.browser}.js`
	}
});


//-- Browser ES5
const BROWSER_ES5_CONFIG = merge(BROWSER_CONFIG, {
	output: {
		filename: `${env.DISTRIBUTION_TYPE.browserES5}.js`
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
		filename: `${env.DISTRIBUTION_TYPE.kafe}.js`
	}
});


//-- kafe ES5
const KAFE_ES5_CONFIG = merge(BROWSER_ES5_CONFIG, {
	entry:  `${paths.webpackEntryPoints}/kafe.js`,
	output: {
		filename: `${env.DISTRIBUTION_TYPE.kafeES5}.js`
	}
});






//-- Generate a specific distribution config
const getDistributionConfig = (mainConfig, { source, destination = paths.package.distributions, name = '', externals = {}, include = [] } = {}) => {
	const targetedDestination = `${destination}/${mainConfig.target}`;
	fss.ensureDir(targetedDestination);
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
				'process.env.__PACKAGE_ROOT__': JSON.stringify(source)
			}),
			new WebpackFriendlyErrors({ clearConsole: false })
		],
		externals
	});

	// Extra files to include
	const filtered = include.filter((pattern) => {
		return !(pattern.startsWith('/') || pattern.startsWith('.'));
	});

	if (filtered.length !== 0) {
		config.plugins.push(new WebpackCopy(filtered.map((pattern) => {
			return {
				context: source,
				from:    pattern,
				to:      finalDestination,
				cache:   false,
				flatten: false
			};
		})));
	}

	return config;
};


//-- Generate all distributions configs
const getAllDistributionsConfigs = ({ node, web = {}, ...options } = {}, action) => {
	const configs = [];

	const types = web.types || [];
	if (node) {
		types.push('node');
	}

	options.source = fss.realpath(options.source || paths.package.sources);
	terminal.print(`${action} ${chalk.underline(util.relativizePath(options.source))}`);

	const webOptions = merge(web, options);

	types.forEach((id) => {
		switch (id) {

			case env.DISTRIBUTION_TYPE.node:
				terminal.print(`${figures.pointerSmall} Add Node.js distribution`);
				configs.push(getDistributionConfig(nodeConfig(options.source), options));
				break;

			case env.DISTRIBUTION_TYPE.browser:
				terminal.print(`${figures.pointerSmall} Add browser distribution`);
				configs.push(getDistributionConfig(BROWSER_CONFIG, webOptions));
				break;

			case env.DISTRIBUTION_TYPE.browserES5:
				terminal.print(`${figures.pointerSmall} Add browser ECMAScript 5 distribution`);
				configs.push(getDistributionConfig(BROWSER_ES5_CONFIG, webOptions));
				break;

			case env.DISTRIBUTION_TYPE.kafe:
				terminal.print(`${figures.pointerSmall} Add kafe distribution`);
				configs.push(getDistributionConfig(KAFE_CONFIG, webOptions));
				break;

			case env.DISTRIBUTION_TYPE.kafeES5:
				terminal.print(`${figures.pointerSmall} Add kafe ECMAScript 5 distribution`);
				configs.push(getDistributionConfig(KAFE_ES5_CONFIG, webOptions));
				break;

			default: break;

		}
	});

	terminal.spacer();

	return configs;
};


//-- Generate multiple in/out configs
const getMultipleInOutConfigs = (options, multipleInOut, action) => {
	const configs = multipleInOut.reduce((list, { source, destination }) => {
		list.push(...getAllDistributionsConfigs(merge(options, { source, destination }), action));

		return list;
	}, []);

	return configs;
};





//-- webpack run wrapper
const webpackRunner = (configs) => {
	return new Promise((resolve) => {
		webpack(configs).run((error, stats) => {
			terminal.echo(stats.toString({ colors: true }));
			terminal.spacer(2);
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
	 * @param {Array<{ source: string, destination: string }>} multipleInOut - List of source / destination.
	 * @returns {Promise} When runner completed.
	 */
	run(options, multipleInOut) {
		return webpackRunner(multipleInOut ? getMultipleInOutConfigs(options, multipleInOut, BUILD) : getAllDistributionsConfigs(options, BUILD));
	}


	/**
	 * Watch distributions builds.
	 *
	 * @async
	 * @param {DistributionOptions} options - Options.
	 * @param {Array<{ source: string, destination: string }>} multipleInOut - List of source / destination.
	 * @returns {Promise} When watcher completed.
	 */
	watch(options, multipleInOut) {
		return webpackWatcher(multipleInOut ? getMultipleInOutConfigs(options, multipleInOut, WATCH) : getAllDistributionsConfigs(options, WATCH));
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
		const [config] = getAllDistributionsConfigs({ web: { types: [env.DISTRIBUTION_WEB_TYPE.browserES5] }, source }, BUILD);

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
