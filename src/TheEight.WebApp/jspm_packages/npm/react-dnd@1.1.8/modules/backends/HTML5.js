/* */ 
'use strict';
exports.__esModule = true;
var _nativeTypesConfig;
exports.getEmptyImage = getEmptyImage;
exports['default'] = createHTML5Backend;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var _dndCore = require('dnd-core');
var _utilsEnterLeaveCounter = require('../utils/EnterLeaveCounter');
var _utilsEnterLeaveCounter2 = _interopRequireDefault(_utilsEnterLeaveCounter);
var _utilsBrowserDetector = require('../utils/BrowserDetector');
var _utilsOffsetHelpers = require('../utils/OffsetHelpers');
var _utilsShallowEqual = require('../utils/shallowEqual');
var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
var _lodashObjectDefaults = require('lodash/object/defaults');
var _lodashObjectDefaults2 = _interopRequireDefault(_lodashObjectDefaults);
var _invariant = require('invariant');
var _invariant2 = _interopRequireDefault(_invariant);
var emptyImage = undefined;
function getEmptyImage() {
  if (!emptyImage) {
    emptyImage = new Image();
    emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  }
  return emptyImage;
}
var NativeTypes = {
  FILE: '__NATIVE_FILE__',
  URL: '__NATIVE_URL__',
  TEXT: '__NATIVE_TEXT__'
};
exports.NativeTypes = NativeTypes;
function getDataFromDataTransfer(dataTransfer, typesToTry, defaultValue) {
  var result = typesToTry.reduce(function(resultSoFar, typeToTry) {
    return resultSoFar || dataTransfer.getData(typeToTry);
  }, null);
  return result != null ? result : defaultValue;
}
var nativeTypesConfig = (_nativeTypesConfig = {}, _defineProperty(_nativeTypesConfig, NativeTypes.FILE, {
  exposeProperty: 'files',
  matchesTypes: ['Files'],
  getData: function getData(dataTransfer) {
    return Array.prototype.slice.call(dataTransfer.files);
  }
}), _defineProperty(_nativeTypesConfig, NativeTypes.URL, {
  exposeProperty: 'urls',
  matchesTypes: ['Url', 'text/uri-list'],
  getData: function getData(dataTransfer, matchesTypes) {
    return getDataFromDataTransfer(dataTransfer, matchesTypes, '').split('\n');
  }
}), _defineProperty(_nativeTypesConfig, NativeTypes.TEXT, {
  exposeProperty: 'text',
  matchesTypes: ['Text', 'text/plain'],
  getData: function getData(dataTransfer, matchesTypes) {
    return getDataFromDataTransfer(dataTransfer, matchesTypes, '');
  }
}), _nativeTypesConfig);
function createNativeDragSource(type) {
  var _nativeTypesConfig$type = nativeTypesConfig[type];
  var exposeProperty = _nativeTypesConfig$type.exposeProperty;
  var matchesTypes = _nativeTypesConfig$type.matchesTypes;
  var getData = _nativeTypesConfig$type.getData;
  return (function(_DragSource) {
    _inherits(NativeDragSource, _DragSource);
    function NativeDragSource() {
      _classCallCheck(this, NativeDragSource);
      _DragSource.call(this);
      this.item = Object.defineProperties({}, _defineProperty({}, exposeProperty, {
        get: function get() {
          console.warn('Browser doesn\'t allow reading "' + exposeProperty + '" until the drop event.');
          return null;
        },
        configurable: true,
        enumerable: true
      }));
    }
    NativeDragSource.prototype.mutateItemByReadingDataTransfer = function mutateItemByReadingDataTransfer(dataTransfer) {
      delete this.item[exposeProperty];
      this.item[exposeProperty] = getData(dataTransfer, matchesTypes);
    };
    NativeDragSource.prototype.beginDrag = function beginDrag() {
      return this.item;
    };
    return NativeDragSource;
  })(_dndCore.DragSource);
}
function matchNativeItemType(dataTransfer) {
  var dataTransferTypes = Array.prototype.slice.call(dataTransfer.types || []);
  return Object.keys(nativeTypesConfig).filter(function(nativeItemType) {
    var matchesTypes = nativeTypesConfig[nativeItemType].matchesTypes;
    return matchesTypes.some(function(t) {
      return dataTransferTypes.indexOf(t) > -1;
    });
  })[0] || null;
}
var HTML5Backend = (function() {
  function HTML5Backend(manager) {
    _classCallCheck(this, HTML5Backend);
    this.actions = manager.getActions();
    this.monitor = manager.getMonitor();
    this.registry = manager.getRegistry();
    this.sourcePreviewNodes = {};
    this.sourcePreviewNodeOptions = {};
    this.sourceNodes = {};
    this.sourceNodeOptions = {};
    this.enterLeaveCounter = new _utilsEnterLeaveCounter2['default']();
    this.getSourceClientOffset = this.getSourceClientOffset.bind(this);
    this.handleTopDragStart = this.handleTopDragStart.bind(this);
    this.handleTopDragStartCapture = this.handleTopDragStartCapture.bind(this);
    this.handleTopDragEndCapture = this.handleTopDragEndCapture.bind(this);
    this.handleTopDragEnter = this.handleTopDragEnter.bind(this);
    this.handleTopDragEnterCapture = this.handleTopDragEnterCapture.bind(this);
    this.handleTopDragLeaveCapture = this.handleTopDragLeaveCapture.bind(this);
    this.handleTopDragOver = this.handleTopDragOver.bind(this);
    this.handleTopDragOverCapture = this.handleTopDragOverCapture.bind(this);
    this.handleTopDrop = this.handleTopDrop.bind(this);
    this.handleTopDropCapture = this.handleTopDropCapture.bind(this);
    this.handleSelectStart = this.handleSelectStart.bind(this);
    this.endDragIfSourceWasRemovedFromDOM = this.endDragIfSourceWasRemovedFromDOM.bind(this);
  }
  HTML5Backend.prototype.setup = function setup() {
    if (typeof window === 'undefined') {
      return;
    }
    _invariant2['default'](!this.constructor.isSetUp, 'Cannot have two HTML5 backends at the same time.');
    this.constructor.isSetUp = true;
    window.addEventListener('dragstart', this.handleTopDragStart);
    window.addEventListener('dragstart', this.handleTopDragStartCapture, true);
    window.addEventListener('dragend', this.handleTopDragEndCapture, true);
    window.addEventListener('dragenter', this.handleTopDragEnter);
    window.addEventListener('dragenter', this.handleTopDragEnterCapture, true);
    window.addEventListener('dragleave', this.handleTopDragLeaveCapture, true);
    window.addEventListener('dragover', this.handleTopDragOver);
    window.addEventListener('dragover', this.handleTopDragOverCapture, true);
    window.addEventListener('drop', this.handleTopDrop);
    window.addEventListener('drop', this.handleTopDropCapture, true);
  };
  HTML5Backend.prototype.teardown = function teardown() {
    if (typeof window === 'undefined') {
      return;
    }
    this.constructor.isSetUp = false;
    window.removeEventListener('dragstart', this.handleTopDragStart);
    window.removeEventListener('dragstart', this.handleTopDragStartCapture, true);
    window.removeEventListener('dragend', this.handleTopDragEndCapture, true);
    window.removeEventListener('dragenter', this.handleTopDragEnter);
    window.removeEventListener('dragenter', this.handleTopDragEnterCapture, true);
    window.removeEventListener('dragleave', this.handleTopDragLeaveCapture, true);
    window.removeEventListener('dragover', this.handleTopDragOver);
    window.removeEventListener('dragover', this.handleTopDragOverCapture, true);
    window.removeEventListener('drop', this.handleTopDrop);
    window.removeEventListener('drop', this.handleTopDropCapture, true);
    this.clearCurrentDragSourceNode();
  };
  HTML5Backend.prototype.connectDragPreview = function connectDragPreview(sourceId, node, options) {
    var _this = this;
    this.sourcePreviewNodeOptions[sourceId] = options;
    this.sourcePreviewNodes[sourceId] = node;
    return function() {
      delete _this.sourcePreviewNodes[sourceId];
      delete _this.sourcePreviewNodeOptions[sourceId];
    };
  };
  HTML5Backend.prototype.connectDragSource = function connectDragSource(sourceId, node, options) {
    var _this2 = this;
    this.sourceNodes[sourceId] = node;
    this.sourceNodeOptions[sourceId] = options;
    var handleDragStart = function handleDragStart(e) {
      return _this2.handleDragStart(e, sourceId);
    };
    var handleSelectStart = function handleSelectStart(e) {
      return _this2.handleSelectStart(e, sourceId);
    };
    node.setAttribute('draggable', true);
    node.addEventListener('dragstart', handleDragStart);
    node.addEventListener('selectstart', handleSelectStart);
    return function() {
      delete _this2.sourceNodes[sourceId];
      delete _this2.sourceNodeOptions[sourceId];
      node.removeEventListener('dragstart', handleDragStart);
      node.removeEventListener('selectstart', handleSelectStart);
      node.setAttribute('draggable', false);
    };
  };
  HTML5Backend.prototype.connectDropTarget = function connectDropTarget(targetId, node) {
    var _this3 = this;
    var handleDragEnter = function handleDragEnter(e) {
      return _this3.handleDragEnter(e, targetId);
    };
    var handleDragOver = function handleDragOver(e) {
      return _this3.handleDragOver(e, targetId);
    };
    var handleDrop = function handleDrop(e) {
      return _this3.handleDrop(e, targetId);
    };
    node.addEventListener('dragenter', handleDragEnter);
    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('drop', handleDrop);
    return function() {
      node.removeEventListener('dragenter', handleDragEnter);
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('drop', handleDrop);
    };
  };
  HTML5Backend.prototype.getCurrentSourceNodeOptions = function getCurrentSourceNodeOptions() {
    var sourceId = this.monitor.getSourceId();
    var sourceNodeOptions = this.sourceNodeOptions[sourceId];
    return _lodashObjectDefaults2['default'](sourceNodeOptions || {}, {dropEffect: 'move'});
  };
  HTML5Backend.prototype.getCurrentDropEffect = function getCurrentDropEffect() {
    if (this.isDraggingNativeItem()) {
      return 'copy';
    } else {
      return this.getCurrentSourceNodeOptions().dropEffect;
    }
  };
  HTML5Backend.prototype.getCurrentSourcePreviewNodeOptions = function getCurrentSourcePreviewNodeOptions() {
    var sourceId = this.monitor.getSourceId();
    var sourcePreviewNodeOptions = this.sourcePreviewNodeOptions[sourceId];
    return _lodashObjectDefaults2['default'](sourcePreviewNodeOptions || {}, {
      anchorX: 0.5,
      anchorY: 0.5,
      captureDraggingState: false
    });
  };
  HTML5Backend.prototype.getSourceClientOffset = function getSourceClientOffset(sourceId) {
    return _utilsOffsetHelpers.getElementClientOffset(this.sourceNodes[sourceId]);
  };
  HTML5Backend.prototype.isDraggingNativeItem = function isDraggingNativeItem() {
    var itemType = this.monitor.getItemType();
    return Object.keys(NativeTypes).some(function(key) {
      return NativeTypes[key] === itemType;
    });
  };
  HTML5Backend.prototype.beginDragNativeItem = function beginDragNativeItem(type) {
    this.clearCurrentDragSourceNode();
    var SourceType = createNativeDragSource(type);
    this.currentNativeSource = new SourceType();
    this.currentNativeHandle = this.registry.addSource(type, this.currentNativeSource);
    this.actions.beginDrag([this.currentNativeHandle]);
  };
  HTML5Backend.prototype.endDragNativeItem = function endDragNativeItem() {
    this.actions.endDrag();
    this.registry.removeSource(this.currentNativeHandle);
    this.currentNativeHandle = null;
    this.currentNativeSource = null;
  };
  HTML5Backend.prototype.endDragIfSourceWasRemovedFromDOM = function endDragIfSourceWasRemovedFromDOM() {
    var node = this.currentDragSourceNode;
    if (document.body.contains(node)) {
      return;
    }
    this.actions.endDrag();
    this.clearCurrentDragSourceNode();
  };
  HTML5Backend.prototype.setCurrentDragSourceNode = function setCurrentDragSourceNode(node) {
    this.clearCurrentDragSourceNode();
    this.currentDragSourceNode = node;
    this.currentDragSourceNodeOffset = _utilsOffsetHelpers.getElementClientOffset(node);
    this.currentDragSourceNodeOffsetChanged = false;
    window.addEventListener('mousemove', this.endDragIfSourceWasRemovedFromDOM, true);
  };
  HTML5Backend.prototype.clearCurrentDragSourceNode = function clearCurrentDragSourceNode() {
    if (this.currentDragSourceNode) {
      this.currentDragSourceNode = null;
      this.currentDragSourceNodeOffset = null;
      this.currentDragSourceNodeOffsetChanged = false;
      window.removeEventListener('mousemove', this.endDragIfSourceWasRemovedFromDOM, true);
      return true;
    } else {
      return false;
    }
  };
  HTML5Backend.prototype.checkIfCurrentDragSourceRectChanged = function checkIfCurrentDragSourceRectChanged() {
    var node = this.currentDragSourceNode;
    if (!node) {
      return false;
    }
    if (this.currentDragSourceNodeOffsetChanged) {
      return true;
    }
    this.currentDragSourceNodeOffsetChanged = !_utilsShallowEqual2['default'](_utilsOffsetHelpers.getElementClientOffset(node), this.currentDragSourceNodeOffset);
    return this.currentDragSourceNodeOffsetChanged;
  };
  HTML5Backend.prototype.handleTopDragStartCapture = function handleTopDragStartCapture() {
    this.clearCurrentDragSourceNode();
    this.dragStartSourceIds = [];
  };
  HTML5Backend.prototype.handleDragStart = function handleDragStart(e, sourceId) {
    this.dragStartSourceIds.unshift(sourceId);
  };
  HTML5Backend.prototype.handleTopDragStart = function handleTopDragStart(e) {
    var _this4 = this;
    var dragStartSourceIds = this.dragStartSourceIds;
    this.dragStartSourceIds = null;
    var clientOffset = _utilsOffsetHelpers.getEventClientOffset(e);
    this.actions.beginDrag(dragStartSourceIds, {
      publishSource: false,
      getSourceClientOffset: this.getSourceClientOffset,
      clientOffset: clientOffset
    });
    var dataTransfer = e.dataTransfer;
    var nativeType = matchNativeItemType(dataTransfer);
    if (this.monitor.isDragging()) {
      if (typeof dataTransfer.setDragImage === 'function') {
        var sourceId = this.monitor.getSourceId();
        var sourceNode = this.sourceNodes[sourceId];
        var dragPreview = this.sourcePreviewNodes[sourceId] || sourceNode;
        var _getCurrentSourcePreviewNodeOptions = this.getCurrentSourcePreviewNodeOptions();
        var anchorX = _getCurrentSourcePreviewNodeOptions.anchorX;
        var anchorY = _getCurrentSourcePreviewNodeOptions.anchorY;
        var anchorPoint = {
          anchorX: anchorX,
          anchorY: anchorY
        };
        var dragPreviewOffset = _utilsOffsetHelpers.getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint);
        dataTransfer.setDragImage(dragPreview, dragPreviewOffset.x, dragPreviewOffset.y);
      }
      try {
        dataTransfer.setData('application/json', {});
      } catch (err) {}
      this.setCurrentDragSourceNode(e.target);
      var _getCurrentSourcePreviewNodeOptions2 = this.getCurrentSourcePreviewNodeOptions();
      var captureDraggingState = _getCurrentSourcePreviewNodeOptions2.captureDraggingState;
      if (!captureDraggingState) {
        setTimeout(function() {
          return _this4.actions.publishDragSource();
        });
      } else {
        this.actions.publishDragSource();
      }
    } else if (nativeType) {
      this.beginDragNativeItem(nativeType);
    } else if (!dataTransfer.types && (!e.target.hasAttribute || !e.target.hasAttribute('draggable'))) {
      return;
    } else {
      e.preventDefault();
    }
  };
  HTML5Backend.prototype.handleTopDragEndCapture = function handleTopDragEndCapture() {
    if (this.clearCurrentDragSourceNode()) {
      this.actions.endDrag();
    }
  };
  HTML5Backend.prototype.handleTopDragEnterCapture = function handleTopDragEnterCapture(e) {
    this.dragEnterTargetIds = [];
    var isFirstEnter = this.enterLeaveCounter.enter(e.target);
    if (!isFirstEnter || this.monitor.isDragging()) {
      return;
    }
    var dataTransfer = e.dataTransfer;
    var nativeType = matchNativeItemType(dataTransfer);
    if (nativeType) {
      this.beginDragNativeItem(nativeType);
    }
  };
  HTML5Backend.prototype.handleDragEnter = function handleDragEnter(e, targetId) {
    this.dragEnterTargetIds.unshift(targetId);
  };
  HTML5Backend.prototype.handleTopDragEnter = function handleTopDragEnter(e) {
    var _this5 = this;
    var dragEnterTargetIds = this.dragEnterTargetIds;
    this.dragEnterTargetIds = [];
    if (!this.monitor.isDragging()) {
      return;
    }
    if (!_utilsBrowserDetector.isFirefox()) {
      this.actions.hover(dragEnterTargetIds, {clientOffset: _utilsOffsetHelpers.getEventClientOffset(e)});
    }
    var canDrop = dragEnterTargetIds.some(function(targetId) {
      return _this5.monitor.canDropOnTarget(targetId);
    });
    if (canDrop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = this.getCurrentDropEffect();
    }
  };
  HTML5Backend.prototype.handleTopDragOverCapture = function handleTopDragOverCapture() {
    this.dragOverTargetIds = [];
  };
  HTML5Backend.prototype.handleDragOver = function handleDragOver(e, targetId) {
    this.dragOverTargetIds.unshift(targetId);
  };
  HTML5Backend.prototype.handleTopDragOver = function handleTopDragOver(e) {
    var _this6 = this;
    var dragOverTargetIds = this.dragOverTargetIds;
    this.dragOverTargetIds = [];
    if (!this.monitor.isDragging()) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    this.actions.hover(dragOverTargetIds, {clientOffset: _utilsOffsetHelpers.getEventClientOffset(e)});
    var canDrop = dragOverTargetIds.some(function(targetId) {
      return _this6.monitor.canDropOnTarget(targetId);
    });
    if (canDrop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = this.getCurrentDropEffect();
    } else if (this.isDraggingNativeItem()) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'none';
    } else if (this.checkIfCurrentDragSourceRectChanged()) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };
  HTML5Backend.prototype.handleTopDragLeaveCapture = function handleTopDragLeaveCapture(e) {
    if (this.isDraggingNativeItem()) {
      e.preventDefault();
    }
    var isLastLeave = this.enterLeaveCounter.leave(e.target);
    if (!isLastLeave) {
      return;
    }
    if (this.isDraggingNativeItem()) {
      this.endDragNativeItem();
    }
  };
  HTML5Backend.prototype.handleTopDropCapture = function handleTopDropCapture(e) {
    this.dropTargetIds = [];
    e.preventDefault();
    if (this.isDraggingNativeItem()) {
      this.currentNativeSource.mutateItemByReadingDataTransfer(e.dataTransfer);
    }
    this.enterLeaveCounter.reset();
  };
  HTML5Backend.prototype.handleDrop = function handleDrop(e, targetId) {
    this.dropTargetIds.unshift(targetId);
  };
  HTML5Backend.prototype.handleTopDrop = function handleTopDrop(e) {
    var dropTargetIds = this.dropTargetIds;
    this.dropTargetIds = [];
    this.actions.hover(dropTargetIds, {clientOffset: _utilsOffsetHelpers.getEventClientOffset(e)});
    this.actions.drop();
    if (this.isDraggingNativeItem()) {
      this.endDragNativeItem();
    } else {
      this.endDragIfSourceWasRemovedFromDOM();
    }
  };
  HTML5Backend.prototype.handleSelectStart = function handleSelectStart(e) {
    if (typeof e.target.dragDrop === 'function') {
      e.preventDefault();
      e.target.dragDrop();
    }
  };
  return HTML5Backend;
})();
function createHTML5Backend(manager) {
  return new HTML5Backend(manager);
}
