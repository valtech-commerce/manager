/* eslint-disable no-undef */
"use strict";

window.kafe = window.kafe || {};
window.kafe[process.env.__PACKAGE_NAME__] = require(process.env.__PACKAGE_ROOT__).default;
