"use strict";

// eslint-disable-next-line no-undef
const fss = require("@absolunet/fss");

const { source, destination } = JSON.parse(process.env.__ABSOLUNET_MANAGER_JSDOC_CONFIG__);
const readme = fss.realpath(`${source}/../readme.md`);

// eslint-disable-next-line no-undef
module.exports = {
	plugins: ["plugins/underscore"],
	recurseDepth: 10,
	source: {
		include: [readme, source],
		includePattern: ".js$",
		excludePattern: "",
	},
	sourceType: "module",
	tags: {
		allowUnknownTags: false,
		dictionaries: ["jsdoc"],
	},
	templates: {
		cleverLinks: false,
		monospaceLinks: false,
	},

	opts: {
		destination,
		template: __dirname, // eslint-disable-line no-undef
		encoding: "utf8",
		recurse: true,
		verbose: true,
	},
	docdash: {
		static: true, // Display the static members inside the navbar
		sort: false, // Sort the methods in the navbar
		sectionOrder: [
			// Order the main section in the navbar (default order shown here)
			"Modules",
			"Classes",
			"Externals",
			"Events",
			"Namespaces",
			"Mixins",
			"Tutorials",
			"Interfaces",
		],
		search: false, // Display seach box above navigation which allows to search/filter navigation items
		collapse: false, // Collapse navigation by default except current object's navigation of the current page
		wrap: true, // Wrap long navigation names instead of trimming them
		typedefs: true, // Include typedefs in menu
		navLevel: 10, // depth level to show in navbar, starting at 0 (false or -1 to disable)
		private: true, // set to false to not show @private in navbar
		removeQuotes: "none", // Remove single and double quotes, trim removes only surrounding ones
	},
};
