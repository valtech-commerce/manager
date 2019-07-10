//--------------------------------------------------------
//-- Tests
//--------------------------------------------------------
'use strict';

const tester = require('@absolunet/tester');

tester.npmPackage.validate({
	js: tester.all.js.concat([
		'!docs/**',
		'!theme-documentation/build/**',
		'!theme-documentation/jsdoc/publish.js'
	])
});


//		const data = [
//			{ moduleName: 'not', isInstalled: false, installed: '1.0.0', packageJson: '1.0.0', latest: '1.0.0' },
//
//			{ moduleName: '111', isInstalled: true, installed: '1.1.1', packageJson: '1.1.1', latest: '1.1.1' },
//
//			{ moduleName: '115', isInstalled: true, installed: '1.1.1', packageJson: '1.1.1', latest: '5.5.5' },
//			{ moduleName: '151', isInstalled: true, installed: '1.1.1', packageJson: '5.5.5', latest: '1.1.1' },
//			{ moduleName: '511', isInstalled: true, installed: '5.5.5', packageJson: '1.1.1', latest: '1.1.1' },
//
//			{ moduleName: '155', isInstalled: true, installed: '1.1.1', packageJson: '5.5.5', latest: '5.5.5' },
//			{ moduleName: '515', isInstalled: true, installed: '5.5.5', packageJson: '1.1.1', latest: '5.5.5' },
//			{ moduleName: '551', isInstalled: true, installed: '5.5.5', packageJson: '5.5.5', latest: '1.1.1' },
//
//			{ moduleName: '135', isInstalled: true, installed: '1.1.1', packageJson: '3.3.3', latest: '5.5.5' },
//			{ moduleName: '153', isInstalled: true, installed: '1.1.1', packageJson: '5.5.5', latest: '3.3.3' },
//			{ moduleName: '315', isInstalled: true, installed: '3.3.3', packageJson: '1.1.1', latest: '5.5.5' },
//			{ moduleName: '351', isInstalled: true, installed: '3.3.3', packageJson: '5.5.5', latest: '1.1.1' }
//			{ moduleName: '513', isInstalled: true, installed: '5.5.5', packageJson: '1.1.1', latest: '3.3.3' },
//			{ moduleName: '531', isInstalled: true, installed: '5.5.5', packageJson: '3.3.3', latest: '1.1.1' }
//		];
