/* */ 
'use strict';
exports.__esModule = true;
exports.getElementClientOffset = getElementClientOffset;
exports.getEventClientOffset = getEventClientOffset;
exports.getDragPreviewOffset = getDragPreviewOffset;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _BrowserDetector = require('./BrowserDetector');
var _createMonotonicInterpolant = require('./createMonotonicInterpolant');
var _createMonotonicInterpolant2 = _interopRequireDefault(_createMonotonicInterpolant);
var ELEMENT_NODE = 1;
function getElementClientOffset(el) {
  if (el.nodeType !== ELEMENT_NODE) {
    el = el.parentElement;
  }
  if (!el) {
    return null;
  }
  var _el$getBoundingClientRect = el.getBoundingClientRect();
  var top = _el$getBoundingClientRect.top;
  var left = _el$getBoundingClientRect.left;
  return {
    x: left,
    y: top
  };
}
function getEventClientOffset(e) {
  return {
    x: e.clientX,
    y: e.clientY
  };
}
function getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint) {
  var isImage = dragPreview.nodeName === 'IMG' && (_BrowserDetector.isFirefox() || !document.documentElement.contains(dragPreview));
  var dragPreviewNode = isImage ? sourceNode : dragPreview;
  var dragPreviewNodeOffsetFromClient = getElementClientOffset(dragPreviewNode);
  var offsetFromDragPreview = {
    x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
    y: clientOffset.y - dragPreviewNodeOffsetFromClient.y
  };
  var sourceWidth = sourceNode.offsetWidth;
  var sourceHeight = sourceNode.offsetHeight;
  var anchorX = anchorPoint.anchorX;
  var anchorY = anchorPoint.anchorY;
  var dragPreviewWidth = isImage ? dragPreview.width : sourceWidth;
  var dragPreviewHeight = isImage ? dragPreview.height : sourceHeight;
  if (_BrowserDetector.isSafari() && isImage) {
    dragPreviewHeight /= window.devicePixelRatio;
    dragPreviewWidth /= window.devicePixelRatio;
  } else if (_BrowserDetector.isFirefox() && !isImage) {
    dragPreviewHeight *= window.devicePixelRatio;
    dragPreviewWidth *= window.devicePixelRatio;
  }
  var interpolateX = _createMonotonicInterpolant2['default']([0, 0.5, 1], [offsetFromDragPreview.x, offsetFromDragPreview.x / sourceWidth * dragPreviewWidth, offsetFromDragPreview.x + dragPreviewWidth - sourceWidth]);
  var interpolateY = _createMonotonicInterpolant2['default']([0, 0.5, 1], [offsetFromDragPreview.y, offsetFromDragPreview.y / sourceHeight * dragPreviewHeight, offsetFromDragPreview.y + dragPreviewHeight - sourceHeight]);
  var x = interpolateX(anchorX);
  var y = interpolateY(anchorY);
  if (_BrowserDetector.isSafari() && isImage) {
    y += (window.devicePixelRatio - 1) * dragPreviewHeight;
  }
  return {
    x: x,
    y: y
  };
}
