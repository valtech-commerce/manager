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

const defaultConfig = ({ type, targets, source, destination, syntax, babelPlugins = [] }) => {
	const isTypeScript = syntax === environment.DISTRIBUTION_SYNTAX_TYPE.typescript;

	const transformBabelPlugins = [...babelPlugins];
	if (isTypeScript) {
		transformBabelPlugins.unshift("@babel/plugin-transform-typescript");
	}

	return {
		target: type,
		entry: `${paths.webpackEntryPoints}/default.js`,
		plugins: [
			new WebpackCopy({
				patterns: [
					{
						context: source,
						from: `**/!(*.d|*.test).${isTypeScript ? "ts" : "js"}`,
						to: ({ context, absoluteFilename }) => {
							return isTypeScript
								? path.format({
										dir: path.resolve(destination + path.dirname(absoluteFilename.substring(context.length))),
										name: path.basename(absoluteFilename, ".ts"),
										ext: ".js",
								  })
								: "";
						},
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
								plugins: transformBabelPlugins,
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
									if (content.includes("// @valtech-commerce/manager decoy file")) {
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
const nodeConfig = (source, destination, syntax, type, target) => {
	return merge(
		COMMON_CONFIG,
		defaultConfig({
			type: "node",
			targets: { node: semver.minVersion(target).version },
			source,
			destination,
			syntax,
			babelPlugins:
				type === environment.DISTRIBUTION_NODE_TYPE.commonjs ? [[babelTransformModules, { strict: false }]] : [],
		})
	);
};

//-- Browser module
const browserModuleConfig = (source, destination, syntax, target) => {
	return merge(
		COMMON_CONFIG,
		defaultConfig({
			type: "web",
			targets: target || environment.DEFAULT_BROWSER_TARGET.module,
			source,
			destination,
			syntax,
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
										targets: target || environment.DEFAULT_BROWSER_TARGET.script,
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
			getDistributionConfig(nodeConfig(options.source, destination, options.syntax, node.type, node.target), {
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
					getDistributionConfig(browserModuleConfig(options.source, destination, options.syntax, target), {
						...options,
						destination,
					})
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
}

export default new Builder();
