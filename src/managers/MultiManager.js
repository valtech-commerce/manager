//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
import path            from 'path';
import merge           from 'webpack-merge';
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
 * Multi package manager.
 *
 * @augments AbstractManager
 */
class MultiManager extends AbstractManager {

	/**
	 * Create a single package manager.
	 *
	 * @inheritdoc
	 */
	constructor(options) {
		super(options);

		// Get a list of all subpackages from lerna
		const rawList = terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');
		const list    = rawList.replace(/^(?<header>info cli.+\n)(?<path>[\s\S]+)/u, '$<path>').split('\n');

		const subpackagesList = list
			.filter((item) => {
				return Boolean(item);
			})
			.map((item) => {
				const root = util.relativizePath(item);

				return {
					root,
					source:      `${root}/${paths.subpackage.sources}`,
					destination: `${root}/${paths.subpackage.distributions}`,
					name:        path.basename(item)
				};
			})
		;

		__(this).set('subpackages', subpackagesList);
	}


	/**
	 * @inheritdoc
	 */
	get version() {
		const file = `${paths.package.root}/lerna.json`;

		if (fss.exists(file)) {
			const { version } = fss.readJson(file);

			return version;
		}

		return undefined;
	}


	/**
	 * xxx
	 */
	get subpackages() {
		return __(this).get('subpackages');
	}


	/**
	 * xxx
	 */
	async forEachSubpackage(callback) {
		for (const subpackage of this.subpackages) {
			await callback(subpackage);  // eslint-disable-line no-await-in-loop
		}
	}


	/**
	 * @inheritdoc
	 */
	async install(options) {
		return super.install(options, async () => {

			// Let lerna do its subpackage interdependencies magic
			terminal.println('Install subpackages dependencies and link siblings');
			fss.removePattern(`${paths.package.subpackages}/*/package-lock.json`);
			terminal.run(`
				lerna clean --yes
				lerna bootstrap --no-ci
			`);

		});
	}


	/**
	 * @inheritdoc
	 */
	async outdated(options) {
		return super.outdated(options, async () => {

			// Check outdated dependencies for all subpackages
			await this.forEachSubpackage(async ({ root }) => {
				await util.npmOutdated(root);
			});

		});
	}


	/**
	 * @inheritdoc
	 */
	async build(options) {
		return super.build(options, async () => {

			// Run builder for all subpackages
			await builder.run(__(this).get('dist'), this.subpackages);

		});
	}


	/**
	 * @inheritdoc
	 */
	async watch(options) {
		return super.watch(options, async () => {

			// Run watcher for all subpackages
			await builder.watch(__(this).get('dist'), this.subpackages);

		});
	}


	/**
	 * @inheritdoc
	 */
	async documentation(options) {
		return super.documentation(options, async () => {

			// API and text documentation for all subpackages
			await this.forEachSubpackage(async ({ root, name }) => {
				await documenter.generateAPI({
					root,
					source:      `${root}/${paths.subpackage.sources}`,
					destination: `${paths.package.documentation}/${name}`,
					depth:       2
				});

				await documenter.generateText({
					source:      `${root}/${paths.subpackage.sources}`,
					destination: `${paths.package.documentation}/${name}`,
				});
			});

		});
	}


	/**
	 * @inheritdoc
	 */
	async prepare(options) {
		return super.prepare(options, async () => {

			// Update license and current Node.js engine version for all subpackages
			await this.forEachSubpackage(async ({ root }) => {
				util.updateLicense(root);
				util.updateNodeVersion(root);
			});

			// Update version for all subpackages
			terminal.run(`lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes`);

		});
	}


	/**
	 * @inheritdoc
	 */
	async publish(options) {
		return super.publish(options, async () => {

			// Pack a tarball for all subpackages
			const tarballs = [];
			await this.forEachSubpackage(async ({ root }) => {
				const { tarball } = await util.npmPack(root);
				tarballs.push(tarball);
			});

			// Fetch generic config
			const tag        = util.getTag(this.version);
			const restricted = __(this).get('publish').restricted;
			const otp        = await util.getOTP(__(this).get('publish').useOTP);

			// Publish the tarball for all subpackages
			for (const tarball of tarballs) {
				await util.npmPublish({ tarball, tag, restricted, otp });  // eslint-disable-line no-await-in-loop
			}

		});
	}

}


export default MultiManager;
