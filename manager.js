//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import fss from "@absolunet/fss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import gulp from "gulp";
import gulpsass from "gulp-dart-sass";
import postcss from "gulp-postcss";
import sass from "sass";
import { manager } from "./src/index.js";

manager.init({
	repositoryType: "single-package",
	dist: {
		node: {},
	},
	tasks: {
		documentation: {
			preRun: async ({ terminal }) => {
				/* eslint-disable node/no-unsupported-features/es-syntax */
				const { default: builder } = await import("./src/helpers/builder.js");
				const { default: documenter } = await import("./src/helpers/documenter.js");
				const { default: environment } = await import("./src/helpers/environment.js");
				/* eslint-enable node/no-unsupported-features/es-syntax */

				return new Promise((resolve) => {
					terminal.print("Build documentation scripts/styles").spacer();

					// SCSS
					gulp
						.src(`${documenter.theme.styles}/main.scss`)
						.pipe(
							gulpsass({
								includePaths: [documenter.theme.styles],
								functions: {
									"dart-read-file($file)": (parameterFile) => {
										const file = `${documenter.theme.images}/${parameterFile.getValue()}`;

										if (fss.exists(file)) {
											return new sass.types.String(fss.readFile(file, "utf8"));
										}

										throw new Error(`File '${file}' not found`);
									},
								},
							}).on("error", gulpsass.logError)
						)
						.pipe(
							postcss([
								autoprefixer({ overrideBrowserslist: environment.DEFAULT_BROWSER_TARGET.script }),
								cssnano({
									autoprefixer: false,
									discardUnused: false,
									mergeIdents: false,
									reduceIdents: false,
									zindex: false,
								}),
							])
						)
						.pipe(gulp.dest(documenter.theme.output))
						.on("finish", () => {
							terminal.print("Styles written").spacer();
							resolve();
						});
				}).then(() => {
					return builder.documentationTheme({
						source: documenter.theme.scripts,
						destination: `${documenter.theme.output}/main.js`,
					});
				});
			},
		},
	},
});
