//--------------------------------------------------------
//-- Builder
//--------------------------------------------------------
import path from "node:path";
import fss from "@absolunet/fss";
import { terminal } from "@absolunet/terminal";
import { transformAsync } from "@babel/core";
import babelTransformModules from "@babel/plugin-transform-modules-commonjs";
import WebpackFriendlyErrors from "@soda/friendly-errors-webpack-plugin";
import chalk from "chalk";
import WebpackCopy from "copy-webpack-plugin";
import figures from "figures";
import WebpackRemoveFiles from "remove-files-webpack-plugin";
import semver from "semver";
import webpack from "webpack";
import { merge } from "webpack-merge";
import environment from "./environment.js";
import paths from "./paths.js";
import util from "./util.js";

//-- Actions
const BUILD = "Build distribution for";
const WATCH = "Start watching in";

//-- Common
const COMMON_CONFIG = {
	mode: "none",
};

const defaultConfig = ({ type, targets, source, destination, transformModules = {} }) => {
	return {
		target: type,
		entry: `${paths.webpackEntryPoints}/default.js`,
		plugins: [
			new WebpackCopy({
				patterns: [
					{
						context: source,
						from: "**/!(*.d|*.test).js",
						to: "",
						transform: (content) => {
							return transformAsync(content, {
								compact: false,
								retainLines: true,
								presets: [
									[
										"@babel/env",
										{
											targets,
											useBuiltIns: "entry",
											corejs: "3",
											modules: false,
											exclude: ["@babel/plugin-transform-block-scoping"],
										},
									],
								],
								...transformModules,
							}).then(({ code }) => {
								return code;
							});
						},
					},
				],
			}),
			new WebpackRemoveFiles({
				after: {
					root: destination,
					log: false,
					test: [
						{
							folder: "./",
							method: (absoluteItemPath) => {
								if (/\/main\.js$/u.test(absoluteItemPath)) {
									const content = fss.readFile(absoluteItemPath, "utf8");
									if (content.includes("// @absolunet/manager decoy file")) {
										return true;
									}
								}

								return false;
							},
						},
					],
				},
			}),
		],
	};
};

//-- Node.js
const nodeConfig = (source, destination, type, target) => {
	return merge(
		COMMON_CONFIG,
		defaultConfig({
			type: "node",
			targets: { node: semver.minVersion(target).version },
			source,
			destination,
			transformModules:
				type === environment.DISTRIBUTION_NODE_TYPE.commonjs
					? {
							plugins: [[babelTransformModules, { strict: false }]],
					  }
					: {},
		})
	);
};

//-- Browser module
const browserModuleConfig = (source, destination, target) => {
	return merge(
		COMMON_CONFIG,
		defaultConfig({
			type: "web",
			targets: target || "last 1 version, not ie 11, not dead",
			source,
			destination,
		})
	);
};

//-- Browser script
const browserScriptConfig = (target) => {
	return merge(COMMON_CONFIG, {
		target: "web",
		entry: `${paths.webpackEntryPoints}/browser-script.cjs`,
		output: {
			filename: `browser-standalone.js`,
		},
		module: {
			rules: [
				{
					test: /\.js$/u,
					exclude: /node_modules/u,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								[
									"@babel/env",
									{
										targets: target || "> 0.25%, not dead",
										useBuiltIns: "usage",
										corejs: "3",
									},
								],
							],
						},
					},
				},
			],
		},
	});
};

//-- Generate a specific distribution config
const getDistributionConfig = (
	mainConfig,
	{ source, destination = paths.package.distributions, name = "", externals = {}, include = [] } = {}
) => {
	fss.ensureDir(destination);
	const finalDestination = fss.realpath(destination);

	if (mainConfig.output && mainConfig.output.filename) {
		fss.remove(`${finalDestination}/${mainConfig.output.filename}`);
	} else {
		fss.remove(finalDestination);
	}

	const config = merge(mainConfig, {
		output: {
			path: finalDestination,
		},
		plugins: [
			new webpack.DefinePlugin({
				"process.env.__PACKAGE_NAME__": JSON.stringify(name),
				"process.env.__PACKAGE_ROOT__": JSON.stringify(source),
			}),
			new WebpackFriendlyErrors({ clearConsole: false }),
		],
		externals,
	});

	// Extra files to include
	const filtered = include.filter((pattern) => {
		return !(pattern.startsWith("/") || pattern.startsWith("."));
	});

	if (filtered.length > 0) {
		config.plugins.push(
			new WebpackCopy(
				filtered.map((pattern) => {
					return {
						context: source,
						from: pattern,
						to: finalDestination,
						cache: false,
						flatten: false,
					};
				})
			)
		);
	}

	return config;
};

//-- Generate all distributions configs
const getAllDistributionsConfigs = ({ node, browser, ...options } = {}, action) => {
	const configs = [];

	options.source = options.source || paths.package.sources;
	options.destination = options.destination || paths.package.distributions;
	terminal.print(`${action} ${chalk.underline(util.relativizePath(options.source))}`);

	if (node) {
		const destination = `${options.destination}/node`;
		terminal.print(`${figures.pointerSmall} Add Node.js distribution`);
		configs.push(
			getDistributionConfig(nodeConfig(options.source, destination, node.type, node.target), {
				...options,
				destination,
			})
		);
	}

	if (browser) {
		browser.forEach(({ type, target, name, externals }) => {
			if (type === environment.DISTRIBUTION_BROWSER_TYPE.module) {
				const destination = `${options.destination}/browser`;
				terminal.print(`${figures.pointerSmall} Add browser ESM distribution`);
				configs.push(
					getDistributionConfig(browserModuleConfig(options.source, destination, target), { ...options, destination })
				);
			}

			if (type === environment.DISTRIBUTION_BROWSER_TYPE.script) {
				terminal.print(`${figures.pointerSmall} Add browser standalone script distribution`);
				configs.push(getDistributionConfig(browserScriptConfig(target), { ...options, name, externals }));
			}
		});
	}

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
			terminal.echo(stats.toString({ colors: true })).spacer(2);
			resolve();
		});
	});
};

//-- webpack watch wrapper
const webpackWatcher = (configs) => {
	return new Promise((resolve) => {
		webpack(configs).watch(
			{
				poll: 2000,
			},
			(/* error, stats */) => {
				resolve();
			}
		);
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
		return webpackRunner(
			multipleInOut
				? getMultipleInOutConfigs(options, multipleInOut, BUILD)
				: getAllDistributionsConfigs(options, BUILD)
		);
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
		return webpackWatcher(
			multipleInOut
				? getMultipleInOutConfigs(options, multipleInOut, WATCH)
				: getAllDistributionsConfigs(options, WATCH)
		);
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
		const [config] = getAllDistributionsConfigs(
			{ browser: [{ type: environment.DISTRIBUTION_BROWSER_TYPE.script }], source },
			BUILD
		);

		return webpackRunner([
			merge(config, {
				mode: "production",
				output: {
					filename: path.basename(destination),
					path: path.dirname(destination),
				},
			}),
		]);
	}
}

export default new Builder();
