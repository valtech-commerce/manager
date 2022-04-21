//--------------------------------------------------------
//-- Single manger
//--------------------------------------------------------
import fss from "@absolunet/fss";
import __ from "@absolunet/private-registry";
import { terminal } from "@absolunet/terminal";
import builder from "../helpers/builder.js";
import documenter from "../helpers/documenter.js";
import fixer from "../helpers/fixer.js";
import paths from "../helpers/paths.js";
import util from "../helpers/util.js";
import AbstractManager from "./AbstractManager.js";

/**
 * Single package manager.
 *
 * @augments AbstractManager
 */
class SingleManager extends AbstractManager {
	/**
	 * @inheritdoc
	 */
	get currentVersion() {
		if (fss.exists(paths.package.config)) {
			const { version } = fss.readJson(paths.package.config);

			return version;
		}

		return null;
	}

	/**
	 * @inheritdoc
	 */
	build(options) {
		return super.build(options, async () => {
			// Run builder
			await builder.run(__(this).get("dist"));
		});
	}

	/**
	 * @inheritdoc
	 */
	watch(options) {
		return super.watch(options, async () => {
			// Run watcher
			await builder.watch(__(this).get("dist"));
		});
	}

	/**
	 * @inheritdoc
	 */
	fix(options) {
		return super.fix(options, async () => {
			// Run fixer
			await fixer.run();
		});
	}

	/**
	 * @inheritdoc
	 */
	documentation(options) {
		return super.documentation(options, async () => {
			// API documentation
			await documenter.generateAPI();

			// Text documentation
			await documenter.generateText();
		});
	}

	/**
	 * @inheritdoc
	 */
	version(options) {
		return super.version(options, async () => {
			const version = util.incrementVersion(this.currentVersion);

			// Update version
			terminal.process.run(`npm version ${version} --no-git-tag-version`);
		});
	}
}

export default SingleManager;
