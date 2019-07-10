//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
'use strict';

const gulp           = require('gulp');
const autoprefixer   = require('gulp-autoprefixer');
const cssnano        = require('gulp-cssnano');
const gulpsass       = require('gulp-dart-sass');
const sass           = require('sass');
const fss            = require('@absolunet/fss');
const manager        = require('./src');
const buildHelper    = require('./src/lib/build');
const assembleHelper = require('./src/lib/assemble');



manager.singleScriptsRunner({
	tasks: {
		assemble: {
			preRun: ({ terminal }) => {
				return new Promise((resolve) => {
					terminal.println('Build documentation scripts/styles');

					// SCSS
					gulp.src(`${assembleHelper.documentation.theme.styles}/main.scss`)
						.pipe(gulpsass({
							includePaths: [assembleHelper.documentation.theme.styles],
							functions:    {
								'dart-read-file($file)': (paramFile) => {
									const file = `${assembleHelper.documentation.theme.images}/${paramFile.getValue()}`;

									if (fss.exists(file)) {
										return new sass.types.String(fss.readFile(file, 'utf8'));
									}

									throw new Error(`File '${file}' not found`);
								}
							}
						}).on('error', gulpsass.logError))
						.pipe(autoprefixer({ overrideBrowserslist: ['> 0.25%', 'not dead'] }))
						.pipe(cssnano({ autoprefixer: false, discardUnused: false, mergeIdents: false, reduceIdents: false, zindex: false }))
						.pipe(gulp.dest(assembleHelper.documentation.theme.output))
						.on('finish', () => { terminal.println('Styles written'); resolve(); })
					;
				}).then(() => {
					return buildHelper.documentationTheme({
						output: assembleHelper.documentation.theme.output,
						root:   assembleHelper.documentation.theme.scripts
					});
				});
			}
		}
	}
});
