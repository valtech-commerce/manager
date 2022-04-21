//--------------------------------------------------------
//-- Manager
//--------------------------------------------------------
import { manager } from "./src/index.js";

manager.init({
	repositoryType: "single-package",
	dist: {
		node: {},
	},
	tasks: {
		documentation: {
			preRun: ({ terminal }) => {
				terminal.print("Build documentation scripts/styles").spacer();
				terminal.process.run(`npx mix build --production`, { directory: "./ressources/documentation-theme/sources" });
			},
		},
	},
});
