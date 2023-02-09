//--------------------------------------------------------
//-- @valtech-commerce/manager
//--------------------------------------------------------
import Manager from "./Manager.js";

const manager = new Manager();

/**
 * Exports a default instance of the manager and also the main class.
 *
 * @module valtech-commerce/manager
 *
 * @example
 * import { manager } from '@valtech-commerce/manager';
 *
 * manager.init(options);
 *
 * @example
 * import { Manager } from '@valtech-commerce/manager';
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
	 */
	manager,
	/**
	 * Class definition of Manager.
	 *
	 * @type {class}
	 */
	Manager,
};
