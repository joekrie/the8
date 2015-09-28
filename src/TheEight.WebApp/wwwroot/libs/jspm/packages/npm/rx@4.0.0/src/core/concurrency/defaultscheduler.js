/* */ 
(function(process) {
  var scheduleMethod,
      clearMethod;
  var localTimer = (function() {
    var localSetTimeout,
        localClearTimeout = noop;
    if (!!root.setTimeout) {
      localSetTimeout = root.setTimeout;
      localClearTimeout = root.clearTimeout;
    } else if (!!root.WScript) {
      localSetTimeout = function(fn, time) {
        root.WScript.Sleep(time);
        fn();
      };
    } else {
      throw new NotSupportedError();
    }
    return {
      setTimeout: localSetTimeout,
      clearTimeout: localClearTimeout
    };
  }());
  var localSetTimeout = localTimer.setTimeout,
      localClearTimeout = localTimer.clearTimeout;
  (function() {
    var nextHandle = 1,
        tasksByHandle = {},
        currentlyRunning = false;
    clearMethod = function(handle) {
      delete tasksByHandle[handle];
    };
    function runTask(handle) {
      if (currentlyRunning) {
        localSetTimeout(function() {
          runTask(handle);
        }, 0);
      } else {
        var task = tasksByHandle[handle];
        if (task) {
          currentlyRunning = true;
          var result = tryCatch(task)();
          clearMethod(handle);
          currentlyRunning = false;
          if (result === errorObj) {
            thrower(result.e);
          }
        }
      }
    }
    var reNative = new RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
    var setImmediate = typeof(setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
    function postMessageSupported() {
      if (!root.postMessage || root.importScripts) {
        return false;
      }
      var isAsync = false,
          oldHandler = root.onmessage;
      root.onmessage = function() {
        isAsync = true;
      };
      root.postMessage('', '*');
      root.onmessage = oldHandler;
      return isAsync;
    }
    if (isFunction(setImmediate)) {
      scheduleMethod = function(action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        setImmediate(function() {
          runTask(id);
        });
        return id;
      };
    } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleMethod = function(action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        process.nextTick(function() {
          runTask(id);
        });
        return id;
      };
    } else if (postMessageSupported()) {
      var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
      function onGlobalPostMessage(event) {
        if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
          runTask(event.data.substring(MSG_PREFIX.length));
        }
      }
      if (root.addEventListener) {
        root.addEventListener('message', onGlobalPostMessage, false);
      } else if (root.attachEvent) {
        root.attachEvent('onmessage', onGlobalPostMessage);
      } else {
        root.onmessage = onGlobalPostMessage;
      }
      scheduleMethod = function(action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        root.postMessage(MSG_PREFIX + currentId, '*');
        return id;
      };
    } else if (!!root.MessageChannel) {
      var channel = new root.MessageChannel();
      channel.port1.onmessage = function(e) {
        runTask(e.data);
      };
      scheduleMethod = function(action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        channel.port2.postMessage(id);
        return id;
      };
    } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
      scheduleMethod = function(action) {
        var scriptElement = root.document.createElement('script');
        var id = nextHandle++;
        tasksByHandle[id] = action;
        scriptElement.onreadystatechange = function() {
          runTask(id);
          scriptElement.onreadystatechange = null;
          scriptElement.parentNode.removeChild(scriptElement);
          scriptElement = null;
        };
        root.document.documentElement.appendChild(scriptElement);
        return id;
      };
    } else {
      scheduleMethod = function(action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        localSetTimeout(function() {
          runTask(id);
        }, 0);
        return id;
      };
    }
  }());
  var DefaultScheduler = (function(__super__) {
    inherits(DefaultScheduler, __super__);
    function DefaultScheduler() {
      __super__.call(this);
    }
    function DefaultSchedulerDisposable(id) {
      this._id = id;
      this.isDisposed = false;
    }
    DefaultSchedulerDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        localClearTimeout(this._id);
      }
    };
    DefaultScheduler.prototype.schedule = function(state, action) {
      var scheduler = this,
          disposable = new SingleAssignmentDisposable();
      var id = scheduleMethod(function() {
        !disposable.isDisposed && disposable.setDisposable(disposableFixup(action(scheduler, state)));
      });
      return new BinaryDisposable(disposable, new DefaultSchedulerDisposable(id));
    };
    DefaultScheduler.prototype._scheduleFuture = function(state, dueTime, action) {
      var scheduler = this,
          dt = Scheduler.normalize(dueTime),
          disposable = new SingleAssignmentDisposable();
      if (dt === 0) {
        return scheduler.schedule(state, action);
      }
      var id = localSetTimeout(function() {
        !disposable.isDisposed && disposable.setDisposable(disposableFixup(action(scheduler, state)));
      }, dt);
      return new BinaryDisposable(disposable, new DefaultSchedulerDisposable(id));
    };
    return DefaultScheduler;
  }(Scheduler));
  var defaultScheduler = Scheduler['default'] = Scheduler.async = new DefaultScheduler();
})(require("process"));
