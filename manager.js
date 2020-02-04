//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const autoprefixer = require('autoprefixer');
const cssnano      = require('cssnano');
const gulp         = require('gulp');
const gulpsass     = require('gulp-dart-sass');
const postcss      = require('gulp-postcss');
const sass         = require('sass');
const fss          = require('@absolunet/fss');
const { manager }  = require('@absolunet/manager');
const builder      = require('@absolunet/manager/dist/node/helpers/builder');
const documenter   = require('@absolunet/manager/dist/node/helpers/documenter');



manager.init({
	repositoryType: 'single-package',
	dist: {
		node: true
	},
	tasks: {
		documentation: {
			preRun: ({ terminal }) => {
				return new Promise((resolve) => {
					terminal.print('Build documentation scripts/styles').spacer();

					// SCSS
					gulp.src(`${documenter.theme.styles}/main.scss`)
						.pipe(gulpsass({
							includePaths: [documenter.theme.styles],
							functions:    {
								'dart-read-file($file)': (parameterFile) => {
									const file = `${documenter.theme.images}/${parameterFile.getValue()}`;

									if (fss.exists(file)) {
										return new sass.types.String(fss.readFile(file, 'utf8'));
									}

									throw new Error(`File '${file}' not found`);
								}
							}
						}).on('error', gulpsass.logError))
						.pipe(postcss([
							autoprefixer({ overrideBrowserslist: ['> 0.25%', 'not dead'] }),
							cssnano({ autoprefixer: false, discardUnused: false, mergeIdents: false, reduceIdents: false, zindex: false })
						]))
						.pipe(gulp.dest(documenter.theme.output))
						.on('finish', () => { terminal.print('Styles written').spacer(); resolve(); })
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
