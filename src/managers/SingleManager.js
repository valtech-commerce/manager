//--------------------------------------------------------
//-- Single manger
//--------------------------------------------------------
import fss             from '@absolunet/fss';
import __              from '@absolunet/private-registry';
import { terminal }    from '@absolunet/terminal';
import builder         from '../helpers/builder';
import documenter      from '../helpers/documenter';
import env             from '../helpers/environment';
import paths           from '../helpers/paths';
import util            from '../helpers/util';
import AbstractManager from './AbstractManager';
const { chalk } = terminal;


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

		return undefined;
	}


	/**
	 * @inheritdoc
	 */
	async install(options) {
		return super.install(options, async () => {

			// Symlink if self-reference
			const config = fss.readJson(paths.package.config);
			if (Object.keys(config.devDependencies).includes(config.name)) {
				const dependenciesPath = `${paths.package.root}/node_modules/${config.name}`;
				fss.remove(dependenciesPath);
				fss.symlink(paths.package.root, dependenciesPath);
				terminal.println(`Symlink self-reference dependency`);
			}
		});
	}


	/**
	 * @inheritdoc
	 */
	async build(options) {
		return super.build(options, async () => {

			// Run builder
			await builder.run(__(this).get('dist'));

		});
	}


	/**
	 * @inheritdoc
	 */
	async watch(options) {
		return super.watch(options, async () => {

			// Run watcher
			await builder.watch(__(this).get('dist'));

		});
	}


	/**
	 * @inheritdoc
	 */
	async documentation(options) {
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
	async prepare(options) {
		return super.prepare(options, async () => {

			// Current Node.js engine version
			util.updateNodeVersion();

			// Update version if self-reference
			const config = fss.readJson(paths.package.config);
			if (Object.keys(config.devDependencies).includes(config.name)) {
				config.devDependencies[config.name] = config.version;
				fss.writeJson(paths.package.config, config, { space: 2 });
				terminal.println(`Update self-reference version in ${chalk.underline(util.relativizePath(paths.package.config))}`);
			}
		});

	}


	/**
	 * @inheritdoc
	 */
	async publish(options) {
		return super.publish(options, async () => {

			// Pack a tarball
			const { tarball, version } = await util.npmPack();

			// Publish the tarball
			await util.npmPublish({
				tarball,
				tag:        util.getTag(version),
				restricted: __(this).get('publish').restricted,
				otp:        await util.getOTP(__(this).get('publish').useOTP)
			});

		});
	}

}


export default SingleManager;
