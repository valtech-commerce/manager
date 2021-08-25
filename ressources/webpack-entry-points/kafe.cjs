/* eslint-disable no-restricted-globals,no-undef,node/no-process-env */
"use strict";

window.kafe = window.kafe || {};
window.kafe[process.env.__PACKAGE_NAME__] = require(process.env.__PACKAGE_ROOT__).default;
