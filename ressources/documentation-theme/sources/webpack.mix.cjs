//--------------------------------------------------------
//-- Laravel Mix webpack configuration
//--------------------------------------------------------
"use strict";

const autoprefixer = require("autoprefixer");
const mix = require("laravel-mix");
const sass = require("sass");
const fss = require("@absolunet/fss");

mix
	.setPublicPath("../build")

	.babelConfig({
		presets: [
			[
				"@babel/env",
				{
					targets: "> 0.25%, not dead",
					useBuiltIns: "usage",
					corejs: "3",
				},
			],
		],
	})
	.js("scripts/index.js", "main.js")

	.options({
		postCss: [autoprefixer({ overrideBrowserslist: "> 0.25%, not dead" })],
		cssNano: {
			autoprefixer: false,
			discardUnused: false,
			mergeIdents: false,
			reduceIdents: false,
			zindex: false,
		},
	})
	.sass("styles/main.scss", "main.css", {
		sassOptions: {
			functions: {
				"dart-read-file($file)": (parameterFile) => {
					const file = `${__dirname}/images/${parameterFile.getValue()}`;
					if (fss.exists(file)) {
						return new sass.types.String(fss.readFile(file, "utf8"));
					}
					throw new Error(`File '${file}' not found`);
				},
			},
		},
	})
	.extract();
