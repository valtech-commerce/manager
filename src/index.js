//--------------------------------------------------------
//-- @absolunet/manager
//--------------------------------------------------------
import Manager from './Manager';


const manager = new Manager();


/**
 * Exports a default instance of the manager and also the main class.
 *
 * @module @absolunet/manager
 *
 * @example
 * import { manager } from '@absolunet/manager';
 *
 * manager.singleScriptsRunner(options);
 *
 * @example
 * import { Manager } from '@absolunet/manager';
 *
 * class MyManager extends Manager {
 * 	constructor(options) {
 * 		super(options);
 * 	}
 * }
 */
export {

	/**
	 * Instance of Manager.
	 *
	 * @type {Manager}
	 **/
	manager,

	/**
	 * Class definition of Manager.
	 *
	 * @type {class}
	 **/
	Manager
};
