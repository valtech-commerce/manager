/* eslint-disable no-restricted-globals,no-undef,no-process-env, strict */
'use strict';

window[process.env.__PACKAGE_NAME__] = require(process.env.__PACKAGE_ROOT__).default;
