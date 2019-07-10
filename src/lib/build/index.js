//--------------------------------------------------------
//-- Build
//--------------------------------------------------------
'use strict';

const figures        = require('figures');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const merge          = require('lodash.merge');
const webpack        = require('webpack');
const nodeExternals  = require('webpack-node-externals');
const fss            = require('@absolunet/fss');
const { terminal }   = require('@absolunet/terminal');


// Entry point directory
const ENTRY_PATH = `${__dirname}/entry`;


//-- Common
const COMMON_CONFIG = {
	mode:    'none',
	devtool: ''
};


//-- Node.js
const NODE_CONFIG = merge({}, COMMON_CONFIG, {
	target: 'node',
	entry:  `${ENTRY_PATH}/node.js`,
	output: {
		filename:      'node/index.js',
		libraryTarget: 'commonjs2'
	},
	externals: nodeExternals()
});


//-- Browser
const BROWSER_CONFIG = merge({}, COMMON_CONFIG, {
	target: 'web',
	entry:  `${ENTRY_PATH}/browser.js`,
	output: {
		filename: 'browser.js'
	}
});


//-- Browser ES5
const BROWSER_ES5_CONFIG = merge({}, BROWSER_CONFIG, {
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
								corejs: '2'
							}
						]]
					}
				}
			}
		]
	}
});


//-- kafe
const KAFE_CONFIG = merge({}, BROWSER_CONFIG, {
	entry:  `${ENTRY_PATH}/kafe.js`,
	output: {
		filename: 'kafe.js'
	}
});


//-- kafe ES5
const KAFE_ES5_CONFIG = merge({}, BROWSER_ES5_CONFIG, {
	entry:  `${ENTRY_PATH}/kafe.js`,
	output: {
		filename: 'kafe-es5.js'
	}
});






const getConfig = (mainConfig, { root = './', output = `${root}/dist`, name = '' } = {}) => {
	const finalRoot   = fss.realpath(root);
	const finalOutput = fss.realpath(output);

	fss.remove(`${finalOutput}/${mainConfig.output.filename}`);

	const config = merge({}, mainConfig, {
		output: {
			path: finalOutput
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env.__PACKAGE_NAME__': JSON.stringify(name),
				'process.env.__PACKAGE_ROOT__': JSON.stringify(finalRoot)
			}),
			new FriendlyErrors({ clearConsole: false })
		]
	});

	return config;
};


const getConfigs = ({ exports, ...options } = {}) => {
	const configs = [];

	Object.keys(exports).forEach((id) => {
		switch (id) {

			case 'node':
				terminal.print(`${figures.pointerSmall} Add Node.js distribution`);
				configs.push(getConfig(NODE_CONFIG, options));
				break;

			case 'browser':
				terminal.print(`${figures.pointerSmall} Add browser distribution`);
				configs.push(getConfig(BROWSER_CONFIG, options));
				break;

			case 'browserES5':
				terminal.print(`${figures.pointerSmall} Add browser ES5 distribution`);
				configs.push(getConfig(BROWSER_ES5_CONFIG, options));
				break;

			case 'kafe':
				terminal.print(`${figures.pointerSmall} Add kafe distribution`);
				configs.push(getConfig(KAFE_CONFIG, options));
				break;

			case 'kafeES5':
				terminal.print(`${figures.pointerSmall} Add kafe ES5 distribution`);
				configs.push(getConfig(KAFE_ES5_CONFIG, options));
				break;

			default: break;

		}
	});

	terminal.spacer();

	return configs;
};


const webpackRunner = (configs) => {
	return new Promise((resolve) => {
		webpack(configs).run((error, stats) => {
			terminal.echo(stats.toString({ colors: true }));
			resolve();
		});
	});
};


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
 * @property {object<boolean>} exports - List of distributions to build (node, browser, browserES5, kafe, kafeES5).
 * @property {...*} [...] - Any {@link https://webpack.js.org/configuration/ webpack options}.
 */

 /**
  * Distribution builder.
  *
  * @hideconstructor
  */
class Build {

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

		return webpackWatcher(getConfigs(options), options.output);
	}


	/**
	 * Build documentation theme scripts.
	 *
	 * @async
	 * @param {DistributionOptions} options - Options.
	 * @returns {Promise} When builder completed.
	 */
	documentationTheme(options) {
		const config = getConfigs(Object.assign({}, options, { exports: { browserES5: true } }));
		config[0].mode = 'production';
		config[0].output.filename = 'main.js';

		return webpackRunner(config);
	}

}


module.exports = new Build();
