/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj['default'] = obj;
    return newObj;
  }
}
function _interopExportWildcard(obj, defaults) {
  var newObj = defaults({}, obj);
  delete newObj['default'];
  return newObj;
}
function _defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);
    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }
  return obj;
}
var _index = require('./index');
_defaults(exports, _interopExportWildcard(_index, _defaults));
var _backendsHTML5 = require('./backends/HTML5');
var _HTML5 = _interopRequireWildcard(_backendsHTML5);
exports.HTML5 = _HTML5;
