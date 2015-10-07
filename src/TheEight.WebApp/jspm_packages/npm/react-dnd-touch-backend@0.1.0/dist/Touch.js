/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = createTouchBackend;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactDndModulesUtilsOffsetHelpers = require('react-dnd/modules/utils/OffsetHelpers');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var TouchBackend = (function () {
    function TouchBackend(manager) {
        _classCallCheck(this, TouchBackend);

        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();

        this.sourceNodes = {};
        this.sourceNodeOptions = {};
        this.sourcePreviewNodes = {};
        this.sourcePreviewNodeOptions = {};
        this.targetNodes = {};
        this.targetNodeOptions = {};
        this._mouseClientOffset = {};

        this.getSourceClientOffset = this.getSourceClientOffset.bind(this);
        this.handleTopTouchStart = this.handleTopTouchStart.bind(this);
        this.handleTopTouchStartCapture = this.handleTopTouchStartCapture.bind(this);
        this.handleTopTouchMoveCapture = this.handleTopTouchMoveCapture.bind(this);
        this.handleTopTouchEndCapture = this.handleTopTouchEndCapture.bind(this);
    }

    _createClass(TouchBackend, [{
        key: 'setup',
        value: function setup() {
            if (typeof window === 'undefined') {
                return;
            }

            (0, _invariant2['default'])(!this.constructor.isSetUp, 'Cannot have two Touch backends at the same time.');
            this.constructor.isSetUp = true;

            window.addEventListener('touchstart', this.handleTopTouchStartCapture, true);
            window.addEventListener('touchstart', this.handleTopTouchStart);
            window.addEventListener('touchmove', this.handleTopTouchMoveCapture, true);
            window.addEventListener('touchend', this.handleTopTouchEndCapture, true);
        }
    }, {
        key: 'teardown',
        value: function teardown() {
            if (typeof window === 'undefined') {
                return;
            }

            this.constructor.isSetUp = false;
            this._mouseClientOffset = {};

            window.removeEventListener('touchstart', this.handleTopTouchStartCapture, true);
            window.removeEventListener('touchstart', this.handleTopTouchStart);
            window.removeEventListener('touchmove', this.handleTopTouchMoveCapture, true);
            window.removeEventListener('touchend', this.handleTopTouchEndCapture, true);

            this.uninstallSourceNodeRemovalObserver();
        }
    }, {
        key: 'connectDragSource',
        value: function connectDragSource(sourceId, node, options) {
            var _this = this;

            var handleTouchStart = this.handleTouchStart.bind(this, sourceId);
            this.sourceNodes[sourceId] = node;

            node.addEventListener('touchstart', handleTouchStart);

            return function () {
                delete _this.sourceNodes[sourceId];
                node.removeEventListener('touchstart', handleTouchStart);
            };
        }
    }, {
        key: 'connectDragPreview',
        value: function connectDragPreview(sourceId, node, options) {
            var _this2 = this;

            this.sourcePreviewNodeOptions[sourceId] = options;
            this.sourcePreviewNodes[sourceId] = node;

            return function () {
                delete _this2.sourcePreviewNodes[sourceId];
                delete _this2.sourcePreviewNodeOptions[sourceId];
            };
        }
    }, {
        key: 'connectDropTarget',
        value: function connectDropTarget(targetId, node) {
            var _this3 = this;

            this.targetNodes[targetId] = node;

            return function () {
                delete _this3.targetNodes[targetId];
            };
        }
    }, {
        key: 'getSourceClientOffset',
        value: function getSourceClientOffset(sourceId) {
            return (0, _reactDndModulesUtilsOffsetHelpers.getElementClientOffset)(this.sourceNodes[sourceId]);
        }
    }, {
        key: 'handleTopTouchStartCapture',
        value: function handleTopTouchStartCapture(e) {
            this.touchStartSourceIds = [];
        }
    }, {
        key: 'handleTouchStart',
        value: function handleTouchStart(sourceId) {
            this.touchStartSourceIds.unshift(sourceId);
        }
    }, {
        key: 'handleTopTouchStart',
        value: function handleTopTouchStart(e) {
            if (e.targetTouches.length !== 1) {
                return;
            }

            // Don't prematurely preventDefault() here since it might:
            // 1. Mess up scrolling
            // 2. Mess up long tap (which brings up context menu)
            // 3. If there's an anchor link as a child, tap won't be triggered on link

            this._mouseClientOffset = (0, _reactDndModulesUtilsOffsetHelpers.getEventClientOffset)(e.targetTouches[0]);
        }
    }, {
        key: 'handleTopTouchMoveCapture',
        value: function handleTopTouchMoveCapture(e) {
            var _this4 = this;

            var touchStartSourceIds = this.touchStartSourceIds;

            if (e.targetTouches.length !== 1) {
                return;
            }

            var clientOffset = (0, _reactDndModulesUtilsOffsetHelpers.getEventClientOffset)(e.targetTouches[0]);

            // If we're not dragging and we've moved a little, that counts as a drag start
            if (!this.monitor.isDragging() && this._mouseClientOffset.hasOwnProperty('x') && touchStartSourceIds && (this._mouseClientOffset.x !== clientOffset.x || this._mouseClientOffset.y !== clientOffset.y)) {
                this.touchStartSourceIds = null;

                this.actions.beginDrag(touchStartSourceIds, {
                    clientOffset: this._mouseClientOffset,
                    getSourceClientOffset: this.getSourceClientOffset,
                    publishSource: false
                });
            }

            if (!this.monitor.isDragging()) {
                return;
            }

            var sourceNode = this.sourceNodes[this.monitor.getSourceId()];
            this.installSourceNodeRemovalObserver(sourceNode);
            this.actions.publishDragSource();

            e.preventDefault();

            var matchingTargetIds = Object.keys(this.targetNodes).filter(function (targetId) {
                var boundingRect = _this4.targetNodes[targetId].getBoundingClientRect();
                return clientOffset.x >= boundingRect.left && clientOffset.x <= boundingRect.right && clientOffset.y >= boundingRect.top && clientOffset.y <= boundingRect.bottom;
            });

            this.actions.hover(matchingTargetIds, {
                clientOffset: clientOffset
            });
        }
    }, {
        key: 'handleTopTouchEndCapture',
        value: function handleTopTouchEndCapture(e) {
            if (!this.monitor.isDragging() || this.monitor.didDrop()) {
                return;
            }

            e.preventDefault();

            this._mouseClientOffset = {};

            this.uninstallSourceNodeRemovalObserver();
            this.actions.drop();
            this.actions.endDrag();
        }
    }, {
        key: 'installSourceNodeRemovalObserver',
        value: function installSourceNodeRemovalObserver(node) {
            var _this5 = this;

            this.uninstallSourceNodeRemovalObserver();

            this.draggedSourceNode = node;
            this.draggedSourceNodeRemovalObserver = new window.MutationObserver(function () {
                if (!node.parentElement) {
                    _this5.resurrectSourceNode();
                    _this5.uninstallSourceNodeRemovalObserver();
                }
            });

            this.draggedSourceNodeRemovalObserver.observe(node.parentElement, { childList: true });
        }
    }, {
        key: 'resurrectSourceNode',
        value: function resurrectSourceNode() {
            this.draggedSourceNode.style.display = 'none';
            this.draggedSourceNode.removeAttribute('data-reactid');
            document.body.appendChild(this.draggedSourceNode);
        }
    }, {
        key: 'uninstallSourceNodeRemovalObserver',
        value: function uninstallSourceNodeRemovalObserver() {
            if (this.draggedSourceNodeRemovalObserver) {
                this.draggedSourceNodeRemovalObserver.disconnect();
            }

            this.draggedSourceNodeRemovalObserver = null;
            this.draggedSourceNode = null;
        }
    }]);

    return TouchBackend;
})();

exports.TouchBackend = TouchBackend;

function createTouchBackend(manager) {
    return new TouchBackend(manager);
}