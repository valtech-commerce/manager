//--------------------------------------------------------
//-- Single manger
//--------------------------------------------------------
import fss from "@absolunet/fss";
import __ from "@absolunet/private-registry";
import { terminal } from "@absolunet/terminal";
import chalk from "chalk";
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
	get version() {
		if (fss.exists(paths.package.config)) {
			const { version } = fss.readJson(paths.package.config);

			return version;
		}

		return null;
	}

	/**
	 * @inheritdoc
	 */
	install(options) {
		// eslint-disable-next-line require-await
		return super.install(options, async () => {
			// Symlink if self-reference
			const config = fss.readJson(paths.package.config);
			if (Object.keys(config.devDependencies).includes(config.name)) {
				const dependenciesPath = `${paths.package.root}/node_modules/${config.name}`;
				fss.remove(dependenciesPath);
				fss.symlink(paths.package.root, dependenciesPath);
				terminal.print(`Symlink self-reference dependency`).spacer();
			}
		});
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
	prepare(options) {
		// eslint-disable-next-line require-await
		return super.prepare(options, async () => {
			// Update version if self-reference
			const config = fss.readJson(paths.package.config);
			if (Object.keys(config.devDependencies).includes(config.name)) {
				config.devDependencies[config.name] = config.version;
				fss.writeJson(paths.package.config, config, { space: 2 });
				terminal
					.print(`Update self-reference version in ${chalk.underline(util.relativizePath(paths.package.config))}`)
					.spacer();
			}
		});
	}

	/**
	 * @inheritdoc
	 */
	publish(options) {
		return super.publish(options, async () => {
			// Pack a tarball
			const { tarball, version } = await util.npmPack();

			// Publish the tarball
			await util.npmPublish({
				tarball,
				tag: util.getTag(version),
				restricted: __(this).get("publish").restricted,
				otp: await util.getOTP(__(this).get("publish").useOTP),
			});
		});
	}
}

export default SingleManager;
