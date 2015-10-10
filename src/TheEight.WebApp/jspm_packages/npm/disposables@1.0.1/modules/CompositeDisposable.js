/* */ 
'use strict';
var _interopRequireWildcard = function(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
};
var _classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};
exports.__esModule = true;
var _isDisposable = require("./isDisposable");
var _isDisposable2 = _interopRequireWildcard(_isDisposable);
var CompositeDisposable = (function() {
  function CompositeDisposable() {
    for (var _len = arguments.length,
        disposables = Array(_len),
        _key = 0; _key < _len; _key++) {
      disposables[_key] = arguments[_key];
    }
    _classCallCheck(this, CompositeDisposable);
    if (Array.isArray(disposables[0]) && disposables.length === 1) {
      disposables = disposables[0];
    }
    for (var i = 0; i < disposables.length; i++) {
      if (!_isDisposable2['default'](disposables[i])) {
        throw new Error('Expected a disposable');
      }
    }
    this.disposables = disposables;
    this.isDisposed = false;
  }
  CompositeDisposable.prototype.add = function add(item) {
    if (this.isDisposed) {
      item.dispose();
    } else {
      this.disposables.push(item);
    }
  };
  CompositeDisposable.prototype.remove = function remove(item) {
    if (this.isDisposed) {
      return false;
    }
    var index = this.disposables.indexOf(item);
    if (index === -1) {
      return false;
    }
    this.disposables.splice(index, 1);
    item.dispose();
    return true;
  };
  CompositeDisposable.prototype.dispose = function dispose() {
    if (this.isDisposed) {
      return ;
    }
    var len = this.disposables.length;
    var currentDisposables = new Array(len);
    for (var i = 0; i < len; i++) {
      currentDisposables[i] = this.disposables[i];
    }
    this.isDisposed = true;
    this.disposables = [];
    this.length = 0;
    for (var i = 0; i < len; i++) {
      currentDisposables[i].dispose();
    }
  };
  return CompositeDisposable;
})();
exports['default'] = CompositeDisposable;
module.exports = exports['default'];
