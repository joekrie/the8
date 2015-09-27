/* */ 
'use strict';
require("./polyfills/function.bind");
require("./polyfills/array.foreach");
require("./polyfills/array.map");
require("./polyfills/array.filter");
require("./polyfills/array.isarray");
require("./polyfills/array.indexof");
require("./polyfills/array.some");
require("./polyfills/string.trim");
require("./polyfills/object.keys");
var core = require("./core");
var index = require("./index");
var use = require("./use");
core.use = use.bind(core);
core.find = index.find;
core.val = require("./validators");
module.exports = core;
