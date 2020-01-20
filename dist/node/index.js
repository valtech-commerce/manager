"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Manager", {
  enumerable: true,
  get: function () {
    return _Manager.default;
  }
});
exports.manager = void 0;

var _Manager = _interopRequireDefault(require("./Manager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- @absolunet/manager
//--------------------------------------------------------
const manager = new _Manager.default();
/**
 * Exports a default instance of the manager and also the main class.
 *
 * @module @absolunet/manager
 *
 * @example
 * import { manager } from '@absolunet/manager';
 *
 * manager.init(options);
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

exports.manager = manager;