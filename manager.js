//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const gulp         = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cssnano      = require('gulp-cssnano');
const gulpsass     = require('gulp-dart-sass');
const sass         = require('sass');
const fss          = require('@absolunet/fss');
const manager      = require('@absolunet/manager');
const builder      = require('@absolunet/manager/dist/node/helpers/builder');
const documenter   = require('@absolunet/manager/dist/node/helpers/documenter');



manager.singleScriptsRunner({
	dist: {
		node: true
	},
	tasks: {
		documentation: {
			preRun: ({ terminal }) => {
				return new Promise((resolve) => {
					terminal.println('Build documentation scripts/styles');

					// SCSS
					gulp.src(`${documenter.theme.styles}/main.scss`)
						.pipe(gulpsass({
							includePaths: [documenter.theme.styles],
							functions:    {
								'dart-read-file($file)': (paramFile) => {
									const file = `${documenter.theme.images}/${paramFile.getValue()}`;

									if (fss.exists(file)) {
										return new sass.types.String(fss.readFile(file, 'utf8'));
									}

									throw new Error(`File '${file}' not found`);
								}
							}
						}).on('error', gulpsass.logError))
						.pipe(autoprefixer({ overrideBrowserslist: ['> 0.25%', 'not dead'] }))
						.pipe(cssnano({ autoprefixer: false, discardUnused: false, mergeIdents: false, reduceIdents: false, zindex: false }))
						.pipe(gulp.dest(documenter.theme.output))
						.on('finish', () => { terminal.println('Styles written'); resolve(); })
					;
				}).then(() => {
					return builder.documentationTheme({
						source:      documenter.theme.scripts,
						destination: `${documenter.theme.output}/main.js`
					});
				});
			}
		}
	}
});
