//--------------------------------------------------------
//-- Single
//--------------------------------------------------------
import fss          from '@absolunet/fss';
import { terminal } from '@absolunet/terminal';
import builder      from './helpers/builder';
import documenter   from './helpers/documenter';
import paths        from './helpers/paths';
import util         from './helpers/util';
const { chalk } = terminal;


const __ = {};


//-- Install
const install = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Install',
		banner: 'Install extra stuff',
		hooks:  __.tasks.install,
		subTask
	}, async () => {  // eslint-disable-line require-await

		// Symlink if self-reference
		const config = fss.readJson(paths.package.config);
		if (Object.keys(config.devDependencies).includes(config.name)) {
			const dependenciesPath = `${paths.package.root}/node_modules/${config.name}`;
			fss.remove(dependenciesPath);
			fss.symlink(paths.package.root, dependenciesPath);
			terminal.println(`Symlink self-reference dependency`);
		}
	});
};


//-- Outdated
const outdated = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Outdated',
		banner: 'Check for outdated package dependencies',
		hooks:  __.tasks.outdated,
		subTask
	}, async () => {

		await util.npmOutdated();
	});
};


//-- Build
const build = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Build',
		banner: 'Generate package distributions',
		hooks:  __.tasks.build,
		subTask
	}, async () => {

		if (__.dist) {
			await builder.run(__.dist);
		}
	});
};


//-- Watch
const watch = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Watch',
		banner: 'Watch changes in sources',
		hooks:  __.tasks.watch,
		subTask
	}, async () => {

		if (__.dist) {
			await builder.watch(__.dist);
		}
	});
};


//-- Documentation
const documentation = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Documentation',
		banner: 'Generate documentation',
		hooks:  __.tasks.documentation,
		subTask
	}, async () => {

		await documenter.generateCommonAssets();
		await documenter.generateAPI();
	});
};


//-- Prepare
const prepare = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Prepare',
		banner: 'Prepare package for publication',
		hooks:  __.tasks.prepare,
		subTask
	}, async () => {  // eslint-disable-line require-await

		util.updateNodeVersion();

		// Update version if self-reference
		const config = fss.readJson(paths.package.config);
		if (Object.keys(config.devDependencies).includes(config.name)) {
			config.devDependencies[config.name] = config.version;
			fss.writeJson(paths.package.config, config, { space: 2 });
			terminal.println(`Update self-reference version in ${chalk.underline(util.relativizePath(paths.package.config))}`);
		}
	});
};


//-- Rebuild
const rebuild = async ({ subTask } = {}) => {
	await util.taskRunner({
		name:   'Rebuild',
		banner: 'Rebuild package',
		hooks:  __.tasks.rebuild,
		subTask
	}, async () => {

		await build({ subTask: true });
		await documentation({ subTask: true });
		await prepare({ subTask: true });
	});
};


//-- Publish
const publish = async ({ subTask, unsafe = false } = {}) => {
	await util.taskRunner({
		name:   'Publish',
		banner: `Publish package${unsafe ? ' (unsafe)' : ''}`,
		hooks:  __.tasks.publish,
		subTask
	}, async () => {

		if (!unsafe) {
			await outdated({ subTask: true });
			await rebuild({ subTask: true });
			terminal.run('npm test');
		}

		const { tarball, version } = await util.npmPack();

		await util.npmPublish({
			tarball,
			tag:        util.getTag(version),
			restricted: __.publish.restricted,
			otp:        await util.getOTP(__.publish.useOTP)
		});
	});
};






/**
 * Single package manager.
 *
 * @hideconstructor
 */
class Single {

	/**
	 * Current package version.
	 *
	 * @type {string}
	 */
	get version() {
		const FILE = `${paths.package.root}/package.json`;

		if (fss.exists(FILE)) {
			const { version } = fss.readJson(FILE);

			return version;
		}

		return undefined;
	}


	/**
	 * Bootstrapper.
	 *
	 * @async
	 * @param {ManagerOptions} [options] - Options to customize the runner.
	 * @returns {Promise} When task completed.
	 */
	async scriptsRunner({ restricted = false, useOTP = true, dist, tasks = {} } = {}) {
		__.publish = { restricted, useOTP };
		__.dist    = dist;
		__.tasks   = tasks;

		//-- Tasks
		switch (util.getTask()) {

			case 'install':        await install(); break;
			case 'outdated':       await outdated(); break;

			case 'build':          await build(); break;
			case 'watch':          await watch(); break;
			case 'documentation':  await documentation(); break;
			case 'prepare':        await prepare(); break;
			case 'rebuild':        await rebuild(); break;

			case 'publish':        await publish(); break;

			case 'publish:unsafe':
				await util.confirmUnsafePublish();
				await publish({ unsafe: true });
				break;

			default: throw new Error('Task not defined');

		}

		terminal.completionBox('Completed');
	}

}


export default new Single();
