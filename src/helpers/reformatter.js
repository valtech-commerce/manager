//--------------------------------------------------------
//-- Reformatter
//--------------------------------------------------------
import { createRequire } from "node:module"; // eslint-disable-line node/no-missing-import
import path from "node:path"; // eslint-disable-line node/no-missing-import
import __ from "@absolunet/private-registry";
import { terminal } from "@absolunet/terminal";
import paths from "./paths.js";

/**
 * Code reformatter.
 *
 * @hideconstructor
 */
class Reformatter {
	/**
	 * Fetch Prettier binary.
	 */
	constructor() {
		const require = createRequire(import.meta.url);
		__(this).set("prettier-binary", `${path.dirname(require.resolve("prettier"))}/bin-prettier.js`);
	}

	/**
	 * Run Prettier on all package files.
	 */
	run() {
		terminal.print("Reformat code").spacer();

		terminal.process.run(`${__(this).get("prettier-binary")} --write .`, {
			directory: paths.package.root,
		});

		terminal.spacer(2);
	}
}

export default new Reformatter();
