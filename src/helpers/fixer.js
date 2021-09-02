//--------------------------------------------------------
//-- Fixer
//--------------------------------------------------------
import { createRequire } from "node:module"; // eslint-disable-line node/no-missing-import
import pkgDir from "pkg-dir";
import __ from "@absolunet/private-registry";
import { terminal } from "@absolunet/terminal";
import paths from "./paths.js";

/**
 * Code fixer.
 *
 * @hideconstructor
 */
class Fixer {
	/**
	 * Fetch binaries.
	 */
	constructor() {
		const require = createRequire(import.meta.url);
		__(this).set("eslint-binary", `${pkgDir.sync(require.resolve("eslint"))}/bin/eslint.js`);
		__(this).set("prettier-binary", `${pkgDir.sync(require.resolve("prettier"))}/bin-prettier.js`);
	}

	/**
	 * Run ESLint autofix and Prettier format on all package files.
	 */
	run() {
		// ESLint
		terminal.print("Autofix via ESLint").spacer();

		terminal.process.run(`${__(this).get("eslint-binary")} --ext=".js,.cjs,.mjs" --fix .`, {
			directory: paths.package.root,
		});

		terminal.echo("Autofixing completed").spacer(2);

		// Prettier
		terminal.print("Format via Prettier").spacer();

		terminal.process.run(`${__(this).get("prettier-binary")} --write .`, {
			directory: paths.package.root,
		});
	}
}

export default new Fixer();
