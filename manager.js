//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import gulp from "gulp";
import gulpsass from "gulp-dart-sass";
import postcss from "gulp-postcss";
import sass from "sass";
import fss from "@absolunet/fss";
import { manager } from "@absolunet/manager"; // eslint-disable-line node/no-missing-import
import builder from "@absolunet/manager/helpers/builder"; // eslint-disable-line node/no-missing-import
import documenter from "@absolunet/manager/helpers/documenter"; // eslint-disable-line node/no-missing-import

manager.init({
	repositoryType: "single-package",
	dist: {
		node: true,
	},
	tasks: {
		documentation: {
			preRun: ({ terminal }) => {
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
								autoprefixer({ overrideBrowserslist: ["> 0.25%", "not dead"] }),
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
