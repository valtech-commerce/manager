//--------------------------------------------------------
//-- Assemble
//--------------------------------------------------------
'use strict';

const documentation = require('./documentation');


/**
 * Package assembler.
 *
 * @hideconstructor
 */
class Assemble {

	/**
	 * Documentation builder.
	 *
	 * @type {AssembleDocumentation}
	 */
	get documentation() {
		return documentation;
	}

}


module.exports = new Assemble();
