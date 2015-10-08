(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  function dedupe(deps) {
    var newDeps = [];
    for (var i = 0, l = deps.length; i < l; i++)
      if (indexOf.call(newDeps, deps[i]) == -1)
        newDeps.push(deps[i])
    return newDeps;
  }

  function register(name, deps, declare, execute) {
    if (typeof name != 'string')
      throw "System.register provided no module name";

    var entry;

    // dynamic
    if (typeof declare == 'boolean') {
      entry = {
        declarative: false,
        deps: deps,
        execute: execute,
        executingRequire: declare
      };
    }
    else {
      // ES6 declarative
      entry = {
        declarative: true,
        deps: deps,
        declare: declare
      };
    }

    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry; 

    entry.deps = dedupe(entry.deps);

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }

  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;
      exports[name] = value;

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          var importerIndex = indexOf.call(importerModule.dependencies, module);
          importerModule.setters[importerIndex](exports);
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    if (!module.setters || !module.execute)
      throw new TypeError("Invalid System.register form for " + entry.name);

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        if (depEntry.module.exports && depEntry.module.exports.__esModule)
          depExports = depEntry.module.exports;
        else
          depExports = { 'default': depEntry.module.exports, __useDefault: true };
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    var module = entry.module.exports;

    if (!module || !entry.declarative && module.__esModule !== true)
      module = { 'default': module, __useDefault: true };

    // return the defined module object
    return modules[name] = module;
  };

  return function(mains, declare) {

    var System;
    var System = {
      register: register, 
      get: load, 
      set: function(name, module) {
        modules[name] = module; 
      },
      newModule: function(module) {
        return module;
      },
      global: global 
    };
    System.set('@empty', {});

    declare(System);

    for (var i = 0; i < mains.length; i++)
      load(mains[i]);
  }

})(typeof window != 'undefined' ? window : global)
/* (['mainModule'], function(System) {
  System.register(...);
}); */

(['src/app/boat-lineup-planner/main'], function(System) {

System.register("npm:react@0.14.0/lib/ReactCurrentOwner", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactCurrentOwner = {current: null};
  module.exports = ReactCurrentOwner;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/ExecutionEnvironment", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
  var ExecutionEnvironment = {
    canUseDOM: canUseDOM,
    canUseWorkers: typeof Worker !== 'undefined',
    canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),
    canUseViewport: canUseDOM && !!window.screen,
    isInWorker: !canUseDOM
  };
  module.exports = ExecutionEnvironment;
  global.define = __define;
  return module.exports;
});

System.register("npm:process@0.11.2/browser", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return ;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/getMarkupWrap", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;
    var shouldWrap = {};
    var selectWrap = [1, '<select multiple="true">', '</select>'];
    var tableWrap = [1, '<table>', '</table>'];
    var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];
    var svgWrap = [1, '<svg xmlns="http://www.w3.org/2000/svg">', '</svg>'];
    var markupWrap = {
      '*': [1, '?<div>', '</div>'],
      'area': [1, '<map>', '</map>'],
      'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
      'legend': [1, '<fieldset>', '</fieldset>'],
      'param': [1, '<object>', '</object>'],
      'tr': [2, '<table><tbody>', '</tbody></table>'],
      'optgroup': selectWrap,
      'option': selectWrap,
      'caption': tableWrap,
      'colgroup': tableWrap,
      'tbody': tableWrap,
      'tfoot': tableWrap,
      'thead': tableWrap,
      'td': trWrap,
      'th': trWrap
    };
    var svgElements = ['circle', 'clipPath', 'defs', 'ellipse', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'text', 'tspan'];
    svgElements.forEach(function(nodeName) {
      markupWrap[nodeName] = svgWrap;
      shouldWrap[nodeName] = true;
    });
    function getMarkupWrap(nodeName) {
      !!!dummyNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Markup wrapping node not initialized') : invariant(false) : undefined;
      if (!markupWrap.hasOwnProperty(nodeName)) {
        nodeName = '*';
      }
      if (!shouldWrap.hasOwnProperty(nodeName)) {
        if (nodeName === '*') {
          dummyNode.innerHTML = '<link />';
        } else {
          dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
        }
        shouldWrap[nodeName] = !dummyNode.firstChild;
      }
      return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
    }
    module.exports = getMarkupWrap;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/emptyFunction", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function makeEmptyFunction(arg) {
    return function() {
      return arg;
    };
  }
  function emptyFunction() {}
  emptyFunction.thatReturns = makeEmptyFunction;
  emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
  emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
  emptyFunction.thatReturnsNull = makeEmptyFunction(null);
  emptyFunction.thatReturnsThis = function() {
    return this;
  };
  emptyFunction.thatReturnsArgument = function(arg) {
    return arg;
  };
  module.exports = emptyFunction;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/keyMirror", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var keyMirror = function(obj) {
      var ret = {};
      var key;
      !(obj instanceof Object && !Array.isArray(obj)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'keyMirror(...): Argument must be an object.') : invariant(false) : undefined;
      for (key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        ret[key] = key;
      }
      return ret;
    };
    module.exports = keyMirror;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactPerf", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactPerf = {
      enableMeasure: false,
      storedMeasure: _noMeasure,
      measureMethods: function(object, objectName, methodNames) {
        if (process.env.NODE_ENV !== 'production') {
          for (var key in methodNames) {
            if (!methodNames.hasOwnProperty(key)) {
              continue;
            }
            object[key] = ReactPerf.measure(objectName, methodNames[key], object[key]);
          }
        }
      },
      measure: function(objName, fnName, func) {
        if (process.env.NODE_ENV !== 'production') {
          var measuredFunc = null;
          var wrapper = function() {
            if (ReactPerf.enableMeasure) {
              if (!measuredFunc) {
                measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
              }
              return measuredFunc.apply(this, arguments);
            }
            return func.apply(this, arguments);
          };
          wrapper.displayName = objName + '_' + fnName;
          return wrapper;
        }
        return func;
      },
      injection: {injectMeasure: function(measure) {
          ReactPerf.storedMeasure = measure;
        }}
    };
    function _noMeasure(objName, fnName, func) {
      return func;
    }
    module.exports = ReactPerf;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/setInnerHTML", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var WHITESPACE_TEST = /^[ \r\n\t\f]/;
    var NONVISIBLE_TEST = /<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/;
    var setInnerHTML = function(node, html) {
      node.innerHTML = html;
    };
    if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
      setInnerHTML = function(node, html) {
        MSApp.execUnsafeLocalFunction(function() {
          node.innerHTML = html;
        });
      };
    }
    if (ExecutionEnvironment.canUseDOM) {
      var testElement = document.createElement('div');
      testElement.innerHTML = ' ';
      if (testElement.innerHTML === '') {
        setInnerHTML = function(node, html) {
          if (node.parentNode) {
            node.parentNode.replaceChild(node, node);
          }
          if (WHITESPACE_TEST.test(html) || html[0] === '<' && NONVISIBLE_TEST.test(html)) {
            node.innerHTML = String.fromCharCode(0xFEFF) + html;
            var textNode = node.firstChild;
            if (textNode.data.length === 1) {
              node.removeChild(textNode);
            } else {
              textNode.deleteData(0, 1);
            }
          } else {
            node.innerHTML = html;
          }
        };
      }
    }
    module.exports = setInnerHTML;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/escapeTextContentForBrowser", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ESCAPE_LOOKUP = {
    '&': '&amp;',
    '>': '&gt;',
    '<': '&lt;',
    '"': '&quot;',
    '\'': '&#x27;'
  };
  var ESCAPE_REGEX = /[&><"']/g;
  function escaper(match) {
    return ESCAPE_LOOKUP[match];
  }
  function escapeTextContentForBrowser(text) {
    return ('' + text).replace(ESCAPE_REGEX, escaper);
  }
  module.exports = escapeTextContentForBrowser;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/DOMProperty", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function checkMask(value, bitmask) {
      return (value & bitmask) === bitmask;
    }
    var DOMPropertyInjection = {
      MUST_USE_ATTRIBUTE: 0x1,
      MUST_USE_PROPERTY: 0x2,
      HAS_SIDE_EFFECTS: 0x4,
      HAS_BOOLEAN_VALUE: 0x8,
      HAS_NUMERIC_VALUE: 0x10,
      HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
      HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,
      injectDOMPropertyConfig: function(domPropertyConfig) {
        var Injection = DOMPropertyInjection;
        var Properties = domPropertyConfig.Properties || {};
        var DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
        var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
        var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
        var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};
        if (domPropertyConfig.isCustomAttribute) {
          DOMProperty._isCustomAttributeFunctions.push(domPropertyConfig.isCustomAttribute);
        }
        for (var propName in Properties) {
          !!DOMProperty.properties.hasOwnProperty(propName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' + '\'%s\' which has already been injected. You may be accidentally ' + 'injecting the same DOM property config twice, or you may be ' + 'injecting two configs that have conflicting property names.', propName) : invariant(false) : undefined;
          var lowerCased = propName.toLowerCase();
          var propConfig = Properties[propName];
          var propertyInfo = {
            attributeName: lowerCased,
            attributeNamespace: null,
            propertyName: propName,
            mutationMethod: null,
            mustUseAttribute: checkMask(propConfig, Injection.MUST_USE_ATTRIBUTE),
            mustUseProperty: checkMask(propConfig, Injection.MUST_USE_PROPERTY),
            hasSideEffects: checkMask(propConfig, Injection.HAS_SIDE_EFFECTS),
            hasBooleanValue: checkMask(propConfig, Injection.HAS_BOOLEAN_VALUE),
            hasNumericValue: checkMask(propConfig, Injection.HAS_NUMERIC_VALUE),
            hasPositiveNumericValue: checkMask(propConfig, Injection.HAS_POSITIVE_NUMERIC_VALUE),
            hasOverloadedBooleanValue: checkMask(propConfig, Injection.HAS_OVERLOADED_BOOLEAN_VALUE)
          };
          !(!propertyInfo.mustUseAttribute || !propertyInfo.mustUseProperty) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Cannot require using both attribute and property: %s', propName) : invariant(false) : undefined;
          !(propertyInfo.mustUseProperty || !propertyInfo.hasSideEffects) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Properties that have side effects must use property: %s', propName) : invariant(false) : undefined;
          !(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Value can be one of boolean, overloaded boolean, or ' + 'numeric value, but not a combination: %s', propName) : invariant(false) : undefined;
          if (process.env.NODE_ENV !== 'production') {
            DOMProperty.getPossibleStandardName[lowerCased] = propName;
          }
          if (DOMAttributeNames.hasOwnProperty(propName)) {
            var attributeName = DOMAttributeNames[propName];
            propertyInfo.attributeName = attributeName;
            if (process.env.NODE_ENV !== 'production') {
              DOMProperty.getPossibleStandardName[attributeName] = propName;
            }
          }
          if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
            propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
          }
          if (DOMPropertyNames.hasOwnProperty(propName)) {
            propertyInfo.propertyName = DOMPropertyNames[propName];
          }
          if (DOMMutationMethods.hasOwnProperty(propName)) {
            propertyInfo.mutationMethod = DOMMutationMethods[propName];
          }
          DOMProperty.properties[propName] = propertyInfo;
        }
      }
    };
    var defaultValueCache = {};
    var DOMProperty = {
      ID_ATTRIBUTE_NAME: 'data-reactid',
      properties: {},
      getPossibleStandardName: process.env.NODE_ENV !== 'production' ? {} : null,
      _isCustomAttributeFunctions: [],
      isCustomAttribute: function(attributeName) {
        for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
          var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
          if (isCustomAttributeFn(attributeName)) {
            return true;
          }
        }
        return false;
      },
      getDefaultValueForProperty: function(nodeName, prop) {
        var nodeDefaults = defaultValueCache[nodeName];
        var testElement;
        if (!nodeDefaults) {
          defaultValueCache[nodeName] = nodeDefaults = {};
        }
        if (!(prop in nodeDefaults)) {
          testElement = document.createElement(nodeName);
          nodeDefaults[prop] = testElement[prop];
        }
        return nodeDefaults[prop];
      },
      injection: DOMPropertyInjection
    };
    module.exports = DOMProperty;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/quoteAttributeValueForBrowser", ["npm:react@0.14.0/lib/escapeTextContentForBrowser"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var escapeTextContentForBrowser = require("npm:react@0.14.0/lib/escapeTextContentForBrowser");
  function quoteAttributeValueForBrowser(value) {
    return '"' + escapeTextContentForBrowser(value) + '"';
  }
  module.exports = quoteAttributeValueForBrowser;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/warning", ["npm:fbjs@0.3.1/lib/emptyFunction", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
    var warning = emptyFunction;
    if (process.env.NODE_ENV !== 'production') {
      warning = function(condition, format) {
        for (var _len = arguments.length,
            args = Array(_len > 2 ? _len - 2 : 0),
            _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        if (format === undefined) {
          throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
        }
        if (format.indexOf('Failed Composite propType: ') === 0) {
          return ;
        }
        if (!condition) {
          var argIndex = 0;
          var message = 'Warning: ' + format.replace(/%s/g, function() {
            return args[argIndex++];
          });
          if (typeof console !== 'undefined') {
            console.error(message);
          }
          try {
            throw new Error(message);
          } catch (x) {}
        }
      };
    }
    module.exports = warning;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/EventConstants", ["npm:fbjs@0.3.1/lib/keyMirror"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var keyMirror = require("npm:fbjs@0.3.1/lib/keyMirror");
  var PropagationPhases = keyMirror({
    bubbled: null,
    captured: null
  });
  var topLevelTypes = keyMirror({
    topAbort: null,
    topBlur: null,
    topCanPlay: null,
    topCanPlayThrough: null,
    topChange: null,
    topClick: null,
    topCompositionEnd: null,
    topCompositionStart: null,
    topCompositionUpdate: null,
    topContextMenu: null,
    topCopy: null,
    topCut: null,
    topDoubleClick: null,
    topDrag: null,
    topDragEnd: null,
    topDragEnter: null,
    topDragExit: null,
    topDragLeave: null,
    topDragOver: null,
    topDragStart: null,
    topDrop: null,
    topDurationChange: null,
    topEmptied: null,
    topEncrypted: null,
    topEnded: null,
    topError: null,
    topFocus: null,
    topInput: null,
    topKeyDown: null,
    topKeyPress: null,
    topKeyUp: null,
    topLoad: null,
    topLoadedData: null,
    topLoadedMetadata: null,
    topLoadStart: null,
    topMouseDown: null,
    topMouseMove: null,
    topMouseOut: null,
    topMouseOver: null,
    topMouseUp: null,
    topPaste: null,
    topPause: null,
    topPlay: null,
    topPlaying: null,
    topProgress: null,
    topRateChange: null,
    topReset: null,
    topScroll: null,
    topSeeked: null,
    topSeeking: null,
    topSelectionChange: null,
    topStalled: null,
    topSubmit: null,
    topSuspend: null,
    topTextInput: null,
    topTimeUpdate: null,
    topTouchCancel: null,
    topTouchEnd: null,
    topTouchMove: null,
    topTouchStart: null,
    topVolumeChange: null,
    topWaiting: null,
    topWheel: null
  });
  var EventConstants = {
    topLevelTypes: topLevelTypes,
    PropagationPhases: PropagationPhases
  };
  module.exports = EventConstants;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/EventPluginRegistry", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var EventPluginOrder = null;
    var namesToPlugins = {};
    function recomputePluginOrdering() {
      if (!EventPluginOrder) {
        return ;
      }
      for (var pluginName in namesToPlugins) {
        var PluginModule = namesToPlugins[pluginName];
        var pluginIndex = EventPluginOrder.indexOf(pluginName);
        !(pluginIndex > -1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject event plugins that do not exist in ' + 'the plugin ordering, `%s`.', pluginName) : invariant(false) : undefined;
        if (EventPluginRegistry.plugins[pluginIndex]) {
          continue;
        }
        !PluginModule.extractEvents ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 'method, but `%s` does not.', pluginName) : invariant(false) : undefined;
        EventPluginRegistry.plugins[pluginIndex] = PluginModule;
        var publishedEvents = PluginModule.eventTypes;
        for (var eventName in publishedEvents) {
          !publishEventForPlugin(publishedEvents[eventName], PluginModule, eventName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : invariant(false) : undefined;
        }
      }
    }
    function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
      !!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same ' + 'event name, `%s`.', eventName) : invariant(false) : undefined;
      EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;
      var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
      if (phasedRegistrationNames) {
        for (var phaseName in phasedRegistrationNames) {
          if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
            var phasedRegistrationName = phasedRegistrationNames[phaseName];
            publishRegistrationName(phasedRegistrationName, PluginModule, eventName);
          }
        }
        return true;
      } else if (dispatchConfig.registrationName) {
        publishRegistrationName(dispatchConfig.registrationName, PluginModule, eventName);
        return true;
      }
      return false;
    }
    function publishRegistrationName(registrationName, PluginModule, eventName) {
      !!EventPluginRegistry.registrationNameModules[registrationName] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName) : invariant(false) : undefined;
      EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
      EventPluginRegistry.registrationNameDependencies[registrationName] = PluginModule.eventTypes[eventName].dependencies;
    }
    var EventPluginRegistry = {
      plugins: [],
      eventNameDispatchConfigs: {},
      registrationNameModules: {},
      registrationNameDependencies: {},
      injectEventPluginOrder: function(InjectedEventPluginOrder) {
        !!EventPluginOrder ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 'once. You are likely trying to load more than one copy of React.') : invariant(false) : undefined;
        EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
        recomputePluginOrdering();
      },
      injectEventPluginsByName: function(injectedNamesToPlugins) {
        var isOrderingDirty = false;
        for (var pluginName in injectedNamesToPlugins) {
          if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
            continue;
          }
          var PluginModule = injectedNamesToPlugins[pluginName];
          if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== PluginModule) {
            !!namesToPlugins[pluginName] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject two different event plugins ' + 'using the same name, `%s`.', pluginName) : invariant(false) : undefined;
            namesToPlugins[pluginName] = PluginModule;
            isOrderingDirty = true;
          }
        }
        if (isOrderingDirty) {
          recomputePluginOrdering();
        }
      },
      getPluginModuleForEvent: function(event) {
        var dispatchConfig = event.dispatchConfig;
        if (dispatchConfig.registrationName) {
          return EventPluginRegistry.registrationNameModules[dispatchConfig.registrationName] || null;
        }
        for (var phase in dispatchConfig.phasedRegistrationNames) {
          if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
            continue;
          }
          var PluginModule = EventPluginRegistry.registrationNameModules[dispatchConfig.phasedRegistrationNames[phase]];
          if (PluginModule) {
            return PluginModule;
          }
        }
        return null;
      },
      _resetEventPlugins: function() {
        EventPluginOrder = null;
        for (var pluginName in namesToPlugins) {
          if (namesToPlugins.hasOwnProperty(pluginName)) {
            delete namesToPlugins[pluginName];
          }
        }
        EventPluginRegistry.plugins.length = 0;
        var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
        for (var eventName in eventNameDispatchConfigs) {
          if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
            delete eventNameDispatchConfigs[eventName];
          }
        }
        var registrationNameModules = EventPluginRegistry.registrationNameModules;
        for (var registrationName in registrationNameModules) {
          if (registrationNameModules.hasOwnProperty(registrationName)) {
            delete registrationNameModules[registrationName];
          }
        }
      }
    };
    module.exports = EventPluginRegistry;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactErrorUtils", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var caughtError = null;
    function invokeGuardedCallback(name, func, a, b) {
      try {
        return func(a, b);
      } catch (x) {
        if (caughtError === null) {
          caughtError = x;
        }
        return undefined;
      }
    }
    var ReactErrorUtils = {
      invokeGuardedCallback: invokeGuardedCallback,
      invokeGuardedCallbackWithCatch: invokeGuardedCallback,
      rethrowCaughtError: function() {
        if (caughtError) {
          var error = caughtError;
          caughtError = null;
          throw error;
        }
      }
    };
    if (process.env.NODE_ENV !== 'production') {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
        var fakeNode = document.createElement('react');
        ReactErrorUtils.invokeGuardedCallback = function(name, func, a, b) {
          var boundFunc = func.bind(null, a, b);
          fakeNode.addEventListener(name, boundFunc, false);
          fakeNode.dispatchEvent(new Event(name));
          fakeNode.removeEventListener(name, boundFunc, false);
        };
      }
    }
    module.exports = ReactErrorUtils;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/accumulateInto", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function accumulateInto(current, next) {
      !(next != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'accumulateInto(...): Accumulated items must not be null or undefined.') : invariant(false) : undefined;
      if (current == null) {
        return next;
      }
      var currentIsArray = Array.isArray(current);
      var nextIsArray = Array.isArray(next);
      if (currentIsArray && nextIsArray) {
        current.push.apply(current, next);
        return current;
      }
      if (currentIsArray) {
        current.push(next);
        return current;
      }
      if (nextIsArray) {
        return [current].concat(next);
      }
      return [current, next];
    }
    module.exports = accumulateInto;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/forEachAccumulated", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var forEachAccumulated = function(arr, cb, scope) {
    if (Array.isArray(arr)) {
      arr.forEach(cb, scope);
    } else if (arr) {
      cb.call(scope, arr);
    }
  };
  module.exports = forEachAccumulated;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactEventEmitterMixin", ["npm:react@0.14.0/lib/EventPluginHub"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var EventPluginHub = require("npm:react@0.14.0/lib/EventPluginHub");
  function runEventQueueInBatch(events) {
    EventPluginHub.enqueueEvents(events);
    EventPluginHub.processEventQueue(false);
  }
  var ReactEventEmitterMixin = {handleTopLevel: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      var events = EventPluginHub.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
      runEventQueueInBatch(events);
    }};
  module.exports = ReactEventEmitterMixin;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ViewportMetrics", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ViewportMetrics = {
    currentScrollLeft: 0,
    currentScrollTop: 0,
    refreshScrollValues: function(scrollPosition) {
      ViewportMetrics.currentScrollLeft = scrollPosition.x;
      ViewportMetrics.currentScrollTop = scrollPosition.y;
    }
  };
  module.exports = ViewportMetrics;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/Object.assign", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function assign(target, sources) {
    if (target == null) {
      throw new TypeError('Object.assign target cannot be null or undefined');
    }
    var to = Object(target);
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
      var nextSource = arguments[nextIndex];
      if (nextSource == null) {
        continue;
      }
      var from = Object(nextSource);
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
    }
    return to;
  }
  module.exports = assign;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/isEventSupported", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var useHasFeature;
  if (ExecutionEnvironment.canUseDOM) {
    useHasFeature = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature('', '') !== true;
  }
  function isEventSupported(eventNameSuffix, capture) {
    if (!ExecutionEnvironment.canUseDOM || capture && !('addEventListener' in document)) {
      return false;
    }
    var eventName = 'on' + eventNameSuffix;
    var isSupported = (eventName in document);
    if (!isSupported) {
      var element = document.createElement('div');
      element.setAttribute(eventName, 'return;');
      isSupported = typeof element[eventName] === 'function';
    }
    if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
      isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
    }
    return isSupported;
  }
  module.exports = isEventSupported;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMFeatureFlags", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactDOMFeatureFlags = {useCreateElement: false};
  module.exports = ReactDOMFeatureFlags;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactElement", ["npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/Object.assign", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;
    var RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true
    };
    var canDefineProperty = false;
    if (process.env.NODE_ENV !== 'production') {
      try {
        Object.defineProperty({}, 'x', {});
        canDefineProperty = true;
      } catch (x) {}
    }
    var ReactElement = function(type, key, ref, self, source, owner, props) {
      var element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: ref,
        props: props,
        _owner: owner
      };
      if (process.env.NODE_ENV !== 'production') {
        element._store = {};
        if (canDefineProperty) {
          Object.defineProperty(element._store, 'validated', {
            configurable: false,
            enumerable: false,
            writable: true,
            value: false
          });
          Object.defineProperty(element, '_self', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: self
          });
          Object.defineProperty(element, '_source', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: source
          });
        } else {
          element._store.validated = false;
          element._self = self;
          element._source = source;
        }
        Object.freeze(element.props);
        Object.freeze(element);
      }
      return element;
    };
    ReactElement.createElement = function(type, config, children) {
      var propName;
      var props = {};
      var key = null;
      var ref = null;
      var self = null;
      var source = null;
      if (config != null) {
        ref = config.ref === undefined ? null : config.ref;
        key = config.key === undefined ? null : '' + config.key;
        self = config.__self === undefined ? null : config.__self;
        source = config.__source === undefined ? null : config.__source;
        for (propName in config) {
          if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
          }
        }
      }
      var childrenLength = arguments.length - 2;
      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        var childArray = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
      }
      if (type && type.defaultProps) {
        var defaultProps = type.defaultProps;
        for (propName in defaultProps) {
          if (typeof props[propName] === 'undefined') {
            props[propName] = defaultProps[propName];
          }
        }
      }
      return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
    };
    ReactElement.createFactory = function(type) {
      var factory = ReactElement.createElement.bind(null, type);
      factory.type = type;
      return factory;
    };
    ReactElement.cloneAndReplaceKey = function(oldElement, newKey) {
      var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
      return newElement;
    };
    ReactElement.cloneAndReplaceProps = function(oldElement, newProps) {
      var newElement = ReactElement(oldElement.type, oldElement.key, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, newProps);
      if (process.env.NODE_ENV !== 'production') {
        newElement._store.validated = oldElement._store.validated;
      }
      return newElement;
    };
    ReactElement.cloneElement = function(element, config, children) {
      var propName;
      var props = assign({}, element.props);
      var key = element.key;
      var ref = element.ref;
      var self = element._self;
      var source = element._source;
      var owner = element._owner;
      if (config != null) {
        if (config.ref !== undefined) {
          ref = config.ref;
          owner = ReactCurrentOwner.current;
        }
        if (config.key !== undefined) {
          key = '' + config.key;
        }
        for (propName in config) {
          if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
          }
        }
      }
      var childrenLength = arguments.length - 2;
      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        var childArray = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
      }
      return ReactElement(element.type, key, ref, self, source, owner, props);
    };
    ReactElement.isValidElement = function(object) {
      return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    };
    module.exports = ReactElement;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactEmptyComponentRegistry", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var nullComponentIDsRegistry = {};
  function isNullComponentID(id) {
    return !!nullComponentIDsRegistry[id];
  }
  function registerNullComponentID(id) {
    nullComponentIDsRegistry[id] = true;
  }
  function deregisterNullComponentID(id) {
    delete nullComponentIDsRegistry[id];
  }
  var ReactEmptyComponentRegistry = {
    isNullComponentID: isNullComponentID,
    registerNullComponentID: registerNullComponentID,
    deregisterNullComponentID: deregisterNullComponentID
  };
  module.exports = ReactEmptyComponentRegistry;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactRootIndex", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactRootIndexInjection = {injectCreateReactRootIndex: function(_createReactRootIndex) {
      ReactRootIndex.createReactRootIndex = _createReactRootIndex;
    }};
  var ReactRootIndex = {
    createReactRootIndex: null,
    injection: ReactRootIndexInjection
  };
  module.exports = ReactRootIndex;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactInstanceMap", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactInstanceMap = {
    remove: function(key) {
      key._reactInternalInstance = undefined;
    },
    get: function(key) {
      return key._reactInternalInstance;
    },
    has: function(key) {
      return key._reactInternalInstance !== undefined;
    },
    set: function(key, value) {
      key._reactInternalInstance = value;
    }
  };
  module.exports = ReactInstanceMap;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/adler32", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var MOD = 65521;
  function adler32(data) {
    var a = 1;
    var b = 0;
    var i = 0;
    var l = data.length;
    var m = l & ~0x3;
    while (i < m) {
      for (; i < Math.min(i + 4096, m); i += 4) {
        b += (a += data.charCodeAt(i)) + (a += data.charCodeAt(i + 1)) + (a += data.charCodeAt(i + 2)) + (a += data.charCodeAt(i + 3));
      }
      a %= MOD;
      b %= MOD;
    }
    for (; i < l; i++) {
      b += a += data.charCodeAt(i);
    }
    a %= MOD;
    b %= MOD;
    return a | b << 16;
  }
  module.exports = adler32;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactOwner", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var ReactOwner = {
      isValidOwner: function(object) {
        return !!(object && typeof object.attachRef === 'function' && typeof object.detachRef === 'function');
      },
      addComponentAsRefTo: function(component, ref, owner) {
        !ReactOwner.isValidOwner(owner) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'addComponentAsRefTo(...): Only a ReactOwner can have refs. You might ' + 'be adding a ref to a component that was not created inside a component\'s ' + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).') : invariant(false) : undefined;
        owner.attachRef(ref, component);
      },
      removeComponentAsRefFrom: function(component, ref, owner) {
        !ReactOwner.isValidOwner(owner) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. You might ' + 'be removing a ref to a component that was not created inside a component\'s ' + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).') : invariant(false) : undefined;
        if (owner.getPublicInstance().refs[ref] === component.getPublicInstance()) {
          owner.detachRef(ref);
        }
      }
    };
    module.exports = ReactOwner;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/PooledClass", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var oneArgumentPooler = function(copyFieldsFrom) {
      var Klass = this;
      if (Klass.instancePool.length) {
        var instance = Klass.instancePool.pop();
        Klass.call(instance, copyFieldsFrom);
        return instance;
      } else {
        return new Klass(copyFieldsFrom);
      }
    };
    var twoArgumentPooler = function(a1, a2) {
      var Klass = this;
      if (Klass.instancePool.length) {
        var instance = Klass.instancePool.pop();
        Klass.call(instance, a1, a2);
        return instance;
      } else {
        return new Klass(a1, a2);
      }
    };
    var threeArgumentPooler = function(a1, a2, a3) {
      var Klass = this;
      if (Klass.instancePool.length) {
        var instance = Klass.instancePool.pop();
        Klass.call(instance, a1, a2, a3);
        return instance;
      } else {
        return new Klass(a1, a2, a3);
      }
    };
    var fourArgumentPooler = function(a1, a2, a3, a4) {
      var Klass = this;
      if (Klass.instancePool.length) {
        var instance = Klass.instancePool.pop();
        Klass.call(instance, a1, a2, a3, a4);
        return instance;
      } else {
        return new Klass(a1, a2, a3, a4);
      }
    };
    var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
      var Klass = this;
      if (Klass.instancePool.length) {
        var instance = Klass.instancePool.pop();
        Klass.call(instance, a1, a2, a3, a4, a5);
        return instance;
      } else {
        return new Klass(a1, a2, a3, a4, a5);
      }
    };
    var standardReleaser = function(instance) {
      var Klass = this;
      !(instance instanceof Klass) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Trying to release an instance into a pool of a different type.') : invariant(false) : undefined;
      instance.destructor();
      if (Klass.instancePool.length < Klass.poolSize) {
        Klass.instancePool.push(instance);
      }
    };
    var DEFAULT_POOL_SIZE = 10;
    var DEFAULT_POOLER = oneArgumentPooler;
    var addPoolingTo = function(CopyConstructor, pooler) {
      var NewKlass = CopyConstructor;
      NewKlass.instancePool = [];
      NewKlass.getPooled = pooler || DEFAULT_POOLER;
      if (!NewKlass.poolSize) {
        NewKlass.poolSize = DEFAULT_POOL_SIZE;
      }
      NewKlass.release = standardReleaser;
      return NewKlass;
    };
    var PooledClass = {
      addPoolingTo: addPoolingTo,
      oneArgumentPooler: oneArgumentPooler,
      twoArgumentPooler: twoArgumentPooler,
      threeArgumentPooler: threeArgumentPooler,
      fourArgumentPooler: fourArgumentPooler,
      fiveArgumentPooler: fiveArgumentPooler
    };
    module.exports = PooledClass;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/Transaction", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var Mixin = {
      reinitializeTransaction: function() {
        this.transactionWrappers = this.getTransactionWrappers();
        if (this.wrapperInitData) {
          this.wrapperInitData.length = 0;
        } else {
          this.wrapperInitData = [];
        }
        this._isInTransaction = false;
      },
      _isInTransaction: false,
      getTransactionWrappers: null,
      isInTransaction: function() {
        return !!this._isInTransaction;
      },
      perform: function(method, scope, a, b, c, d, e, f) {
        !!this.isInTransaction() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Transaction.perform(...): Cannot initialize a transaction when there ' + 'is already an outstanding transaction.') : invariant(false) : undefined;
        var errorThrown;
        var ret;
        try {
          this._isInTransaction = true;
          errorThrown = true;
          this.initializeAll(0);
          ret = method.call(scope, a, b, c, d, e, f);
          errorThrown = false;
        } finally {
          try {
            if (errorThrown) {
              try {
                this.closeAll(0);
              } catch (err) {}
            } else {
              this.closeAll(0);
            }
          } finally {
            this._isInTransaction = false;
          }
        }
        return ret;
      },
      initializeAll: function(startIndex) {
        var transactionWrappers = this.transactionWrappers;
        for (var i = startIndex; i < transactionWrappers.length; i++) {
          var wrapper = transactionWrappers[i];
          try {
            this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
            this.wrapperInitData[i] = wrapper.initialize ? wrapper.initialize.call(this) : null;
          } finally {
            if (this.wrapperInitData[i] === Transaction.OBSERVED_ERROR) {
              try {
                this.initializeAll(i + 1);
              } catch (err) {}
            }
          }
        }
      },
      closeAll: function(startIndex) {
        !this.isInTransaction() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Transaction.closeAll(): Cannot close transaction when none are open.') : invariant(false) : undefined;
        var transactionWrappers = this.transactionWrappers;
        for (var i = startIndex; i < transactionWrappers.length; i++) {
          var wrapper = transactionWrappers[i];
          var initData = this.wrapperInitData[i];
          var errorThrown;
          try {
            errorThrown = true;
            if (initData !== Transaction.OBSERVED_ERROR && wrapper.close) {
              wrapper.close.call(this, initData);
            }
            errorThrown = false;
          } finally {
            if (errorThrown) {
              try {
                this.closeAll(i + 1);
              } catch (e) {}
            }
          }
        }
        this.wrapperInitData.length = 0;
      }
    };
    var Transaction = {
      Mixin: Mixin,
      OBSERVED_ERROR: {}
    };
    module.exports = Transaction;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/emptyObject", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var emptyObject = {};
    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(emptyObject);
    }
    module.exports = emptyObject;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/isNode", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function isNode(object) {
    return !!(object && (typeof Node === 'function' ? object instanceof Node : typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string'));
  }
  module.exports = isNode;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactComponentEnvironment", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var injected = false;
    var ReactComponentEnvironment = {
      unmountIDFromEnvironment: null,
      replaceNodeWithMarkupByID: null,
      processChildrenUpdates: null,
      injection: {injectEnvironment: function(environment) {
          !!injected ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactCompositeComponent: injectEnvironment() can only be called once.') : invariant(false) : undefined;
          ReactComponentEnvironment.unmountIDFromEnvironment = environment.unmountIDFromEnvironment;
          ReactComponentEnvironment.replaceNodeWithMarkupByID = environment.replaceNodeWithMarkupByID;
          ReactComponentEnvironment.processChildrenUpdates = environment.processChildrenUpdates;
          injected = true;
        }}
    };
    module.exports = ReactComponentEnvironment;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactPropTypeLocations", ["npm:fbjs@0.3.1/lib/keyMirror"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var keyMirror = require("npm:fbjs@0.3.1/lib/keyMirror");
  var ReactPropTypeLocations = keyMirror({
    prop: null,
    context: null,
    childContext: null
  });
  module.exports = ReactPropTypeLocations;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactPropTypeLocationNames", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactPropTypeLocationNames = {};
    if (process.env.NODE_ENV !== 'production') {
      ReactPropTypeLocationNames = {
        prop: 'prop',
        context: 'context',
        childContext: 'child context'
      };
    }
    module.exports = ReactPropTypeLocationNames;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/shouldUpdateReactComponent", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function shouldUpdateReactComponent(prevElement, nextElement) {
    var prevEmpty = prevElement === null || prevElement === false;
    var nextEmpty = nextElement === null || nextElement === false;
    if (prevEmpty || nextEmpty) {
      return prevEmpty === nextEmpty;
    }
    var prevType = typeof prevElement;
    var nextType = typeof nextElement;
    if (prevType === 'string' || prevType === 'number') {
      return nextType === 'string' || nextType === 'number';
    } else {
      return nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key;
    }
    return false;
  }
  module.exports = shouldUpdateReactComponent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactEmptyComponent", ["npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactEmptyComponentRegistry", "npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/Object.assign"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
  var ReactEmptyComponentRegistry = require("npm:react@0.14.0/lib/ReactEmptyComponentRegistry");
  var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var placeholderElement;
  var ReactEmptyComponentInjection = {injectEmptyComponent: function(component) {
      placeholderElement = ReactElement.createElement(component);
    }};
  var ReactEmptyComponent = function(instantiate) {
    this._currentElement = null;
    this._rootNodeID = null;
    this._renderedComponent = instantiate(placeholderElement);
  };
  assign(ReactEmptyComponent.prototype, {
    construct: function(element) {},
    mountComponent: function(rootID, transaction, context) {
      ReactEmptyComponentRegistry.registerNullComponentID(rootID);
      this._rootNodeID = rootID;
      return ReactReconciler.mountComponent(this._renderedComponent, rootID, transaction, context);
    },
    receiveComponent: function() {},
    unmountComponent: function(rootID, transaction, context) {
      ReactReconciler.unmountComponent(this._renderedComponent);
      ReactEmptyComponentRegistry.deregisterNullComponentID(this._rootNodeID);
      this._rootNodeID = null;
      this._renderedComponent = null;
    }
  });
  ReactEmptyComponent.injection = ReactEmptyComponentInjection;
  module.exports = ReactEmptyComponent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactNativeComponent", ["npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var autoGenerateWrapperClass = null;
    var genericComponentClass = null;
    var tagToComponentClass = {};
    var textComponentClass = null;
    var ReactNativeComponentInjection = {
      injectGenericComponentClass: function(componentClass) {
        genericComponentClass = componentClass;
      },
      injectTextComponentClass: function(componentClass) {
        textComponentClass = componentClass;
      },
      injectComponentClasses: function(componentClasses) {
        assign(tagToComponentClass, componentClasses);
      }
    };
    function getComponentClassForElement(element) {
      if (typeof element.type === 'function') {
        return element.type;
      }
      var tag = element.type;
      var componentClass = tagToComponentClass[tag];
      if (componentClass == null) {
        tagToComponentClass[tag] = componentClass = autoGenerateWrapperClass(tag);
      }
      return componentClass;
    }
    function createInternalComponent(element) {
      !genericComponentClass ? process.env.NODE_ENV !== 'production' ? invariant(false, 'There is no registered component for the tag %s', element.type) : invariant(false) : undefined;
      return new genericComponentClass(element.type, element.props);
    }
    function createInstanceForText(text) {
      return new textComponentClass(text);
    }
    function isTextComponent(component) {
      return component instanceof textComponentClass;
    }
    var ReactNativeComponent = {
      getComponentClassForElement: getComponentClassForElement,
      createInternalComponent: createInternalComponent,
      createInstanceForText: createInstanceForText,
      isTextComponent: isTextComponent,
      injection: ReactNativeComponentInjection
    };
    module.exports = ReactNativeComponent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/validateDOMNesting", ["npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyFunction", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var validateDOMNesting = emptyFunction;
    if (process.env.NODE_ENV !== 'production') {
      var specialTags = ['address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'isindex', 'li', 'link', 'listing', 'main', 'marquee', 'menu', 'menuitem', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext', 'pre', 'script', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp'];
      var inScopeTags = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template', 'foreignObject', 'desc', 'title'];
      var buttonScopeTags = inScopeTags.concat(['button']);
      var impliedEndTags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];
      var emptyAncestorInfo = {
        parentTag: null,
        formTag: null,
        aTagInScope: null,
        buttonTagInScope: null,
        nobrTagInScope: null,
        pTagInButtonScope: null,
        listItemTagAutoclosing: null,
        dlItemTagAutoclosing: null
      };
      var updatedAncestorInfo = function(oldInfo, tag, instance) {
        var ancestorInfo = assign({}, oldInfo || emptyAncestorInfo);
        var info = {
          tag: tag,
          instance: instance
        };
        if (inScopeTags.indexOf(tag) !== -1) {
          ancestorInfo.aTagInScope = null;
          ancestorInfo.buttonTagInScope = null;
          ancestorInfo.nobrTagInScope = null;
        }
        if (buttonScopeTags.indexOf(tag) !== -1) {
          ancestorInfo.pTagInButtonScope = null;
        }
        if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
          ancestorInfo.listItemTagAutoclosing = null;
          ancestorInfo.dlItemTagAutoclosing = null;
        }
        ancestorInfo.parentTag = info;
        if (tag === 'form') {
          ancestorInfo.formTag = info;
        }
        if (tag === 'a') {
          ancestorInfo.aTagInScope = info;
        }
        if (tag === 'button') {
          ancestorInfo.buttonTagInScope = info;
        }
        if (tag === 'nobr') {
          ancestorInfo.nobrTagInScope = info;
        }
        if (tag === 'p') {
          ancestorInfo.pTagInButtonScope = info;
        }
        if (tag === 'li') {
          ancestorInfo.listItemTagAutoclosing = info;
        }
        if (tag === 'dd' || tag === 'dt') {
          ancestorInfo.dlItemTagAutoclosing = info;
        }
        return ancestorInfo;
      };
      var isTagValidWithParent = function(tag, parentTag) {
        switch (parentTag) {
          case 'select':
            return tag === 'option' || tag === 'optgroup' || tag === '#text';
          case 'optgroup':
            return tag === 'option' || tag === '#text';
          case 'option':
            return tag === '#text';
          case 'tr':
            return tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template';
          case 'tbody':
          case 'thead':
          case 'tfoot':
            return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';
          case 'colgroup':
            return tag === 'col' || tag === 'template';
          case 'table':
            return tag === 'caption' || tag === 'colgroup' || tag === 'tbody' || tag === 'tfoot' || tag === 'thead' || tag === 'style' || tag === 'script' || tag === 'template';
          case 'head':
            return tag === 'base' || tag === 'basefont' || tag === 'bgsound' || tag === 'link' || tag === 'meta' || tag === 'title' || tag === 'noscript' || tag === 'noframes' || tag === 'style' || tag === 'script' || tag === 'template';
          case 'html':
            return tag === 'head' || tag === 'body';
        }
        switch (tag) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return parentTag !== 'h1' && parentTag !== 'h2' && parentTag !== 'h3' && parentTag !== 'h4' && parentTag !== 'h5' && parentTag !== 'h6';
          case 'rp':
          case 'rt':
            return impliedEndTags.indexOf(parentTag) === -1;
          case 'caption':
          case 'col':
          case 'colgroup':
          case 'frame':
          case 'head':
          case 'tbody':
          case 'td':
          case 'tfoot':
          case 'th':
          case 'thead':
          case 'tr':
            return parentTag == null;
        }
        return true;
      };
      var findInvalidAncestorForTag = function(tag, ancestorInfo) {
        switch (tag) {
          case 'address':
          case 'article':
          case 'aside':
          case 'blockquote':
          case 'center':
          case 'details':
          case 'dialog':
          case 'dir':
          case 'div':
          case 'dl':
          case 'fieldset':
          case 'figcaption':
          case 'figure':
          case 'footer':
          case 'header':
          case 'hgroup':
          case 'main':
          case 'menu':
          case 'nav':
          case 'ol':
          case 'p':
          case 'section':
          case 'summary':
          case 'ul':
          case 'pre':
          case 'listing':
          case 'table':
          case 'hr':
          case 'xmp':
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return ancestorInfo.pTagInButtonScope;
          case 'form':
            return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;
          case 'li':
            return ancestorInfo.listItemTagAutoclosing;
          case 'dd':
          case 'dt':
            return ancestorInfo.dlItemTagAutoclosing;
          case 'button':
            return ancestorInfo.buttonTagInScope;
          case 'a':
            return ancestorInfo.aTagInScope;
          case 'nobr':
            return ancestorInfo.nobrTagInScope;
        }
        return null;
      };
      var findOwnerStack = function(instance) {
        if (!instance) {
          return [];
        }
        var stack = [];
        do {
          stack.push(instance);
        } while (instance = instance._currentElement._owner);
        stack.reverse();
        return stack;
      };
      var didWarn = {};
      validateDOMNesting = function(childTag, childInstance, ancestorInfo) {
        ancestorInfo = ancestorInfo || emptyAncestorInfo;
        var parentInfo = ancestorInfo.parentTag;
        var parentTag = parentInfo && parentInfo.tag;
        var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
        var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
        var problematic = invalidParent || invalidAncestor;
        if (problematic) {
          var ancestorTag = problematic.tag;
          var ancestorInstance = problematic.instance;
          var childOwner = childInstance && childInstance._currentElement._owner;
          var ancestorOwner = ancestorInstance && ancestorInstance._currentElement._owner;
          var childOwners = findOwnerStack(childOwner);
          var ancestorOwners = findOwnerStack(ancestorOwner);
          var minStackLen = Math.min(childOwners.length, ancestorOwners.length);
          var i;
          var deepestCommon = -1;
          for (i = 0; i < minStackLen; i++) {
            if (childOwners[i] === ancestorOwners[i]) {
              deepestCommon = i;
            } else {
              break;
            }
          }
          var UNKNOWN = '(unknown)';
          var childOwnerNames = childOwners.slice(deepestCommon + 1).map(function(inst) {
            return inst.getName() || UNKNOWN;
          });
          var ancestorOwnerNames = ancestorOwners.slice(deepestCommon + 1).map(function(inst) {
            return inst.getName() || UNKNOWN;
          });
          var ownerInfo = [].concat(deepestCommon !== -1 ? childOwners[deepestCommon].getName() || UNKNOWN : [], ancestorOwnerNames, ancestorTag, invalidAncestor ? ['...'] : [], childOwnerNames, childTag).join(' > ');
          var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + ownerInfo;
          if (didWarn[warnKey]) {
            return ;
          }
          didWarn[warnKey] = true;
          if (invalidParent) {
            var info = '';
            if (ancestorTag === 'table' && childTag === 'tr') {
              info += ' Add a <tbody> to your code to match the DOM tree generated by ' + 'the browser.';
            }
            process.env.NODE_ENV !== 'production' ? warning(false, 'validateDOMNesting(...): <%s> cannot appear as a child of <%s>. ' + 'See %s.%s', childTag, ancestorTag, ownerInfo, info) : undefined;
          } else {
            process.env.NODE_ENV !== 'production' ? warning(false, 'validateDOMNesting(...): <%s> cannot appear as a descendant of ' + '<%s>. See %s.', childTag, ancestorTag, ownerInfo) : undefined;
          }
        }
      };
      validateDOMNesting.ancestorInfoContextKey = '__validateDOMNesting_ancestorInfo$' + Math.random().toString(36).slice(2);
      validateDOMNesting.updatedAncestorInfo = updatedAncestorInfo;
      validateDOMNesting.isTagValidInContext = function(tag, ancestorInfo) {
        ancestorInfo = ancestorInfo || emptyAncestorInfo;
        var parentInfo = ancestorInfo.parentTag;
        var parentTag = parentInfo && parentInfo.tag;
        return isTagValidWithParent(tag, parentTag) && !findInvalidAncestorForTag(tag, ancestorInfo);
      };
    }
    module.exports = validateDOMNesting;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/EventPropagators", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/EventPluginHub", "npm:fbjs@0.3.1/lib/warning", "npm:react@0.14.0/lib/accumulateInto", "npm:react@0.14.0/lib/forEachAccumulated", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
    var EventPluginHub = require("npm:react@0.14.0/lib/EventPluginHub");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var accumulateInto = require("npm:react@0.14.0/lib/accumulateInto");
    var forEachAccumulated = require("npm:react@0.14.0/lib/forEachAccumulated");
    var PropagationPhases = EventConstants.PropagationPhases;
    var getListener = EventPluginHub.getListener;
    function listenerAtPhase(id, event, propagationPhase) {
      var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
      return getListener(id, registrationName);
    }
    function accumulateDirectionalDispatches(domID, upwards, event) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(domID, 'Dispatching id must not be null') : undefined;
      }
      var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
      var listener = listenerAtPhase(domID, event, phase);
      if (listener) {
        event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
        event._dispatchIDs = accumulateInto(event._dispatchIDs, domID);
      }
    }
    function accumulateTwoPhaseDispatchesSingle(event) {
      if (event && event.dispatchConfig.phasedRegistrationNames) {
        EventPluginHub.injection.getInstanceHandle().traverseTwoPhase(event.dispatchMarker, accumulateDirectionalDispatches, event);
      }
    }
    function accumulateTwoPhaseDispatchesSingleSkipTarget(event) {
      if (event && event.dispatchConfig.phasedRegistrationNames) {
        EventPluginHub.injection.getInstanceHandle().traverseTwoPhaseSkipTarget(event.dispatchMarker, accumulateDirectionalDispatches, event);
      }
    }
    function accumulateDispatches(id, ignoredDirection, event) {
      if (event && event.dispatchConfig.registrationName) {
        var registrationName = event.dispatchConfig.registrationName;
        var listener = getListener(id, registrationName);
        if (listener) {
          event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
          event._dispatchIDs = accumulateInto(event._dispatchIDs, id);
        }
      }
    }
    function accumulateDirectDispatchesSingle(event) {
      if (event && event.dispatchConfig.registrationName) {
        accumulateDispatches(event.dispatchMarker, null, event);
      }
    }
    function accumulateTwoPhaseDispatches(events) {
      forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
    }
    function accumulateTwoPhaseDispatchesSkipTarget(events) {
      forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget);
    }
    function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
      EventPluginHub.injection.getInstanceHandle().traverseEnterLeave(fromID, toID, accumulateDispatches, leave, enter);
    }
    function accumulateDirectDispatches(events) {
      forEachAccumulated(events, accumulateDirectDispatchesSingle);
    }
    var EventPropagators = {
      accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
      accumulateTwoPhaseDispatchesSkipTarget: accumulateTwoPhaseDispatchesSkipTarget,
      accumulateDirectDispatches: accumulateDirectDispatches,
      accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches
    };
    module.exports = EventPropagators;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getTextContentAccessor", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var contentKey = null;
  function getTextContentAccessor() {
    if (!contentKey && ExecutionEnvironment.canUseDOM) {
      contentKey = 'textContent' in document.documentElement ? 'textContent' : 'innerText';
    }
    return contentKey;
  }
  module.exports = getTextContentAccessor;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticEvent", ["npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyFunction", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var EventInterface = {
      type: null,
      currentTarget: emptyFunction.thatReturnsNull,
      eventPhase: null,
      bubbles: null,
      cancelable: null,
      timeStamp: function(event) {
        return event.timeStamp || Date.now();
      },
      defaultPrevented: null,
      isTrusted: null
    };
    function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      this.dispatchConfig = dispatchConfig;
      this.dispatchMarker = dispatchMarker;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;
      this.currentTarget = nativeEventTarget;
      var Interface = this.constructor.Interface;
      for (var propName in Interface) {
        if (!Interface.hasOwnProperty(propName)) {
          continue;
        }
        var normalize = Interface[propName];
        if (normalize) {
          this[propName] = normalize(nativeEvent);
        } else {
          this[propName] = nativeEvent[propName];
        }
      }
      var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
      if (defaultPrevented) {
        this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
      } else {
        this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
      }
      this.isPropagationStopped = emptyFunction.thatReturnsFalse;
    }
    assign(SyntheticEvent.prototype, {
      preventDefault: function() {
        this.defaultPrevented = true;
        var event = this.nativeEvent;
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(event, 'This synthetic event is reused for performance reasons. If you\'re ' + 'seeing this, you\'re calling `preventDefault` on a ' + 'released/nullified synthetic event. This is a no-op. See ' + 'https://fb.me/react-event-pooling for more information.') : undefined;
        }
        if (!event) {
          return ;
        }
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }
        this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
      },
      stopPropagation: function() {
        var event = this.nativeEvent;
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(event, 'This synthetic event is reused for performance reasons. If you\'re ' + 'seeing this, you\'re calling `stopPropagation` on a ' + 'released/nullified synthetic event. This is a no-op. See ' + 'https://fb.me/react-event-pooling for more information.') : undefined;
        }
        if (!event) {
          return ;
        }
        if (event.stopPropagation) {
          event.stopPropagation();
        } else {
          event.cancelBubble = true;
        }
        this.isPropagationStopped = emptyFunction.thatReturnsTrue;
      },
      persist: function() {
        this.isPersistent = emptyFunction.thatReturnsTrue;
      },
      isPersistent: emptyFunction.thatReturnsFalse,
      destructor: function() {
        var Interface = this.constructor.Interface;
        for (var propName in Interface) {
          this[propName] = null;
        }
        this.dispatchConfig = null;
        this.dispatchMarker = null;
        this.nativeEvent = null;
      }
    });
    SyntheticEvent.Interface = EventInterface;
    SyntheticEvent.augmentClass = function(Class, Interface) {
      var Super = this;
      var prototype = Object.create(Super.prototype);
      assign(prototype, Class.prototype);
      Class.prototype = prototype;
      Class.prototype.constructor = Class;
      Class.Interface = assign({}, Super.Interface, Interface);
      Class.augmentClass = Super.augmentClass;
      PooledClass.addPoolingTo(Class, PooledClass.fourArgumentPooler);
    };
    PooledClass.addPoolingTo(SyntheticEvent, PooledClass.fourArgumentPooler);
    module.exports = SyntheticEvent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticInputEvent", ["npm:react@0.14.0/lib/SyntheticEvent"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
  var InputEventInterface = {data: null};
  function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticEvent.augmentClass(SyntheticInputEvent, InputEventInterface);
  module.exports = SyntheticInputEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/keyOf", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var keyOf = function(oneKeyObj) {
    var key;
    for (key in oneKeyObj) {
      if (!oneKeyObj.hasOwnProperty(key)) {
        continue;
      }
      return key;
    }
    return null;
  };
  module.exports = keyOf;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getEventTarget", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function getEventTarget(nativeEvent) {
    var target = nativeEvent.target || nativeEvent.srcElement || window;
    return target.nodeType === 3 ? target.parentNode : target;
  }
  module.exports = getEventTarget;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/isTextInputElement", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var supportedInputTypes = {
    'color': true,
    'date': true,
    'datetime': true,
    'datetime-local': true,
    'email': true,
    'month': true,
    'number': true,
    'password': true,
    'range': true,
    'search': true,
    'tel': true,
    'text': true,
    'time': true,
    'url': true,
    'week': true
  };
  function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName && (nodeName === 'input' && supportedInputTypes[elem.type] || nodeName === 'textarea');
  }
  module.exports = isTextInputElement;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ClientReactRootIndex", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var nextReactRootIndex = 0;
  var ClientReactRootIndex = {createReactRootIndex: function() {
      return nextReactRootIndex++;
    }};
  module.exports = ClientReactRootIndex;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/DefaultEventPluginOrder", ["npm:fbjs@0.3.1/lib/keyOf"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
  var DefaultEventPluginOrder = [keyOf({ResponderEventPlugin: null}), keyOf({SimpleEventPlugin: null}), keyOf({TapEventPlugin: null}), keyOf({EnterLeaveEventPlugin: null}), keyOf({ChangeEventPlugin: null}), keyOf({SelectEventPlugin: null}), keyOf({BeforeInputEventPlugin: null})];
  module.exports = DefaultEventPluginOrder;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticUIEvent", ["npm:react@0.14.0/lib/SyntheticEvent", "npm:react@0.14.0/lib/getEventTarget"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
  var getEventTarget = require("npm:react@0.14.0/lib/getEventTarget");
  var UIEventInterface = {
    view: function(event) {
      if (event.view) {
        return event.view;
      }
      var target = getEventTarget(event);
      if (target != null && target.window === target) {
        return target;
      }
      var doc = target.ownerDocument;
      if (doc) {
        return doc.defaultView || doc.parentWindow;
      } else {
        return window;
      }
    },
    detail: function(event) {
      return event.detail || 0;
    }
  };
  function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);
  module.exports = SyntheticUIEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getEventModifierState", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var modifierKeyToProp = {
    'Alt': 'altKey',
    'Control': 'ctrlKey',
    'Meta': 'metaKey',
    'Shift': 'shiftKey'
  };
  function modifierStateGetter(keyArg) {
    var syntheticEvent = this;
    var nativeEvent = syntheticEvent.nativeEvent;
    if (nativeEvent.getModifierState) {
      return nativeEvent.getModifierState(keyArg);
    }
    var keyProp = modifierKeyToProp[keyArg];
    return keyProp ? !!nativeEvent[keyProp] : false;
  }
  function getEventModifierState(nativeEvent) {
    return modifierStateGetter;
  }
  module.exports = getEventModifierState;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/HTMLDOMPropertyConfig", ["npm:react@0.14.0/lib/DOMProperty", "npm:fbjs@0.3.1/lib/ExecutionEnvironment"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
  var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
  var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
  var HAS_SIDE_EFFECTS = DOMProperty.injection.HAS_SIDE_EFFECTS;
  var HAS_NUMERIC_VALUE = DOMProperty.injection.HAS_NUMERIC_VALUE;
  var HAS_POSITIVE_NUMERIC_VALUE = DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;
  var HAS_OVERLOADED_BOOLEAN_VALUE = DOMProperty.injection.HAS_OVERLOADED_BOOLEAN_VALUE;
  var hasSVG;
  if (ExecutionEnvironment.canUseDOM) {
    var implementation = document.implementation;
    hasSVG = implementation && implementation.hasFeature && implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
  }
  var HTMLDOMPropertyConfig = {
    isCustomAttribute: RegExp.prototype.test.bind(/^(data|aria)-[a-z_][a-z\d_.\-]*$/),
    Properties: {
      accept: null,
      acceptCharset: null,
      accessKey: null,
      action: null,
      allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
      allowTransparency: MUST_USE_ATTRIBUTE,
      alt: null,
      async: HAS_BOOLEAN_VALUE,
      autoComplete: null,
      autoPlay: HAS_BOOLEAN_VALUE,
      capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
      cellPadding: null,
      cellSpacing: null,
      charSet: MUST_USE_ATTRIBUTE,
      challenge: MUST_USE_ATTRIBUTE,
      checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      classID: MUST_USE_ATTRIBUTE,
      className: hasSVG ? MUST_USE_ATTRIBUTE : MUST_USE_PROPERTY,
      cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
      colSpan: null,
      content: null,
      contentEditable: null,
      contextMenu: MUST_USE_ATTRIBUTE,
      controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      coords: null,
      crossOrigin: null,
      data: null,
      dateTime: MUST_USE_ATTRIBUTE,
      defer: HAS_BOOLEAN_VALUE,
      dir: null,
      disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
      download: HAS_OVERLOADED_BOOLEAN_VALUE,
      draggable: null,
      encType: null,
      form: MUST_USE_ATTRIBUTE,
      formAction: MUST_USE_ATTRIBUTE,
      formEncType: MUST_USE_ATTRIBUTE,
      formMethod: MUST_USE_ATTRIBUTE,
      formNoValidate: HAS_BOOLEAN_VALUE,
      formTarget: MUST_USE_ATTRIBUTE,
      frameBorder: MUST_USE_ATTRIBUTE,
      headers: null,
      height: MUST_USE_ATTRIBUTE,
      hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
      high: null,
      href: null,
      hrefLang: null,
      htmlFor: null,
      httpEquiv: null,
      icon: null,
      id: MUST_USE_PROPERTY,
      inputMode: MUST_USE_ATTRIBUTE,
      is: MUST_USE_ATTRIBUTE,
      keyParams: MUST_USE_ATTRIBUTE,
      keyType: MUST_USE_ATTRIBUTE,
      label: null,
      lang: null,
      list: MUST_USE_ATTRIBUTE,
      loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      low: null,
      manifest: MUST_USE_ATTRIBUTE,
      marginHeight: null,
      marginWidth: null,
      max: null,
      maxLength: MUST_USE_ATTRIBUTE,
      media: MUST_USE_ATTRIBUTE,
      mediaGroup: null,
      method: null,
      min: null,
      minLength: MUST_USE_ATTRIBUTE,
      multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      name: null,
      noValidate: HAS_BOOLEAN_VALUE,
      open: HAS_BOOLEAN_VALUE,
      optimum: null,
      pattern: null,
      placeholder: null,
      poster: null,
      preload: null,
      radioGroup: null,
      readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      rel: null,
      required: HAS_BOOLEAN_VALUE,
      role: MUST_USE_ATTRIBUTE,
      rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
      rowSpan: null,
      sandbox: null,
      scope: null,
      scoped: HAS_BOOLEAN_VALUE,
      scrolling: null,
      seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
      selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      shape: null,
      size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
      sizes: MUST_USE_ATTRIBUTE,
      span: HAS_POSITIVE_NUMERIC_VALUE,
      spellCheck: null,
      src: null,
      srcDoc: MUST_USE_PROPERTY,
      srcSet: MUST_USE_ATTRIBUTE,
      start: HAS_NUMERIC_VALUE,
      step: null,
      style: null,
      summary: null,
      tabIndex: null,
      target: null,
      title: null,
      type: null,
      useMap: null,
      value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
      width: MUST_USE_ATTRIBUTE,
      wmode: MUST_USE_ATTRIBUTE,
      wrap: null,
      about: MUST_USE_ATTRIBUTE,
      datatype: MUST_USE_ATTRIBUTE,
      inlist: MUST_USE_ATTRIBUTE,
      prefix: MUST_USE_ATTRIBUTE,
      property: MUST_USE_ATTRIBUTE,
      resource: MUST_USE_ATTRIBUTE,
      'typeof': MUST_USE_ATTRIBUTE,
      vocab: MUST_USE_ATTRIBUTE,
      autoCapitalize: null,
      autoCorrect: null,
      autoSave: null,
      itemProp: MUST_USE_ATTRIBUTE,
      itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
      itemType: MUST_USE_ATTRIBUTE,
      itemID: MUST_USE_ATTRIBUTE,
      itemRef: MUST_USE_ATTRIBUTE,
      results: null,
      security: MUST_USE_ATTRIBUTE,
      unselectable: MUST_USE_ATTRIBUTE
    },
    DOMAttributeNames: {
      acceptCharset: 'accept-charset',
      className: 'class',
      htmlFor: 'for',
      httpEquiv: 'http-equiv'
    },
    DOMPropertyNames: {
      autoCapitalize: 'autocapitalize',
      autoComplete: 'autocomplete',
      autoCorrect: 'autocorrect',
      autoFocus: 'autofocus',
      autoPlay: 'autoplay',
      autoSave: 'autosave',
      encType: 'encoding',
      hrefLang: 'hreflang',
      radioGroup: 'radiogroup',
      spellCheck: 'spellcheck',
      srcDoc: 'srcdoc',
      srcSet: 'srcset'
    }
  };
  module.exports = HTMLDOMPropertyConfig;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/findDOMNode", ["npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactInstanceMap", "npm:react@0.14.0/lib/ReactMount", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactInstanceMap = require("npm:react@0.14.0/lib/ReactInstanceMap");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function findDOMNode(componentOrElement) {
      if (process.env.NODE_ENV !== 'production') {
        var owner = ReactCurrentOwner.current;
        if (owner !== null) {
          process.env.NODE_ENV !== 'production' ? warning(owner._warnedAboutRefsInRender, '%s is accessing getDOMNode or findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component') : undefined;
          owner._warnedAboutRefsInRender = true;
        }
      }
      if (componentOrElement == null) {
        return null;
      }
      if (componentOrElement.nodeType === 1) {
        return componentOrElement;
      }
      if (ReactInstanceMap.has(componentOrElement)) {
        return ReactMount.getNodeFromInstance(componentOrElement);
      }
      !(componentOrElement.render == null || typeof componentOrElement.render !== 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findDOMNode was called on an unmounted component.') : invariant(false) : undefined;
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Element appears to be neither ReactComponent nor DOMNode (keys: %s)', Object.keys(componentOrElement)) : invariant(false) : undefined;
    }
    module.exports = findDOMNode;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDefaultBatchingStrategy", ["npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Transaction", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyFunction"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
  var Transaction = require("npm:react@0.14.0/lib/Transaction");
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
  var RESET_BATCHED_UPDATES = {
    initialize: emptyFunction,
    close: function() {
      ReactDefaultBatchingStrategy.isBatchingUpdates = false;
    }
  };
  var FLUSH_BATCHED_UPDATES = {
    initialize: emptyFunction,
    close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
  };
  var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];
  function ReactDefaultBatchingStrategyTransaction() {
    this.reinitializeTransaction();
  }
  assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction.Mixin, {getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS;
    }});
  var transaction = new ReactDefaultBatchingStrategyTransaction();
  var ReactDefaultBatchingStrategy = {
    isBatchingUpdates: false,
    batchedUpdates: function(callback, a, b, c, d, e) {
      var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
      ReactDefaultBatchingStrategy.isBatchingUpdates = true;
      if (alreadyBatchingUpdates) {
        callback(a, b, c, d, e);
      } else {
        transaction.perform(callback, null, a, b, c, d, e);
      }
    }
  };
  module.exports = ReactDefaultBatchingStrategy;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/focusNode", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function focusNode(node) {
    try {
      node.focus();
    } catch (e) {}
  }
  module.exports = focusNode;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/CSSProperty", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var isUnitlessNumber = {
    animationIterationCount: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    fillOpacity: true,
    stopOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
  };
  function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
  }
  var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
  Object.keys(isUnitlessNumber).forEach(function(prop) {
    prefixes.forEach(function(prefix) {
      isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
    });
  });
  var shorthandPropertyExpansions = {
    background: {
      backgroundAttachment: true,
      backgroundColor: true,
      backgroundImage: true,
      backgroundPositionX: true,
      backgroundPositionY: true,
      backgroundRepeat: true
    },
    backgroundPosition: {
      backgroundPositionX: true,
      backgroundPositionY: true
    },
    border: {
      borderWidth: true,
      borderStyle: true,
      borderColor: true
    },
    borderBottom: {
      borderBottomWidth: true,
      borderBottomStyle: true,
      borderBottomColor: true
    },
    borderLeft: {
      borderLeftWidth: true,
      borderLeftStyle: true,
      borderLeftColor: true
    },
    borderRight: {
      borderRightWidth: true,
      borderRightStyle: true,
      borderRightColor: true
    },
    borderTop: {
      borderTopWidth: true,
      borderTopStyle: true,
      borderTopColor: true
    },
    font: {
      fontStyle: true,
      fontVariant: true,
      fontWeight: true,
      fontSize: true,
      lineHeight: true,
      fontFamily: true
    },
    outline: {
      outlineWidth: true,
      outlineStyle: true,
      outlineColor: true
    }
  };
  var CSSProperty = {
    isUnitlessNumber: isUnitlessNumber,
    shorthandPropertyExpansions: shorthandPropertyExpansions
  };
  module.exports = CSSProperty;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/camelize", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _hyphenPattern = /-(.)/g;
  function camelize(string) {
    return string.replace(_hyphenPattern, function(_, character) {
      return character.toUpperCase();
    });
  }
  module.exports = camelize;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/dangerousStyleValue", ["npm:react@0.14.0/lib/CSSProperty"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var CSSProperty = require("npm:react@0.14.0/lib/CSSProperty");
  var isUnitlessNumber = CSSProperty.isUnitlessNumber;
  function dangerousStyleValue(name, value) {
    var isEmpty = value == null || typeof value === 'boolean' || value === '';
    if (isEmpty) {
      return '';
    }
    var isNonNumeric = isNaN(value);
    if (isNonNumeric || value === 0 || isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
      return '' + value;
    }
    if (typeof value === 'string') {
      value = value.trim();
    }
    return value + 'px';
  }
  module.exports = dangerousStyleValue;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/hyphenate", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var _uppercasePattern = /([A-Z])/g;
  function hyphenate(string) {
    return string.replace(_uppercasePattern, '-$1').toLowerCase();
  }
  module.exports = hyphenate;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/memoizeStringOnly", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function memoizeStringOnly(callback) {
    var cache = {};
    return function(string) {
      if (!cache.hasOwnProperty(string)) {
        cache[string] = callback.call(this, string);
      }
      return cache[string];
    };
  }
  module.exports = memoizeStringOnly;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMButton", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var mouseListenerNames = {
    onClick: true,
    onDoubleClick: true,
    onMouseDown: true,
    onMouseMove: true,
    onMouseUp: true,
    onClickCapture: true,
    onDoubleClickCapture: true,
    onMouseDownCapture: true,
    onMouseMoveCapture: true,
    onMouseUpCapture: true
  };
  var ReactDOMButton = {getNativeProps: function(inst, props, context) {
      if (!props.disabled) {
        return props;
      }
      var nativeProps = {};
      for (var key in props) {
        if (props.hasOwnProperty(key) && !mouseListenerNames[key]) {
          nativeProps[key] = props[key];
        }
      }
      return nativeProps;
    }};
  module.exports = ReactDOMButton;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getIteratorFn", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }
  module.exports = getIteratorFn;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/traverseAllChildren", ["npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactInstanceHandles", "npm:react@0.14.0/lib/getIteratorFn", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactInstanceHandles = require("npm:react@0.14.0/lib/ReactInstanceHandles");
    var getIteratorFn = require("npm:react@0.14.0/lib/getIteratorFn");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var SEPARATOR = ReactInstanceHandles.SEPARATOR;
    var SUBSEPARATOR = ':';
    var userProvidedKeyEscaperLookup = {
      '=': '=0',
      '.': '=1',
      ':': '=2'
    };
    var userProvidedKeyEscapeRegex = /[=.:]/g;
    var didWarnAboutMaps = false;
    function userProvidedKeyEscaper(match) {
      return userProvidedKeyEscaperLookup[match];
    }
    function getComponentKey(component, index) {
      if (component && component.key != null) {
        return wrapUserProvidedKey(component.key);
      }
      return index.toString(36);
    }
    function escapeUserProvidedKey(text) {
      return ('' + text).replace(userProvidedKeyEscapeRegex, userProvidedKeyEscaper);
    }
    function wrapUserProvidedKey(key) {
      return '$' + escapeUserProvidedKey(key);
    }
    function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
      var type = typeof children;
      if (type === 'undefined' || type === 'boolean') {
        children = null;
      }
      if (children === null || type === 'string' || type === 'number' || ReactElement.isValidElement(children)) {
        callback(traverseContext, children, nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
        return 1;
      }
      var child;
      var nextName;
      var subtreeCount = 0;
      var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
      if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          nextName = nextNamePrefix + getComponentKey(child, i);
          subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
        }
      } else {
        var iteratorFn = getIteratorFn(children);
        if (iteratorFn) {
          var iterator = iteratorFn.call(children);
          var step;
          if (iteratorFn !== children.entries) {
            var ii = 0;
            while (!(step = iterator.next()).done) {
              child = step.value;
              nextName = nextNamePrefix + getComponentKey(child, ii++);
              subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
            }
          } else {
            if (process.env.NODE_ENV !== 'production') {
              process.env.NODE_ENV !== 'production' ? warning(didWarnAboutMaps, 'Using Maps as children is not yet fully supported. It is an ' + 'experimental feature that might be removed. Convert it to a ' + 'sequence / iterable of keyed ReactElements instead.') : undefined;
              didWarnAboutMaps = true;
            }
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                child = entry[1];
                nextName = nextNamePrefix + wrapUserProvidedKey(entry[0]) + SUBSEPARATOR + getComponentKey(child, 0);
                subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
              }
            }
          }
        } else if (type === 'object') {
          var addendum = '';
          if (process.env.NODE_ENV !== 'production') {
            addendum = ' If you meant to render a collection of children, use an array ' + 'instead or wrap the object using createFragment(object) from the ' + 'React add-ons.';
            if (children._isReactElement) {
              addendum = ' It looks like you\'re using an element created by a different ' + 'version of React. Make sure to use only one copy of React.';
            }
            if (ReactCurrentOwner.current) {
              var name = ReactCurrentOwner.current.getName();
              if (name) {
                addendum += ' Check the render method of `' + name + '`.';
              }
            }
          }
          var childrenString = String(children);
          !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum) : invariant(false) : undefined;
        }
      }
      return subtreeCount;
    }
    function traverseAllChildren(children, callback, traverseContext) {
      if (children == null) {
        return 0;
      }
      return traverseAllChildrenImpl(children, '', callback, traverseContext);
    }
    module.exports = traverseAllChildren;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMSelect", ["npm:react@0.14.0/lib/LinkedValueUtils", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var LinkedValueUtils = require("npm:react@0.14.0/lib/LinkedValueUtils");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var valueContextKey = '__ReactDOMSelect_value$' + Math.random().toString(36).slice(2);
    function updateOptionsIfPendingUpdateAndMounted() {
      if (this._rootNodeID && this._wrapperState.pendingUpdate) {
        this._wrapperState.pendingUpdate = false;
        var props = this._currentElement.props;
        var value = LinkedValueUtils.getValue(props);
        if (value != null) {
          updateOptions(this, props, value);
        }
      }
    }
    function getDeclarationErrorAddendum(owner) {
      if (owner) {
        var name = owner.getName();
        if (name) {
          return ' Check the render method of `' + name + '`.';
        }
      }
      return '';
    }
    var valuePropNames = ['value', 'defaultValue'];
    function checkSelectPropTypes(inst, props) {
      var owner = inst._currentElement._owner;
      LinkedValueUtils.checkPropTypes('select', props, owner);
      for (var i = 0; i < valuePropNames.length; i++) {
        var propName = valuePropNames[i];
        if (props[propName] == null) {
          continue;
        }
        if (props.multiple) {
          process.env.NODE_ENV !== 'production' ? warning(Array.isArray(props[propName]), 'The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum(owner)) : undefined;
        } else {
          process.env.NODE_ENV !== 'production' ? warning(!Array.isArray(props[propName]), 'The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum(owner)) : undefined;
        }
      }
    }
    function updateOptions(inst, multiple, propValue) {
      var selectedValue,
          i;
      var options = ReactMount.getNode(inst._rootNodeID).options;
      if (multiple) {
        selectedValue = {};
        for (i = 0; i < propValue.length; i++) {
          selectedValue['' + propValue[i]] = true;
        }
        for (i = 0; i < options.length; i++) {
          var selected = selectedValue.hasOwnProperty(options[i].value);
          if (options[i].selected !== selected) {
            options[i].selected = selected;
          }
        }
      } else {
        selectedValue = '' + propValue;
        for (i = 0; i < options.length; i++) {
          if (options[i].value === selectedValue) {
            options[i].selected = true;
            return ;
          }
        }
        if (options.length) {
          options[0].selected = true;
        }
      }
    }
    var ReactDOMSelect = {
      valueContextKey: valueContextKey,
      getNativeProps: function(inst, props, context) {
        return assign({}, props, {
          onChange: inst._wrapperState.onChange,
          value: undefined
        });
      },
      mountWrapper: function(inst, props) {
        if (process.env.NODE_ENV !== 'production') {
          checkSelectPropTypes(inst, props);
        }
        var value = LinkedValueUtils.getValue(props);
        inst._wrapperState = {
          pendingUpdate: false,
          initialValue: value != null ? value : props.defaultValue,
          onChange: _handleChange.bind(inst),
          wasMultiple: Boolean(props.multiple)
        };
      },
      processChildContext: function(inst, props, context) {
        var childContext = assign({}, context);
        childContext[valueContextKey] = inst._wrapperState.initialValue;
        return childContext;
      },
      postUpdateWrapper: function(inst) {
        var props = inst._currentElement.props;
        inst._wrapperState.initialValue = undefined;
        var wasMultiple = inst._wrapperState.wasMultiple;
        inst._wrapperState.wasMultiple = Boolean(props.multiple);
        var value = LinkedValueUtils.getValue(props);
        if (value != null) {
          inst._wrapperState.pendingUpdate = false;
          updateOptions(inst, Boolean(props.multiple), value);
        } else if (wasMultiple !== Boolean(props.multiple)) {
          if (props.defaultValue != null) {
            updateOptions(inst, Boolean(props.multiple), props.defaultValue);
          } else {
            updateOptions(inst, Boolean(props.multiple), props.multiple ? [] : '');
          }
        }
      }
    };
    function _handleChange(event) {
      var props = this._currentElement.props;
      var returnValue = LinkedValueUtils.executeOnChange(props, event);
      this._wrapperState.pendingUpdate = true;
      ReactUpdates.asap(updateOptionsIfPendingUpdateAndMounted, this);
      return returnValue;
    }
    module.exports = ReactDOMSelect;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMTextarea", ["npm:react@0.14.0/lib/LinkedValueUtils", "npm:react@0.14.0/lib/ReactDOMIDOperations", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var LinkedValueUtils = require("npm:react@0.14.0/lib/LinkedValueUtils");
    var ReactDOMIDOperations = require("npm:react@0.14.0/lib/ReactDOMIDOperations");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function forceUpdateIfMounted() {
      if (this._rootNodeID) {
        ReactDOMTextarea.updateWrapper(this);
      }
    }
    var ReactDOMTextarea = {
      getNativeProps: function(inst, props, context) {
        !(props.dangerouslySetInnerHTML == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, '`dangerouslySetInnerHTML` does not make sense on <textarea>.') : invariant(false) : undefined;
        var nativeProps = assign({}, props, {
          defaultValue: undefined,
          value: undefined,
          children: inst._wrapperState.initialValue,
          onChange: inst._wrapperState.onChange
        });
        return nativeProps;
      },
      mountWrapper: function(inst, props) {
        if (process.env.NODE_ENV !== 'production') {
          LinkedValueUtils.checkPropTypes('textarea', props, inst._currentElement._owner);
        }
        var defaultValue = props.defaultValue;
        var children = props.children;
        if (children != null) {
          if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_ENV !== 'production' ? warning(false, 'Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.') : undefined;
          }
          !(defaultValue == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'If you supply `defaultValue` on a <textarea>, do not pass children.') : invariant(false) : undefined;
          if (Array.isArray(children)) {
            !(children.length <= 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, '<textarea> can only have at most one child.') : invariant(false) : undefined;
            children = children[0];
          }
          defaultValue = '' + children;
        }
        if (defaultValue == null) {
          defaultValue = '';
        }
        var value = LinkedValueUtils.getValue(props);
        inst._wrapperState = {
          initialValue: '' + (value != null ? value : defaultValue),
          onChange: _handleChange.bind(inst)
        };
      },
      updateWrapper: function(inst) {
        var props = inst._currentElement.props;
        var value = LinkedValueUtils.getValue(props);
        if (value != null) {
          ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'value', '' + value);
        }
      }
    };
    function _handleChange(event) {
      var props = this._currentElement.props;
      var returnValue = LinkedValueUtils.executeOnChange(props, event);
      ReactUpdates.asap(forceUpdateIfMounted, this);
      return returnValue;
    }
    module.exports = ReactDOMTextarea;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactChildReconciler", ["npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/instantiateReactComponent", "npm:react@0.14.0/lib/shouldUpdateReactComponent", "npm:react@0.14.0/lib/traverseAllChildren", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
    var instantiateReactComponent = require("npm:react@0.14.0/lib/instantiateReactComponent");
    var shouldUpdateReactComponent = require("npm:react@0.14.0/lib/shouldUpdateReactComponent");
    var traverseAllChildren = require("npm:react@0.14.0/lib/traverseAllChildren");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function instantiateChild(childInstances, child, name) {
      var keyUnique = childInstances[name] === undefined;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(keyUnique, 'flattenChildren(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : undefined;
      }
      if (child != null && keyUnique) {
        childInstances[name] = instantiateReactComponent(child, null);
      }
    }
    var ReactChildReconciler = {
      instantiateChildren: function(nestedChildNodes, transaction, context) {
        if (nestedChildNodes == null) {
          return null;
        }
        var childInstances = {};
        traverseAllChildren(nestedChildNodes, instantiateChild, childInstances);
        return childInstances;
      },
      updateChildren: function(prevChildren, nextChildren, transaction, context) {
        if (!nextChildren && !prevChildren) {
          return null;
        }
        var name;
        for (name in nextChildren) {
          if (!nextChildren.hasOwnProperty(name)) {
            continue;
          }
          var prevChild = prevChildren && prevChildren[name];
          var prevElement = prevChild && prevChild._currentElement;
          var nextElement = nextChildren[name];
          if (prevChild != null && shouldUpdateReactComponent(prevElement, nextElement)) {
            ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
            nextChildren[name] = prevChild;
          } else {
            if (prevChild) {
              ReactReconciler.unmountComponent(prevChild, name);
            }
            var nextChildInstance = instantiateReactComponent(nextElement, null);
            nextChildren[name] = nextChildInstance;
          }
        }
        for (name in prevChildren) {
          if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
            ReactReconciler.unmountComponent(prevChildren[name]);
          }
        }
        return nextChildren;
      },
      unmountChildren: function(renderedChildren) {
        for (var name in renderedChildren) {
          if (renderedChildren.hasOwnProperty(name)) {
            var renderedChild = renderedChildren[name];
            ReactReconciler.unmountComponent(renderedChild);
          }
        }
      }
    };
    module.exports = ReactChildReconciler;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/flattenChildren", ["npm:react@0.14.0/lib/traverseAllChildren", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var traverseAllChildren = require("npm:react@0.14.0/lib/traverseAllChildren");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function flattenSingleChildIntoContext(traverseContext, child, name) {
      var result = traverseContext;
      var keyUnique = result[name] === undefined;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(keyUnique, 'flattenChildren(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : undefined;
      }
      if (keyUnique && child != null) {
        result[name] = child;
      }
    }
    function flattenChildren(children) {
      if (children == null) {
        return children;
      }
      var result = {};
      traverseAllChildren(children, flattenSingleChildIntoContext, result);
      return result;
    }
    module.exports = flattenChildren;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/shallowEqual", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function shallowEqual(objA, objB) {
    if (objA === objB) {
      return true;
    }
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }
    var bHasOwnProperty = hasOwnProperty.bind(objB);
    for (var i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        return false;
      }
    }
    return true;
  }
  module.exports = shallowEqual;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/EventListener", ["npm:fbjs@0.3.1/lib/emptyFunction", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
    var EventListener = {
      listen: function(target, eventType, callback) {
        if (target.addEventListener) {
          target.addEventListener(eventType, callback, false);
          return {remove: function() {
              target.removeEventListener(eventType, callback, false);
            }};
        } else if (target.attachEvent) {
          target.attachEvent('on' + eventType, callback);
          return {remove: function() {
              target.detachEvent('on' + eventType, callback);
            }};
        }
      },
      capture: function(target, eventType, callback) {
        if (target.addEventListener) {
          target.addEventListener(eventType, callback, true);
          return {remove: function() {
              target.removeEventListener(eventType, callback, true);
            }};
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Attempted to listen to events during the capture phase on a ' + 'browser that does not support the capture phase. Your application ' + 'will not receive some events.');
          }
          return {remove: emptyFunction};
        }
      },
      registerDefault: function() {}
    };
    module.exports = EventListener;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/getUnboundedScrollPosition", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function getUnboundedScrollPosition(scrollable) {
    if (scrollable === window) {
      return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      };
    }
    return {
      x: scrollable.scrollLeft,
      y: scrollable.scrollTop
    };
  }
  module.exports = getUnboundedScrollPosition;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactNoopUpdateQueue", ["npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function warnTDZ(publicInstance, callerName) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, publicInstance.constructor && publicInstance.constructor.displayName || '') : undefined;
      }
    }
    var ReactNoopUpdateQueue = {
      isMounted: function(publicInstance) {
        return false;
      },
      enqueueCallback: function(publicInstance, callback) {},
      enqueueForceUpdate: function(publicInstance) {
        warnTDZ(publicInstance, 'forceUpdate');
      },
      enqueueReplaceState: function(publicInstance, completeState) {
        warnTDZ(publicInstance, 'replaceState');
      },
      enqueueSetState: function(publicInstance, partialState) {
        warnTDZ(publicInstance, 'setState');
      },
      enqueueSetProps: function(publicInstance, partialProps) {
        warnTDZ(publicInstance, 'setProps');
      },
      enqueueReplaceProps: function(publicInstance, props) {
        warnTDZ(publicInstance, 'replaceProps');
      }
    };
    module.exports = ReactNoopUpdateQueue;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getNodeForCharacterOffset", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function getLeafNode(node) {
    while (node && node.firstChild) {
      node = node.firstChild;
    }
    return node;
  }
  function getSiblingNode(node) {
    while (node) {
      if (node.nextSibling) {
        return node.nextSibling;
      }
      node = node.parentNode;
    }
  }
  function getNodeForCharacterOffset(root, offset) {
    var node = getLeafNode(root);
    var nodeStart = 0;
    var nodeEnd = 0;
    while (node) {
      if (node.nodeType === 3) {
        nodeEnd = nodeStart + node.textContent.length;
        if (nodeStart <= offset && nodeEnd >= offset) {
          return {
            node: node,
            offset: offset - nodeStart
          };
        }
        nodeStart = nodeEnd;
      }
      node = getLeafNode(getSiblingNode(node));
    }
  }
  module.exports = getNodeForCharacterOffset;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/getActiveElement", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function getActiveElement() {
    if (typeof document === 'undefined') {
      return null;
    }
    try {
      return document.activeElement || document.body;
    } catch (e) {
      return document.body;
    }
  }
  module.exports = getActiveElement;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SelectEventPlugin", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/EventPropagators", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/ReactInputSelection", "npm:react@0.14.0/lib/SyntheticEvent", "npm:fbjs@0.3.1/lib/getActiveElement", "npm:react@0.14.0/lib/isTextInputElement", "npm:fbjs@0.3.1/lib/keyOf", "npm:fbjs@0.3.1/lib/shallowEqual"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
  var EventPropagators = require("npm:react@0.14.0/lib/EventPropagators");
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var ReactInputSelection = require("npm:react@0.14.0/lib/ReactInputSelection");
  var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
  var getActiveElement = require("npm:fbjs@0.3.1/lib/getActiveElement");
  var isTextInputElement = require("npm:react@0.14.0/lib/isTextInputElement");
  var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
  var shallowEqual = require("npm:fbjs@0.3.1/lib/shallowEqual");
  var topLevelTypes = EventConstants.topLevelTypes;
  var skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && 'documentMode' in document && document.documentMode <= 11;
  var eventTypes = {select: {
      phasedRegistrationNames: {
        bubbled: keyOf({onSelect: null}),
        captured: keyOf({onSelectCapture: null})
      },
      dependencies: [topLevelTypes.topBlur, topLevelTypes.topContextMenu, topLevelTypes.topFocus, topLevelTypes.topKeyDown, topLevelTypes.topMouseDown, topLevelTypes.topMouseUp, topLevelTypes.topSelectionChange]
    }};
  var activeElement = null;
  var activeElementID = null;
  var lastSelection = null;
  var mouseDown = false;
  var hasListener = false;
  var ON_SELECT_KEY = keyOf({onSelect: null});
  function getSelection(node) {
    if ('selectionStart' in node && ReactInputSelection.hasSelectionCapabilities(node)) {
      return {
        start: node.selectionStart,
        end: node.selectionEnd
      };
    } else if (window.getSelection) {
      var selection = window.getSelection();
      return {
        anchorNode: selection.anchorNode,
        anchorOffset: selection.anchorOffset,
        focusNode: selection.focusNode,
        focusOffset: selection.focusOffset
      };
    } else if (document.selection) {
      var range = document.selection.createRange();
      return {
        parentElement: range.parentElement(),
        text: range.text,
        top: range.boundingTop,
        left: range.boundingLeft
      };
    }
  }
  function constructSelectEvent(nativeEvent, nativeEventTarget) {
    if (mouseDown || activeElement == null || activeElement !== getActiveElement()) {
      return null;
    }
    var currentSelection = getSelection(activeElement);
    if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
      lastSelection = currentSelection;
      var syntheticEvent = SyntheticEvent.getPooled(eventTypes.select, activeElementID, nativeEvent, nativeEventTarget);
      syntheticEvent.type = 'select';
      syntheticEvent.target = activeElement;
      EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);
      return syntheticEvent;
    }
    return null;
  }
  var SelectEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      if (!hasListener) {
        return null;
      }
      switch (topLevelType) {
        case topLevelTypes.topFocus:
          if (isTextInputElement(topLevelTarget) || topLevelTarget.contentEditable === 'true') {
            activeElement = topLevelTarget;
            activeElementID = topLevelTargetID;
            lastSelection = null;
          }
          break;
        case topLevelTypes.topBlur:
          activeElement = null;
          activeElementID = null;
          lastSelection = null;
          break;
        case topLevelTypes.topMouseDown:
          mouseDown = true;
          break;
        case topLevelTypes.topContextMenu:
        case topLevelTypes.topMouseUp:
          mouseDown = false;
          return constructSelectEvent(nativeEvent, nativeEventTarget);
        case topLevelTypes.topSelectionChange:
          if (skipSelectionChangeEvent) {
            break;
          }
        case topLevelTypes.topKeyDown:
        case topLevelTypes.topKeyUp:
          return constructSelectEvent(nativeEvent, nativeEventTarget);
      }
      return null;
    },
    didPutListener: function(id, registrationName, listener) {
      if (registrationName === ON_SELECT_KEY) {
        hasListener = true;
      }
    }
  };
  module.exports = SelectEventPlugin;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ServerReactRootIndex", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var GLOBAL_MOUNT_POINT_MAX = Math.pow(2, 53);
  var ServerReactRootIndex = {createReactRootIndex: function() {
      return Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX);
    }};
  module.exports = ServerReactRootIndex;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticClipboardEvent", ["npm:react@0.14.0/lib/SyntheticEvent"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
  var ClipboardEventInterface = {clipboardData: function(event) {
      return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
    }};
  function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);
  module.exports = SyntheticClipboardEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticFocusEvent", ["npm:react@0.14.0/lib/SyntheticUIEvent"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticUIEvent = require("npm:react@0.14.0/lib/SyntheticUIEvent");
  var FocusEventInterface = {relatedTarget: null};
  function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);
  module.exports = SyntheticFocusEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getEventCharCode", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  function getEventCharCode(nativeEvent) {
    var charCode;
    var keyCode = nativeEvent.keyCode;
    if ('charCode' in nativeEvent) {
      charCode = nativeEvent.charCode;
      if (charCode === 0 && keyCode === 13) {
        charCode = 13;
      }
    } else {
      charCode = keyCode;
    }
    if (charCode >= 32 || charCode === 13) {
      return charCode;
    }
    return 0;
  }
  module.exports = getEventCharCode;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/getEventKey", ["npm:react@0.14.0/lib/getEventCharCode"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var getEventCharCode = require("npm:react@0.14.0/lib/getEventCharCode");
  var normalizeKey = {
    'Esc': 'Escape',
    'Spacebar': ' ',
    'Left': 'ArrowLeft',
    'Up': 'ArrowUp',
    'Right': 'ArrowRight',
    'Down': 'ArrowDown',
    'Del': 'Delete',
    'Win': 'OS',
    'Menu': 'ContextMenu',
    'Apps': 'ContextMenu',
    'Scroll': 'ScrollLock',
    'MozPrintableKey': 'Unidentified'
  };
  var translateToKey = {
    8: 'Backspace',
    9: 'Tab',
    12: 'Clear',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    19: 'Pause',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    45: 'Insert',
    46: 'Delete',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    144: 'NumLock',
    145: 'ScrollLock',
    224: 'Meta'
  };
  function getEventKey(nativeEvent) {
    if (nativeEvent.key) {
      var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
      if (key !== 'Unidentified') {
        return key;
      }
    }
    if (nativeEvent.type === 'keypress') {
      var charCode = getEventCharCode(nativeEvent);
      return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
    }
    if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
      return translateToKey[nativeEvent.keyCode] || 'Unidentified';
    }
    return '';
  }
  module.exports = getEventKey;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticDragEvent", ["npm:react@0.14.0/lib/SyntheticMouseEvent"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticMouseEvent = require("npm:react@0.14.0/lib/SyntheticMouseEvent");
  var DragEventInterface = {dataTransfer: null};
  function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);
  module.exports = SyntheticDragEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticTouchEvent", ["npm:react@0.14.0/lib/SyntheticUIEvent", "npm:react@0.14.0/lib/getEventModifierState"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticUIEvent = require("npm:react@0.14.0/lib/SyntheticUIEvent");
  var getEventModifierState = require("npm:react@0.14.0/lib/getEventModifierState");
  var TouchEventInterface = {
    touches: null,
    targetTouches: null,
    changedTouches: null,
    altKey: null,
    metaKey: null,
    ctrlKey: null,
    shiftKey: null,
    getModifierState: getEventModifierState
  };
  function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);
  module.exports = SyntheticTouchEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticWheelEvent", ["npm:react@0.14.0/lib/SyntheticMouseEvent"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticMouseEvent = require("npm:react@0.14.0/lib/SyntheticMouseEvent");
  var WheelEventInterface = {
    deltaX: function(event) {
      return 'deltaX' in event ? event.deltaX : 'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
      return 'deltaY' in event ? event.deltaY : 'wheelDeltaY' in event ? -event.wheelDeltaY : 'wheelDelta' in event ? -event.wheelDelta : 0;
    },
    deltaZ: null,
    deltaMode: null
  };
  function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);
  module.exports = SyntheticWheelEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SVGDOMPropertyConfig", ["npm:react@0.14.0/lib/DOMProperty"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
  var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
  var NS = {
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace'
  };
  var SVGDOMPropertyConfig = {
    Properties: {
      clipPath: MUST_USE_ATTRIBUTE,
      cx: MUST_USE_ATTRIBUTE,
      cy: MUST_USE_ATTRIBUTE,
      d: MUST_USE_ATTRIBUTE,
      dx: MUST_USE_ATTRIBUTE,
      dy: MUST_USE_ATTRIBUTE,
      fill: MUST_USE_ATTRIBUTE,
      fillOpacity: MUST_USE_ATTRIBUTE,
      fontFamily: MUST_USE_ATTRIBUTE,
      fontSize: MUST_USE_ATTRIBUTE,
      fx: MUST_USE_ATTRIBUTE,
      fy: MUST_USE_ATTRIBUTE,
      gradientTransform: MUST_USE_ATTRIBUTE,
      gradientUnits: MUST_USE_ATTRIBUTE,
      markerEnd: MUST_USE_ATTRIBUTE,
      markerMid: MUST_USE_ATTRIBUTE,
      markerStart: MUST_USE_ATTRIBUTE,
      offset: MUST_USE_ATTRIBUTE,
      opacity: MUST_USE_ATTRIBUTE,
      patternContentUnits: MUST_USE_ATTRIBUTE,
      patternUnits: MUST_USE_ATTRIBUTE,
      points: MUST_USE_ATTRIBUTE,
      preserveAspectRatio: MUST_USE_ATTRIBUTE,
      r: MUST_USE_ATTRIBUTE,
      rx: MUST_USE_ATTRIBUTE,
      ry: MUST_USE_ATTRIBUTE,
      spreadMethod: MUST_USE_ATTRIBUTE,
      stopColor: MUST_USE_ATTRIBUTE,
      stopOpacity: MUST_USE_ATTRIBUTE,
      stroke: MUST_USE_ATTRIBUTE,
      strokeDasharray: MUST_USE_ATTRIBUTE,
      strokeLinecap: MUST_USE_ATTRIBUTE,
      strokeOpacity: MUST_USE_ATTRIBUTE,
      strokeWidth: MUST_USE_ATTRIBUTE,
      textAnchor: MUST_USE_ATTRIBUTE,
      transform: MUST_USE_ATTRIBUTE,
      version: MUST_USE_ATTRIBUTE,
      viewBox: MUST_USE_ATTRIBUTE,
      x1: MUST_USE_ATTRIBUTE,
      x2: MUST_USE_ATTRIBUTE,
      x: MUST_USE_ATTRIBUTE,
      xlinkActuate: MUST_USE_ATTRIBUTE,
      xlinkArcrole: MUST_USE_ATTRIBUTE,
      xlinkHref: MUST_USE_ATTRIBUTE,
      xlinkRole: MUST_USE_ATTRIBUTE,
      xlinkShow: MUST_USE_ATTRIBUTE,
      xlinkTitle: MUST_USE_ATTRIBUTE,
      xlinkType: MUST_USE_ATTRIBUTE,
      xmlBase: MUST_USE_ATTRIBUTE,
      xmlLang: MUST_USE_ATTRIBUTE,
      xmlSpace: MUST_USE_ATTRIBUTE,
      y1: MUST_USE_ATTRIBUTE,
      y2: MUST_USE_ATTRIBUTE,
      y: MUST_USE_ATTRIBUTE
    },
    DOMAttributeNamespaces: {
      xlinkActuate: NS.xlink,
      xlinkArcrole: NS.xlink,
      xlinkHref: NS.xlink,
      xlinkRole: NS.xlink,
      xlinkShow: NS.xlink,
      xlinkTitle: NS.xlink,
      xlinkType: NS.xlink,
      xmlBase: NS.xml,
      xmlLang: NS.xml,
      xmlSpace: NS.xml
    },
    DOMAttributeNames: {
      clipPath: 'clip-path',
      fillOpacity: 'fill-opacity',
      fontFamily: 'font-family',
      fontSize: 'font-size',
      gradientTransform: 'gradientTransform',
      gradientUnits: 'gradientUnits',
      markerEnd: 'marker-end',
      markerMid: 'marker-mid',
      markerStart: 'marker-start',
      patternContentUnits: 'patternContentUnits',
      patternUnits: 'patternUnits',
      preserveAspectRatio: 'preserveAspectRatio',
      spreadMethod: 'spreadMethod',
      stopColor: 'stop-color',
      stopOpacity: 'stop-opacity',
      strokeDasharray: 'stroke-dasharray',
      strokeLinecap: 'stroke-linecap',
      strokeOpacity: 'stroke-opacity',
      strokeWidth: 'stroke-width',
      textAnchor: 'text-anchor',
      viewBox: 'viewBox',
      xlinkActuate: 'xlink:actuate',
      xlinkArcrole: 'xlink:arcrole',
      xlinkHref: 'xlink:href',
      xlinkRole: 'xlink:role',
      xlinkShow: 'xlink:show',
      xlinkTitle: 'xlink:title',
      xlinkType: 'xlink:type',
      xmlBase: 'xml:base',
      xmlLang: 'xml:lang',
      xmlSpace: 'xml:space'
    }
  };
  module.exports = SVGDOMPropertyConfig;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDefaultPerfAnalysis", ["npm:react@0.14.0/lib/Object.assign"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var DONT_CARE_THRESHOLD = 1.2;
  var DOM_OPERATION_TYPES = {
    '_mountImageIntoNode': 'set innerHTML',
    INSERT_MARKUP: 'set innerHTML',
    MOVE_EXISTING: 'move',
    REMOVE_NODE: 'remove',
    SET_MARKUP: 'set innerHTML',
    TEXT_CONTENT: 'set textContent',
    'setValueForProperty': 'update attribute',
    'setValueForAttribute': 'update attribute',
    'deleteValueForProperty': 'remove attribute',
    'dangerouslyReplaceNodeWithMarkupByID': 'replace'
  };
  function getTotalTime(measurements) {
    var totalTime = 0;
    for (var i = 0; i < measurements.length; i++) {
      var measurement = measurements[i];
      totalTime += measurement.totalTime;
    }
    return totalTime;
  }
  function getDOMSummary(measurements) {
    var items = [];
    measurements.forEach(function(measurement) {
      Object.keys(measurement.writes).forEach(function(id) {
        measurement.writes[id].forEach(function(write) {
          items.push({
            id: id,
            type: DOM_OPERATION_TYPES[write.type] || write.type,
            args: write.args
          });
        });
      });
    });
    return items;
  }
  function getExclusiveSummary(measurements) {
    var candidates = {};
    var displayName;
    for (var i = 0; i < measurements.length; i++) {
      var measurement = measurements[i];
      var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
      for (var id in allIDs) {
        displayName = measurement.displayNames[id].current;
        candidates[displayName] = candidates[displayName] || {
          componentName: displayName,
          inclusive: 0,
          exclusive: 0,
          render: 0,
          count: 0
        };
        if (measurement.render[id]) {
          candidates[displayName].render += measurement.render[id];
        }
        if (measurement.exclusive[id]) {
          candidates[displayName].exclusive += measurement.exclusive[id];
        }
        if (measurement.inclusive[id]) {
          candidates[displayName].inclusive += measurement.inclusive[id];
        }
        if (measurement.counts[id]) {
          candidates[displayName].count += measurement.counts[id];
        }
      }
    }
    var arr = [];
    for (displayName in candidates) {
      if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
        arr.push(candidates[displayName]);
      }
    }
    arr.sort(function(a, b) {
      return b.exclusive - a.exclusive;
    });
    return arr;
  }
  function getInclusiveSummary(measurements, onlyClean) {
    var candidates = {};
    var inclusiveKey;
    for (var i = 0; i < measurements.length; i++) {
      var measurement = measurements[i];
      var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
      var cleanComponents;
      if (onlyClean) {
        cleanComponents = getUnchangedComponents(measurement);
      }
      for (var id in allIDs) {
        if (onlyClean && !cleanComponents[id]) {
          continue;
        }
        var displayName = measurement.displayNames[id];
        inclusiveKey = displayName.owner + ' > ' + displayName.current;
        candidates[inclusiveKey] = candidates[inclusiveKey] || {
          componentName: inclusiveKey,
          time: 0,
          count: 0
        };
        if (measurement.inclusive[id]) {
          candidates[inclusiveKey].time += measurement.inclusive[id];
        }
        if (measurement.counts[id]) {
          candidates[inclusiveKey].count += measurement.counts[id];
        }
      }
    }
    var arr = [];
    for (inclusiveKey in candidates) {
      if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
        arr.push(candidates[inclusiveKey]);
      }
    }
    arr.sort(function(a, b) {
      return b.time - a.time;
    });
    return arr;
  }
  function getUnchangedComponents(measurement) {
    var cleanComponents = {};
    var dirtyLeafIDs = Object.keys(measurement.writes);
    var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
    for (var id in allIDs) {
      var isDirty = false;
      for (var i = 0; i < dirtyLeafIDs.length; i++) {
        if (dirtyLeafIDs[i].indexOf(id) === 0) {
          isDirty = true;
          break;
        }
      }
      if (measurement.created[id]) {
        isDirty = true;
      }
      if (!isDirty && measurement.counts[id] > 0) {
        cleanComponents[id] = true;
      }
    }
    return cleanComponents;
  }
  var ReactDefaultPerfAnalysis = {
    getExclusiveSummary: getExclusiveSummary,
    getInclusiveSummary: getInclusiveSummary,
    getDOMSummary: getDOMSummary,
    getTotalTime: getTotalTime
  };
  module.exports = ReactDefaultPerfAnalysis;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/performance", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var performance;
  if (ExecutionEnvironment.canUseDOM) {
    performance = window.performance || window.msPerformance || window.webkitPerformance;
  }
  module.exports = performance || {};
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactVersion", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  module.exports = '0.14.0';
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/renderSubtreeIntoContainer", ["npm:react@0.14.0/lib/ReactMount"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
  module.exports = ReactMount.renderSubtreeIntoContainer;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactServerBatchingStrategy", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactServerBatchingStrategy = {
    isBatchingUpdates: false,
    batchedUpdates: function(callback) {}
  };
  module.exports = ReactServerBatchingStrategy;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactServerRenderingTransaction", ["npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/CallbackQueue", "npm:react@0.14.0/lib/Transaction", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyFunction"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
  var CallbackQueue = require("npm:react@0.14.0/lib/CallbackQueue");
  var Transaction = require("npm:react@0.14.0/lib/Transaction");
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
  var ON_DOM_READY_QUEUEING = {
    initialize: function() {
      this.reactMountReady.reset();
    },
    close: emptyFunction
  };
  var TRANSACTION_WRAPPERS = [ON_DOM_READY_QUEUEING];
  function ReactServerRenderingTransaction(renderToStaticMarkup) {
    this.reinitializeTransaction();
    this.renderToStaticMarkup = renderToStaticMarkup;
    this.reactMountReady = CallbackQueue.getPooled(null);
    this.useCreateElement = false;
  }
  var Mixin = {
    getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS;
    },
    getReactMountReady: function() {
      return this.reactMountReady;
    },
    destructor: function() {
      CallbackQueue.release(this.reactMountReady);
      this.reactMountReady = null;
    }
  };
  assign(ReactServerRenderingTransaction.prototype, Transaction.Mixin, Mixin);
  PooledClass.addPoolingTo(ReactServerRenderingTransaction);
  module.exports = ReactServerRenderingTransaction;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactElementValidator", ["npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactPropTypeLocations", "npm:react@0.14.0/lib/ReactPropTypeLocationNames", "npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/getIteratorFn", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactPropTypeLocations = require("npm:react@0.14.0/lib/ReactPropTypeLocations");
    var ReactPropTypeLocationNames = require("npm:react@0.14.0/lib/ReactPropTypeLocationNames");
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var getIteratorFn = require("npm:react@0.14.0/lib/getIteratorFn");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function getDeclarationErrorAddendum() {
      if (ReactCurrentOwner.current) {
        var name = ReactCurrentOwner.current.getName();
        if (name) {
          return ' Check the render method of `' + name + '`.';
        }
      }
      return '';
    }
    var ownerHasKeyUseWarning = {};
    var loggedTypeFailures = {};
    function validateExplicitKey(element, parentType) {
      if (!element._store || element._store.validated || element.key != null) {
        return ;
      }
      element._store.validated = true;
      var addenda = getAddendaForKeyUse('uniqueKey', element, parentType);
      if (addenda === null) {
        return ;
      }
      process.env.NODE_ENV !== 'production' ? warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s%s', addenda.parentOrOwner || '', addenda.childOwner || '', addenda.url || '') : undefined;
    }
    function getAddendaForKeyUse(messageType, element, parentType) {
      var addendum = getDeclarationErrorAddendum();
      if (!addendum) {
        var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
        if (parentName) {
          addendum = ' Check the top-level render call using <' + parentName + '>.';
        }
      }
      var memoizer = ownerHasKeyUseWarning[messageType] || (ownerHasKeyUseWarning[messageType] = {});
      if (memoizer[addendum]) {
        return null;
      }
      memoizer[addendum] = true;
      var addenda = {
        parentOrOwner: addendum,
        url: ' See https://fb.me/react-warning-keys for more information.',
        childOwner: null
      };
      if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
        addenda.childOwner = ' It was passed a child from ' + element._owner.getName() + '.';
      }
      return addenda;
    }
    function validateChildKeys(node, parentType) {
      if (typeof node !== 'object') {
        return ;
      }
      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) {
          var child = node[i];
          if (ReactElement.isValidElement(child)) {
            validateExplicitKey(child, parentType);
          }
        }
      } else if (ReactElement.isValidElement(node)) {
        if (node._store) {
          node._store.validated = true;
        }
      } else if (node) {
        var iteratorFn = getIteratorFn(node);
        if (iteratorFn) {
          if (iteratorFn !== node.entries) {
            var iterator = iteratorFn.call(node);
            var step;
            while (!(step = iterator.next()).done) {
              if (ReactElement.isValidElement(step.value)) {
                validateExplicitKey(step.value, parentType);
              }
            }
          }
        }
      }
    }
    function checkPropTypes(componentName, propTypes, props, location) {
      for (var propName in propTypes) {
        if (propTypes.hasOwnProperty(propName)) {
          var error;
          try {
            !(typeof propTypes[propName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], propName) : invariant(false) : undefined;
            error = propTypes[propName](props, propName, componentName, location);
          } catch (ex) {
            error = ex;
          }
          process.env.NODE_ENV !== 'production' ? warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', ReactPropTypeLocationNames[location], propName, typeof error) : undefined;
          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            loggedTypeFailures[error.message] = true;
            var addendum = getDeclarationErrorAddendum();
            process.env.NODE_ENV !== 'production' ? warning(false, 'Failed propType: %s%s', error.message, addendum) : undefined;
          }
        }
      }
    }
    function validatePropTypes(element) {
      var componentClass = element.type;
      if (typeof componentClass !== 'function') {
        return ;
      }
      var name = componentClass.displayName || componentClass.name;
      if (componentClass.propTypes) {
        checkPropTypes(name, componentClass.propTypes, element.props, ReactPropTypeLocations.prop);
      }
      if (typeof componentClass.getDefaultProps === 'function') {
        process.env.NODE_ENV !== 'production' ? warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : undefined;
      }
    }
    var ReactElementValidator = {
      createElement: function(type, props, children) {
        var validType = typeof type === 'string' || typeof type === 'function';
        process.env.NODE_ENV !== 'production' ? warning(validType, 'React.createElement: type should not be null, undefined, boolean, or ' + 'number. It should be a string (for DOM elements) or a ReactClass ' + '(for composite components).%s', getDeclarationErrorAddendum()) : undefined;
        var element = ReactElement.createElement.apply(this, arguments);
        if (element == null) {
          return element;
        }
        if (validType) {
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], type);
          }
        }
        validatePropTypes(element);
        return element;
      },
      createFactory: function(type) {
        var validatedFactory = ReactElementValidator.createElement.bind(null, type);
        validatedFactory.type = type;
        if (process.env.NODE_ENV !== 'production') {
          try {
            Object.defineProperty(validatedFactory, 'type', {
              enumerable: false,
              get: function() {
                process.env.NODE_ENV !== 'production' ? warning(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.') : undefined;
                Object.defineProperty(this, 'type', {value: type});
                return type;
              }
            });
          } catch (x) {}
        }
        return validatedFactory;
      },
      cloneElement: function(element, props, children) {
        var newElement = ReactElement.cloneElement.apply(this, arguments);
        for (var i = 2; i < arguments.length; i++) {
          validateChildKeys(arguments[i], newElement.type);
        }
        validatePropTypes(newElement);
        return newElement;
      }
    };
    module.exports = ReactElementValidator;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/mapObject", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function mapObject(object, callback, context) {
    if (!object) {
      return null;
    }
    var result = {};
    for (var name in object) {
      if (hasOwnProperty.call(object, name)) {
        result[name] = callback.call(context, object[name], name, object);
      }
    }
    return result;
  }
  module.exports = mapObject;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/onlyChild", ["npm:react@0.14.0/lib/ReactElement", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function onlyChild(children) {
      !ReactElement.isValidElement(children) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'onlyChild must be passed a children with exactly one child.') : invariant(false) : undefined;
      return children;
    }
    module.exports = onlyChild;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/deprecated", ["npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function deprecated(fnName, newModule, newPackage, ctx, fn) {
      var warned = false;
      if (process.env.NODE_ENV !== 'production') {
        var newFn = function() {
          process.env.NODE_ENV !== 'production' ? warning(warned, 'React.%s is deprecated. Please use %s.%s from require' + '(\'%s\') ' + 'instead.', fnName, newModule, fnName, newPackage) : undefined;
          warned = true;
          return fn.apply(ctx, arguments);
        };
        return assign(newFn, fn);
      }
      return fn;
    }
    module.exports = deprecated;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dom@0.14.0/index", ["npm:react@0.14.0/lib/ReactDOM"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  module.exports = require("npm:react@0.14.0/lib/ReactDOM");
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.fw", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = function($) {
    $.FW = false;
    $.path = $.core;
    return $;
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.def", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      global = $.g,
      core = $.core,
      isFunction = $.isFunction;
  function ctx(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  }
  $def.F = 1;
  $def.G = 2;
  $def.S = 4;
  $def.P = 8;
  $def.B = 16;
  $def.W = 32;
  function $def(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & $def.G,
        isProto = type & $def.P,
        target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {}).prototype,
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal)
      source = name;
    for (key in source) {
      own = !(type & $def.F) && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      if (isGlobal && !isFunction(target[key]))
        exp = source[key];
      else if (type & $def.B && own)
        exp = ctx(out, global);
      else if (type & $def.W && target[key] == out)
        !function(C) {
          exp = function(param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp.prototype = C.prototype;
        }(out);
      else
        exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
      exports[key] = exp;
      if (isProto)
        (exports.prototype || (exports.prototype = {}))[key] = out;
    }
  }
  module.exports = $def;
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.get-names", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      toString = {}.toString,
      getNames = $.getNames;
  var windowNames = typeof window == 'object' && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
  function getWindowNames(it) {
    try {
      return getNames(it);
    } catch (e) {
      return windowNames.slice();
    }
  }
  module.exports.get = function getOwnPropertyNames(it) {
    if (windowNames && toString.call(it) == '[object Window]')
      return getWindowNames(it);
    return getNames($.toObject(it));
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/fn/object/create", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$");
  module.exports = function create(P, D) {
    return $.create(P, D);
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.assert", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$");
  function assert(condition, msg1, msg2) {
    if (!condition)
      throw TypeError(msg2 ? msg1 + msg2 : msg1);
  }
  assert.def = $.assertDefined;
  assert.fn = function(it) {
    if (!$.isFunction(it))
      throw TypeError(it + ' is not a function!');
    return it;
  };
  assert.obj = function(it) {
    if (!$.isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  assert.inst = function(it, Constructor, name) {
    if (!(it instanceof Constructor))
      throw TypeError(name + ": use the 'new' operator!");
    return it;
  };
  module.exports = assert;
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.ctx", ["npm:core-js@0.9.18/library/modules/$.assert"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var assertFunction = require("npm:core-js@0.9.18/library/modules/$.assert").fn;
  module.exports = function(fn, that, length) {
    assertFunction(fn);
    if (~length && that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/fn/object/define-property", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/helpers/class-call-check", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/isPlainObject", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = isPlainObject;
  var fnToString = function fnToString(fn) {
    return Function.prototype.toString.call(fn);
  };
  function isPlainObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    var proto = typeof obj.constructor === 'function' ? Object.getPrototypeOf(obj) : Object.prototype;
    if (proto === null) {
      return true;
    }
    var constructor = proto.constructor;
    return typeof constructor === 'function' && constructor instanceof constructor && fnToString(constructor) === fnToString(Object);
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/lang/isObject", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }
  module.exports = isObject;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/isObjectLike", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }
  module.exports = isObjectLike;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/isLength", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  module.exports = isLength;
  global.define = __define;
  return module.exports;
});

System.register("npm:invariant@2.1.1/browser", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = function(condition, format, a, b, c, d, e, f) {
      if (process.env.NODE_ENV !== 'production') {
        if (format === undefined) {
          throw new Error('invariant requires an error message argument');
        }
      }
      if (!condition) {
        var error;
        if (format === undefined) {
          error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error('Invariant Violation: ' + format.replace(/%s/g, function() {
            return args[argIndex++];
          }));
        }
        error.framesToPop = 1;
        throw error;
      }
    };
    module.exports = invariant;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/actions/registry", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports.addSource = addSource;
  exports.addTarget = addTarget;
  exports.removeSource = removeSource;
  exports.removeTarget = removeTarget;
  var ADD_SOURCE = 'dnd-core/ADD_SOURCE';
  exports.ADD_SOURCE = ADD_SOURCE;
  var ADD_TARGET = 'dnd-core/ADD_TARGET';
  exports.ADD_TARGET = ADD_TARGET;
  var REMOVE_SOURCE = 'dnd-core/REMOVE_SOURCE';
  exports.REMOVE_SOURCE = REMOVE_SOURCE;
  var REMOVE_TARGET = 'dnd-core/REMOVE_TARGET';
  exports.REMOVE_TARGET = REMOVE_TARGET;
  function addSource(sourceId) {
    return {
      type: ADD_SOURCE,
      sourceId: sourceId
    };
  }
  function addTarget(targetId) {
    return {
      type: ADD_TARGET,
      targetId: targetId
    };
  }
  function removeSource(sourceId) {
    return {
      type: REMOVE_SOURCE,
      sourceId: sourceId
    };
  }
  function removeTarget(targetId) {
    return {
      type: REMOVE_TARGET,
      targetId: targetId
    };
  }
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/indexOfNaN", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);
    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }
  module.exports = indexOfNaN;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/cacheIndexOf", ["npm:lodash@3.10.1/lang/isObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isObject = require("npm:lodash@3.10.1/lang/isObject");
  function cacheIndexOf(cache, value) {
    var data = cache.data,
        result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];
    return result ? 0 : -1;
  }
  module.exports = cacheIndexOf;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/cachePush", ["npm:lodash@3.10.1/lang/isObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isObject = require("npm:lodash@3.10.1/lang/isObject");
  function cachePush(value) {
    var data = this.data;
    if (typeof value == 'string' || isObject(value)) {
      data.set.add(value);
    } else {
      data.hash[value] = true;
    }
  }
  module.exports = cachePush;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseProperty", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }
  module.exports = baseProperty;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/function/restParam", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var FUNC_ERROR_TEXT = 'Expected a function';
  var nativeMax = Math.max;
  function restParam(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          rest = Array(length);
      while (++index < length) {
        rest[index] = args[start + index];
      }
      switch (start) {
        case 0:
          return func.call(this, rest);
        case 1:
          return func.call(this, args[0], rest);
        case 2:
          return func.call(this, args[0], args[1], rest);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = rest;
      return func.apply(this, otherArgs);
    };
  }
  module.exports = restParam;
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/reducers/refCount", ["npm:dnd-core@1.2.1/lib/actions/registry"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = refCount;
  var _actionsRegistry = require("npm:dnd-core@1.2.1/lib/actions/registry");
  function refCount(state, action) {
    if (state === undefined)
      state = 0;
    switch (action.type) {
      case _actionsRegistry.ADD_SOURCE:
      case _actionsRegistry.ADD_TARGET:
        return state + 1;
      case _actionsRegistry.REMOVE_SOURCE:
      case _actionsRegistry.REMOVE_TARGET:
        return state - 1;
      default:
        return state;
    }
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/arrayPush", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  module.exports = arrayPush;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseUniq", ["npm:lodash@3.10.1/internal/baseIndexOf", "npm:lodash@3.10.1/internal/cacheIndexOf", "npm:lodash@3.10.1/internal/createCache"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseIndexOf = require("npm:lodash@3.10.1/internal/baseIndexOf"),
      cacheIndexOf = require("npm:lodash@3.10.1/internal/cacheIndexOf"),
      createCache = require("npm:lodash@3.10.1/internal/createCache");
  var LARGE_ARRAY_SIZE = 200;
  function baseUniq(array, iteratee) {
    var index = -1,
        indexOf = baseIndexOf,
        length = array.length,
        isCommon = true,
        isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
        seen = isLarge ? createCache() : null,
        result = [];
    if (seen) {
      indexOf = cacheIndexOf;
      isCommon = false;
    } else {
      isLarge = false;
      seen = iteratee ? [] : result;
    }
    outer: while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value, index, array) : value;
      if (isCommon && value === value) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (indexOf(seen, computed, 0) < 0) {
        if (iteratee || isLarge) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }
  module.exports = baseUniq;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/array/intersection", ["npm:lodash@3.10.1/internal/baseIndexOf", "npm:lodash@3.10.1/internal/cacheIndexOf", "npm:lodash@3.10.1/internal/createCache", "npm:lodash@3.10.1/internal/isArrayLike", "npm:lodash@3.10.1/function/restParam"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseIndexOf = require("npm:lodash@3.10.1/internal/baseIndexOf"),
      cacheIndexOf = require("npm:lodash@3.10.1/internal/cacheIndexOf"),
      createCache = require("npm:lodash@3.10.1/internal/createCache"),
      isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike"),
      restParam = require("npm:lodash@3.10.1/function/restParam");
  var intersection = restParam(function(arrays) {
    var othLength = arrays.length,
        othIndex = othLength,
        caches = Array(length),
        indexOf = baseIndexOf,
        isCommon = true,
        result = [];
    while (othIndex--) {
      var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
      caches[othIndex] = (isCommon && value.length >= 120) ? createCache(othIndex && value) : null;
    }
    var array = arrays[0],
        index = -1,
        length = array ? array.length : 0,
        seen = caches[0];
    outer: while (++index < length) {
      value = array[index];
      if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
        var othIndex = othLength;
        while (--othIndex) {
          var cache = caches[othIndex];
          if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
            continue outer;
          }
        }
        if (seen) {
          seen.push(value);
        }
        result.push(value);
      }
    }
    return result;
  });
  module.exports = intersection;
  global.define = __define;
  return module.exports;
});

System.register("npm:keymirror@0.1.1/index", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var keyMirror = function(obj) {
    var ret = {};
    var key;
    if (!(obj instanceof Object && !Array.isArray(obj))) {
      throw new Error('keyMirror(...): Argument must be an object.');
    }
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      ret[key] = key;
    }
    return ret;
  };
  module.exports = keyMirror;
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/utils/getNextUniqueId", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = getNextUniqueId;
  var nextUniqueId = 0;
  function getNextUniqueId() {
    return nextUniqueId++;
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/DragSource", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var DragSource = (function() {
    function DragSource() {
      _classCallCheck(this, DragSource);
    }
    DragSource.prototype.canDrag = function canDrag() {
      return true;
    };
    DragSource.prototype.isDragging = function isDragging(monitor, handle) {
      return handle === monitor.getSourceId();
    };
    DragSource.prototype.endDrag = function endDrag() {};
    return DragSource;
  })();
  exports["default"] = DragSource;
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/DropTarget", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var DropTarget = (function() {
    function DropTarget() {
      _classCallCheck(this, DropTarget);
    }
    DropTarget.prototype.canDrop = function canDrop() {
      return true;
    };
    DropTarget.prototype.hover = function hover() {};
    DropTarget.prototype.drop = function drop() {};
    return DropTarget;
  })();
  exports["default"] = DropTarget;
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/utility/noop", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function noop() {}
  module.exports = noop;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    exports['default'] = checkDecoratorArguments;
    function checkDecoratorArguments(functionName, signature) {
      if (process.env.NODE_ENV !== 'production') {
        for (var _len = arguments.length,
            args = Array(_len > 2 ? _len - 2 : 0),
            _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        for (var i = 0; i < args.length; i++) {
          var arg = args[i];
          if (arg && arg.prototype && arg.prototype.render) {
            console.error('You seem to be applying the arguments in the wrong order. ' + ('It should be ' + functionName + '(' + signature + ')(Component), not the other way around. ') + 'Read more: http://gaearon.github.io/react-dnd/docs-troubleshooting.html#you-seem-to-be-applying-the-arguments-in-the-wrong-order');
            return ;
          }
        }
      }
    }
    module.exports = exports['default'];
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/shallowEqual", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = shallowEqual;
  function shallowEqual(objA, objB) {
    if (objA === objB) {
      return true;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var i = 0; i < keysA.length; i++) {
      if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        return false;
      }
      var valA = objA[keysA[i]];
      var valB = objB[keysA[i]];
      if (valA !== valB) {
        return false;
      }
    }
    return true;
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = shallowEqualScalar;
  function shallowEqualScalar(objA, objB) {
    if (objA === objB) {
      return true;
    }
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var i = 0; i < keysA.length; i++) {
      if (!hasOwn.call(objB, keysA[i])) {
        return false;
      }
      var valA = objA[keysA[i]];
      var valB = objB[keysA[i]];
      if (valA !== valB || typeof valA === 'object' || typeof valB === 'object') {
        return false;
      }
    }
    return true;
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/toObject", ["npm:lodash@3.10.1/lang/isObject", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    var isObject = require("npm:lodash@3.10.1/lang/isObject");
    function toObject(value) {
      return isObject(value) ? value : Object(value);
    }
    module.exports = toObject;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/lang/isArguments", ["npm:lodash@3.10.1/internal/isArrayLike", "npm:lodash@3.10.1/internal/isObjectLike"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike"),
      isObjectLike = require("npm:lodash@3.10.1/internal/isObjectLike");
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  function isArguments(value) {
    return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  }
  module.exports = isArguments;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/isIndex", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var reIsUint = /^\d+$/;
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isIndex(value, length) {
    value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 == 0 && value < length;
  }
  module.exports = isIndex;
  global.define = __define;
  return module.exports;
});

System.register("npm:disposables@1.0.1/modules/isDisposable", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = isDisposable;
  function isDisposable(obj) {
    return Boolean(obj && typeof obj.dispose === 'function');
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:disposables@1.0.1/modules/Disposable", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  var _createClass = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  var noop = function noop() {};
  var Disposable = (function() {
    function Disposable(action) {
      _classCallCheck(this, Disposable);
      this.isDisposed = false;
      this.action = action || noop;
    }
    Disposable.prototype.dispose = function dispose() {
      if (!this.isDisposed) {
        this.action.call(null);
        this.isDisposed = true;
      }
    };
    _createClass(Disposable, null, [{
      key: "empty",
      enumerable: true,
      value: {dispose: noop}
    }]);
    return Disposable;
  })();
  exports["default"] = Disposable;
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:disposables@1.0.1/modules/CompositeDisposable", ["npm:disposables@1.0.1/modules/isDisposable"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var _isDisposable = require("npm:disposables@1.0.1/modules/isDisposable");
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
  global.define = __define;
  return module.exports;
});

System.register("npm:disposables@1.0.1/modules/SerialDisposable", ["npm:disposables@1.0.1/modules/isDisposable"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var _isDisposable = require("npm:disposables@1.0.1/modules/isDisposable");
  var _isDisposable2 = _interopRequireWildcard(_isDisposable);
  var SerialDisposable = (function() {
    function SerialDisposable() {
      _classCallCheck(this, SerialDisposable);
      this.isDisposed = false;
      this.current = null;
    }
    SerialDisposable.prototype.getDisposable = function getDisposable() {
      return this.current;
    };
    SerialDisposable.prototype.setDisposable = function setDisposable() {
      var value = arguments[0] === undefined ? null : arguments[0];
      if (value != null && !_isDisposable2['default'](value)) {
        throw new Error('Expected either an empty value or a valid disposable');
      }
      var isDisposed = this.isDisposed;
      var previous = undefined;
      if (!isDisposed) {
        previous = this.current;
        this.current = value;
      }
      if (previous) {
        previous.dispose();
      }
      if (isDisposed && value) {
        value.dispose();
      }
    };
    SerialDisposable.prototype.dispose = function dispose() {
      if (this.isDisposed) {
        return ;
      }
      this.isDisposed = true;
      var previous = this.current;
      this.current = null;
      if (previous) {
        previous.dispose();
      }
    };
    return SerialDisposable;
  })();
  exports['default'] = SerialDisposable;
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/cloneWithRef", ["npm:invariant@2.1.1", "npm:react@0.14.0"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = cloneWithRef;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _react = require("npm:react@0.14.0");
  function cloneWithRef(element, newRef) {
    var previousRef = element.ref;
    _invariant2['default'](typeof previousRef !== 'string', 'Cannot connect React DnD to an element with an existing string ref. ' + 'Please convert it to use a callback ref instead, or wrap it into a <span> or <div>. ' + 'Read more: https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute');
    return _react.cloneElement(element, {ref: function ref(instance) {
        newRef(instance);
        if (previousRef) {
          previousRef(instance);
        }
      }});
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/registerSource", ["npm:invariant@2.1.1"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = registerSource;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  function registerSource(type, source, manager) {
    var registry = manager.getRegistry();
    var sourceId = registry.addSource(type, source);
    function unregisterSource() {
      registry.removeSource(sourceId);
    }
    ;
    return {
      handlerId: sourceId,
      unregister: unregisterSource
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/createSourceFactory", ["npm:invariant@2.1.1", "npm:lodash@3.10.1/lang/isPlainObject", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    exports['default'] = createSourceFactory;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {'default': obj};
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
      }
    }
    var _invariant = require("npm:invariant@2.1.1");
    var _invariant2 = _interopRequireDefault(_invariant);
    var _lodashLangIsPlainObject = require("npm:lodash@3.10.1/lang/isPlainObject");
    var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);
    var ALLOWED_SPEC_METHODS = ['canDrag', 'beginDrag', 'canDrag', 'isDragging', 'endDrag'];
    var REQUIRED_SPEC_METHODS = ['beginDrag'];
    function createSourceFactory(spec) {
      Object.keys(spec).forEach(function(key) {
        _invariant2['default'](ALLOWED_SPEC_METHODS.indexOf(key) > -1, 'Expected the drag source specification to only have ' + 'some of the following keys: %s. ' + 'Instead received a specification with an unexpected "%s" key. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', ALLOWED_SPEC_METHODS.join(', '), key);
        _invariant2['default'](typeof spec[key] === 'function', 'Expected %s in the drag source specification to be a function. ' + 'Instead received a specification with %s: %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', key, key, spec[key]);
      });
      REQUIRED_SPEC_METHODS.forEach(function(key) {
        _invariant2['default'](typeof spec[key] === 'function', 'Expected %s in the drag source specification to be a function. ' + 'Instead received a specification with %s: %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', key, key, spec[key]);
      });
      var Source = (function() {
        function Source(monitor) {
          _classCallCheck(this, Source);
          this.monitor = monitor;
          this.props = null;
          this.component = null;
        }
        Source.prototype.receiveProps = function receiveProps(props) {
          this.props = props;
        };
        Source.prototype.receiveComponent = function receiveComponent(component) {
          this.component = component;
        };
        Source.prototype.canDrag = function canDrag() {
          if (!spec.canDrag) {
            return true;
          }
          return spec.canDrag(this.props, this.monitor);
        };
        Source.prototype.isDragging = function isDragging(globalMonitor, sourceId) {
          if (!spec.isDragging) {
            return sourceId === globalMonitor.getSourceId();
          }
          return spec.isDragging(this.props, this.monitor);
        };
        Source.prototype.beginDrag = function beginDrag() {
          var item = spec.beginDrag(this.props, this.monitor, this.component);
          if (process.env.NODE_ENV !== 'production') {
            _invariant2['default'](_lodashLangIsPlainObject2['default'](item), 'beginDrag() must return a plain object that represents the dragged item. ' + 'Instead received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', item);
          }
          return item;
        };
        Source.prototype.endDrag = function endDrag() {
          if (!spec.endDrag) {
            return ;
          }
          spec.endDrag(this.props, this.monitor, this.component);
        };
        return Source;
      })();
      return function createSource(monitor) {
        return new Source(monitor);
      };
    }
    module.exports = exports['default'];
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/createSourceMonitor", ["npm:invariant@2.1.1"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = createSourceMonitor;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var isCallingCanDrag = false;
  var isCallingIsDragging = false;
  var SourceMonitor = (function() {
    function SourceMonitor(manager) {
      _classCallCheck(this, SourceMonitor);
      this.internalMonitor = manager.getMonitor();
    }
    SourceMonitor.prototype.receiveHandlerId = function receiveHandlerId(sourceId) {
      this.sourceId = sourceId;
    };
    SourceMonitor.prototype.canDrag = function canDrag() {
      _invariant2['default'](!isCallingCanDrag, 'You may not call monitor.canDrag() inside your canDrag() implementation. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source-monitor.html');
      try {
        isCallingCanDrag = true;
        return this.internalMonitor.canDragSource(this.sourceId);
      } finally {
        isCallingCanDrag = false;
      }
    };
    SourceMonitor.prototype.isDragging = function isDragging() {
      _invariant2['default'](!isCallingIsDragging, 'You may not call monitor.isDragging() inside your isDragging() implementation. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source-monitor.html');
      try {
        isCallingIsDragging = true;
        return this.internalMonitor.isDraggingSource(this.sourceId);
      } finally {
        isCallingIsDragging = false;
      }
    };
    SourceMonitor.prototype.getItemType = function getItemType() {
      return this.internalMonitor.getItemType();
    };
    SourceMonitor.prototype.getItem = function getItem() {
      return this.internalMonitor.getItem();
    };
    SourceMonitor.prototype.getDropResult = function getDropResult() {
      return this.internalMonitor.getDropResult();
    };
    SourceMonitor.prototype.didDrop = function didDrop() {
      return this.internalMonitor.didDrop();
    };
    SourceMonitor.prototype.getInitialClientOffset = function getInitialClientOffset() {
      return this.internalMonitor.getInitialClientOffset();
    };
    SourceMonitor.prototype.getInitialSourceClientOffset = function getInitialSourceClientOffset() {
      return this.internalMonitor.getInitialSourceClientOffset();
    };
    SourceMonitor.prototype.getSourceClientOffset = function getSourceClientOffset() {
      return this.internalMonitor.getSourceClientOffset();
    };
    SourceMonitor.prototype.getClientOffset = function getClientOffset() {
      return this.internalMonitor.getClientOffset();
    };
    SourceMonitor.prototype.getDifferenceFromInitialOffset = function getDifferenceFromInitialOffset() {
      return this.internalMonitor.getDifferenceFromInitialOffset();
    };
    return SourceMonitor;
  })();
  function createSourceMonitor(manager) {
    return new SourceMonitor(manager);
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/createSourceConnector", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = createSourceConnector;
  function createSourceConnector(backend) {
    return {
      dragSource: backend.connectDragSource.bind(backend),
      dragPreview: backend.connectDragPreview.bind(backend)
    };
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/isValidType", ["npm:lodash@3.10.1/lang/isArray"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = isValidType;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _lodashLangIsArray = require("npm:lodash@3.10.1/lang/isArray");
  var _lodashLangIsArray2 = _interopRequireDefault(_lodashLangIsArray);
  function isValidType(type, allowArray) {
    return typeof type === 'string' || typeof type === 'symbol' || allowArray && _lodashLangIsArray2['default'](type) && type.every(function(t) {
      return isValidType(t, false);
    });
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/registerTarget", ["npm:invariant@2.1.1"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = registerTarget;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  function registerTarget(type, target, manager) {
    var registry = manager.getRegistry();
    var targetId = registry.addTarget(type, target);
    function unregisterTarget() {
      registry.removeTarget(targetId);
    }
    ;
    return {
      handlerId: targetId,
      unregister: unregisterTarget
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/createTargetFactory", ["npm:invariant@2.1.1", "npm:lodash@3.10.1/lang/isPlainObject", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    exports['default'] = createTargetFactory;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {'default': obj};
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
      }
    }
    var _invariant = require("npm:invariant@2.1.1");
    var _invariant2 = _interopRequireDefault(_invariant);
    var _lodashLangIsPlainObject = require("npm:lodash@3.10.1/lang/isPlainObject");
    var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);
    var ALLOWED_SPEC_METHODS = ['canDrop', 'hover', 'drop'];
    function createTargetFactory(spec) {
      Object.keys(spec).forEach(function(key) {
        _invariant2['default'](ALLOWED_SPEC_METHODS.indexOf(key) > -1, 'Expected the drop target specification to only have ' + 'some of the following keys: %s. ' + 'Instead received a specification with an unexpected "%s" key. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', ALLOWED_SPEC_METHODS.join(', '), key);
        _invariant2['default'](typeof spec[key] === 'function', 'Expected %s in the drop target specification to be a function. ' + 'Instead received a specification with %s: %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', key, key, spec[key]);
      });
      var Target = (function() {
        function Target(monitor) {
          _classCallCheck(this, Target);
          this.monitor = monitor;
          this.props = null;
          this.component = null;
        }
        Target.prototype.receiveProps = function receiveProps(props) {
          this.props = props;
        };
        Target.prototype.receiveMonitor = function receiveMonitor(monitor) {
          this.monitor = monitor;
        };
        Target.prototype.receiveComponent = function receiveComponent(component) {
          this.component = component;
        };
        Target.prototype.canDrop = function canDrop() {
          if (!spec.canDrop) {
            return true;
          }
          return spec.canDrop(this.props, this.monitor);
        };
        Target.prototype.hover = function hover() {
          if (!spec.hover) {
            return ;
          }
          spec.hover(this.props, this.monitor, this.component);
        };
        Target.prototype.drop = function drop() {
          if (!spec.drop) {
            return ;
          }
          var dropResult = spec.drop(this.props, this.monitor, this.component);
          if (process.env.NODE_ENV !== 'production') {
            _invariant2['default'](typeof dropResult === 'undefined' || _lodashLangIsPlainObject2['default'](dropResult), 'drop() must either return undefined, or an object that represents the drop result. ' + 'Instead received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', dropResult);
          }
          return dropResult;
        };
        return Target;
      })();
      return function createTarget(monitor) {
        return new Target(monitor);
      };
    }
    module.exports = exports['default'];
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/createTargetMonitor", ["npm:invariant@2.1.1"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = createTargetMonitor;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var isCallingCanDrop = false;
  var TargetMonitor = (function() {
    function TargetMonitor(manager) {
      _classCallCheck(this, TargetMonitor);
      this.internalMonitor = manager.getMonitor();
    }
    TargetMonitor.prototype.receiveHandlerId = function receiveHandlerId(targetId) {
      this.targetId = targetId;
    };
    TargetMonitor.prototype.canDrop = function canDrop() {
      _invariant2['default'](!isCallingCanDrop, 'You may not call monitor.canDrop() inside your canDrop() implementation. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target-monitor.html');
      try {
        isCallingCanDrop = true;
        return this.internalMonitor.canDropOnTarget(this.targetId);
      } finally {
        isCallingCanDrop = false;
      }
    };
    TargetMonitor.prototype.isOver = function isOver(options) {
      return this.internalMonitor.isOverTarget(this.targetId, options);
    };
    TargetMonitor.prototype.getItemType = function getItemType() {
      return this.internalMonitor.getItemType();
    };
    TargetMonitor.prototype.getItem = function getItem() {
      return this.internalMonitor.getItem();
    };
    TargetMonitor.prototype.getDropResult = function getDropResult() {
      return this.internalMonitor.getDropResult();
    };
    TargetMonitor.prototype.didDrop = function didDrop() {
      return this.internalMonitor.didDrop();
    };
    TargetMonitor.prototype.getInitialClientOffset = function getInitialClientOffset() {
      return this.internalMonitor.getInitialClientOffset();
    };
    TargetMonitor.prototype.getInitialSourceClientOffset = function getInitialSourceClientOffset() {
      return this.internalMonitor.getInitialSourceClientOffset();
    };
    TargetMonitor.prototype.getSourceClientOffset = function getSourceClientOffset() {
      return this.internalMonitor.getSourceClientOffset();
    };
    TargetMonitor.prototype.getClientOffset = function getClientOffset() {
      return this.internalMonitor.getClientOffset();
    };
    TargetMonitor.prototype.getDifferenceFromInitialOffset = function getDifferenceFromInitialOffset() {
      return this.internalMonitor.getDifferenceFromInitialOffset();
    };
    return TargetMonitor;
  })();
  function createTargetMonitor(manager) {
    return new TargetMonitor(manager);
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/createTargetConnector", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = createTargetConnector;
  function createTargetConnector(backend) {
    return {dropTarget: backend.connectDropTarget.bind(backend)};
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:immutable@3.7.5/dist/immutable", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.Immutable = factory();
  }(this, function() {
    'use strict';
    var SLICE$0 = Array.prototype.slice;
    function createClass(ctor, superClass) {
      if (superClass) {
        ctor.prototype = Object.create(superClass.prototype);
      }
      ctor.prototype.constructor = ctor;
    }
    var DELETE = 'delete';
    var SHIFT = 5;
    var SIZE = 1 << SHIFT;
    var MASK = SIZE - 1;
    var NOT_SET = {};
    var CHANGE_LENGTH = {value: false};
    var DID_ALTER = {value: false};
    function MakeRef(ref) {
      ref.value = false;
      return ref;
    }
    function SetRef(ref) {
      ref && (ref.value = true);
    }
    function OwnerID() {}
    function arrCopy(arr, offset) {
      offset = offset || 0;
      var len = Math.max(0, arr.length - offset);
      var newArr = new Array(len);
      for (var ii = 0; ii < len; ii++) {
        newArr[ii] = arr[ii + offset];
      }
      return newArr;
    }
    function ensureSize(iter) {
      if (iter.size === undefined) {
        iter.size = iter.__iterate(returnTrue);
      }
      return iter.size;
    }
    function wrapIndex(iter, index) {
      if (typeof index !== 'number') {
        var numIndex = +index;
        if ('' + numIndex !== index) {
          return NaN;
        }
        index = numIndex;
      }
      return index < 0 ? ensureSize(iter) + index : index;
    }
    function returnTrue() {
      return true;
    }
    function wholeSlice(begin, end, size) {
      return (begin === 0 || (size !== undefined && begin <= -size)) && (end === undefined || (size !== undefined && end >= size));
    }
    function resolveBegin(begin, size) {
      return resolveIndex(begin, size, 0);
    }
    function resolveEnd(end, size) {
      return resolveIndex(end, size, size);
    }
    function resolveIndex(index, size, defaultIndex) {
      return index === undefined ? defaultIndex : index < 0 ? Math.max(0, size + index) : size === undefined ? index : Math.min(size, index);
    }
    function Iterable(value) {
      return isIterable(value) ? value : Seq(value);
    }
    createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }
    createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }
    createClass(SetIterable, Iterable);
    function SetIterable(value) {
      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }
    function isIterable(maybeIterable) {
      return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
    }
    function isKeyed(maybeKeyed) {
      return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
    }
    function isIndexed(maybeIndexed) {
      return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
    }
    function isAssociative(maybeAssociative) {
      return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
    }
    function isOrdered(maybeOrdered) {
      return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
    }
    Iterable.isIterable = isIterable;
    Iterable.isKeyed = isKeyed;
    Iterable.isIndexed = isIndexed;
    Iterable.isAssociative = isAssociative;
    Iterable.isOrdered = isOrdered;
    Iterable.Keyed = KeyedIterable;
    Iterable.Indexed = IndexedIterable;
    Iterable.Set = SetIterable;
    var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
    var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
    var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
    var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';
    var ITERATE_KEYS = 0;
    var ITERATE_VALUES = 1;
    var ITERATE_ENTRIES = 2;
    var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator';
    var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
    function src_Iterator__Iterator(next) {
      this.next = next;
    }
    src_Iterator__Iterator.prototype.toString = function() {
      return '[Iterator]';
    };
    src_Iterator__Iterator.KEYS = ITERATE_KEYS;
    src_Iterator__Iterator.VALUES = ITERATE_VALUES;
    src_Iterator__Iterator.ENTRIES = ITERATE_ENTRIES;
    src_Iterator__Iterator.prototype.inspect = src_Iterator__Iterator.prototype.toSource = function() {
      return this.toString();
    };
    src_Iterator__Iterator.prototype[ITERATOR_SYMBOL] = function() {
      return this;
    };
    function iteratorValue(type, k, v, iteratorResult) {
      var value = type === 0 ? k : type === 1 ? v : [k, v];
      iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
        value: value,
        done: false
      });
      return iteratorResult;
    }
    function iteratorDone() {
      return {
        value: undefined,
        done: true
      };
    }
    function hasIterator(maybeIterable) {
      return !!getIteratorFn(maybeIterable);
    }
    function isIterator(maybeIterator) {
      return maybeIterator && typeof maybeIterator.next === 'function';
    }
    function getIterator(iterable) {
      var iteratorFn = getIteratorFn(iterable);
      return iteratorFn && iteratorFn.call(iterable);
    }
    function getIteratorFn(iterable) {
      var iteratorFn = iterable && ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) || iterable[FAUX_ITERATOR_SYMBOL]);
      if (typeof iteratorFn === 'function') {
        return iteratorFn;
      }
    }
    function isArrayLike(value) {
      return value && typeof value.length === 'number';
    }
    createClass(Seq, Iterable);
    function Seq(value) {
      return value === null || value === undefined ? emptySequence() : isIterable(value) ? value.toSeq() : seqFromValue(value);
    }
    Seq.of = function() {
      return Seq(arguments);
    };
    Seq.prototype.toSeq = function() {
      return this;
    };
    Seq.prototype.toString = function() {
      return this.__toString('Seq {', '}');
    };
    Seq.prototype.cacheResult = function() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };
    Seq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, true);
    };
    Seq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, true);
    };
    createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
      return value === null || value === undefined ? emptySequence().toKeyedSeq() : isIterable(value) ? (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) : keyedSeqFromValue(value);
    }
    KeyedSeq.prototype.toKeyedSeq = function() {
      return this;
    };
    createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
      return value === null || value === undefined ? emptySequence() : !isIterable(value) ? indexedSeqFromValue(value) : isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }
    IndexedSeq.of = function() {
      return IndexedSeq(arguments);
    };
    IndexedSeq.prototype.toIndexedSeq = function() {
      return this;
    };
    IndexedSeq.prototype.toString = function() {
      return this.__toString('Seq [', ']');
    };
    IndexedSeq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, false);
    };
    IndexedSeq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, false);
    };
    createClass(SetSeq, Seq);
    function SetSeq(value) {
      return (value === null || value === undefined ? emptySequence() : !isIterable(value) ? indexedSeqFromValue(value) : isKeyed(value) ? value.entrySeq() : value).toSetSeq();
    }
    SetSeq.of = function() {
      return SetSeq(arguments);
    };
    SetSeq.prototype.toSetSeq = function() {
      return this;
    };
    Seq.isSeq = isSeq;
    Seq.Keyed = KeyedSeq;
    Seq.Set = SetSeq;
    Seq.Indexed = IndexedSeq;
    var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';
    Seq.prototype[IS_SEQ_SENTINEL] = true;
    createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }
    ArraySeq.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };
    ArraySeq.prototype.__iterate = function(fn, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };
    ArraySeq.prototype.__iterator = function(type, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      var ii = 0;
      return new src_Iterator__Iterator(function() {
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++]);
      });
    };
    createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }
    ObjectSeq.prototype.get = function(key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };
    ObjectSeq.prototype.has = function(key) {
      return this._object.hasOwnProperty(key);
    };
    ObjectSeq.prototype.__iterate = function(fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var key = keys[reverse ? maxIndex - ii : ii];
        if (fn(object[key], key, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };
    ObjectSeq.prototype.__iterator = function(type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      var ii = 0;
      return new src_Iterator__Iterator(function() {
        var key = keys[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, key, object[key]);
      });
    };
    ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;
    createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
      this._iterable = iterable;
      this.size = iterable.length || iterable.size;
    }
    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };
    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      if (!isIterator(iterator)) {
        return new src_Iterator__Iterator(iteratorDone);
      }
      var iterations = 0;
      return new src_Iterator__Iterator(function() {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };
    createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
      this._iterator = iterator;
      this._iteratorCache = [];
    }
    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      while (iterations < cache.length) {
        if (fn(cache[iterations], iterations++, this) === false) {
          return iterations;
        }
      }
      var step;
      while (!(step = iterator.next()).done) {
        var val = step.value;
        cache[iterations] = val;
        if (fn(val, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      return new src_Iterator__Iterator(function() {
        if (iterations >= cache.length) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          cache[iterations] = step.value;
        }
        return iteratorValue(type, iterations, cache[iterations++]);
      });
    };
    function isSeq(maybeSeq) {
      return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
    }
    var EMPTY_SEQ;
    function emptySequence() {
      return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
    }
    function keyedSeqFromValue(value) {
      var seq = Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() : isIterator(value) ? new IteratorSeq(value).fromEntrySeq() : hasIterator(value) ? new IterableSeq(value).fromEntrySeq() : typeof value === 'object' ? new ObjectSeq(value) : undefined;
      if (!seq) {
        throw new TypeError('Expected Array or iterable object of [k, v] entries, ' + 'or keyed object: ' + value);
      }
      return seq;
    }
    function indexedSeqFromValue(value) {
      var seq = maybeIndexedSeqFromValue(value);
      if (!seq) {
        throw new TypeError('Expected Array or iterable object of values: ' + value);
      }
      return seq;
    }
    function seqFromValue(value) {
      var seq = maybeIndexedSeqFromValue(value) || (typeof value === 'object' && new ObjectSeq(value));
      if (!seq) {
        throw new TypeError('Expected Array or iterable object of values, or keyed object: ' + value);
      }
      return seq;
    }
    function maybeIndexedSeqFromValue(value) {
      return (isArrayLike(value) ? new ArraySeq(value) : isIterator(value) ? new IteratorSeq(value) : hasIterator(value) ? new IterableSeq(value) : undefined);
    }
    function seqIterate(seq, fn, reverse, useKeys) {
      var cache = seq._cache;
      if (cache) {
        var maxIndex = cache.length - 1;
        for (var ii = 0; ii <= maxIndex; ii++) {
          var entry = cache[reverse ? maxIndex - ii : ii];
          if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
            return ii + 1;
          }
        }
        return ii;
      }
      return seq.__iterateUncached(fn, reverse);
    }
    function seqIterator(seq, type, reverse, useKeys) {
      var cache = seq._cache;
      if (cache) {
        var maxIndex = cache.length - 1;
        var ii = 0;
        return new src_Iterator__Iterator(function() {
          var entry = cache[reverse ? maxIndex - ii : ii];
          return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
        });
      }
      return seq.__iteratorUncached(type, reverse);
    }
    createClass(Collection, Iterable);
    function Collection() {
      throw TypeError('Abstract');
    }
    createClass(KeyedCollection, Collection);
    function KeyedCollection() {}
    createClass(IndexedCollection, Collection);
    function IndexedCollection() {}
    createClass(SetCollection, Collection);
    function SetCollection() {}
    Collection.Keyed = KeyedCollection;
    Collection.Indexed = IndexedCollection;
    Collection.Set = SetCollection;
    function is(valueA, valueB) {
      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
        return true;
      }
      if (!valueA || !valueB) {
        return false;
      }
      if (typeof valueA.valueOf === 'function' && typeof valueB.valueOf === 'function') {
        valueA = valueA.valueOf();
        valueB = valueB.valueOf();
        if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
          return true;
        }
        if (!valueA || !valueB) {
          return false;
        }
      }
      if (typeof valueA.equals === 'function' && typeof valueB.equals === 'function' && valueA.equals(valueB)) {
        return true;
      }
      return false;
    }
    function fromJS(json, converter) {
      return converter ? fromJSWith(converter, json, '', {'': json}) : fromJSDefault(json);
    }
    function fromJSWith(converter, json, key, parentJSON) {
      if (Array.isArray(json)) {
        return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k) {
          return fromJSWith(converter, v, k, json);
        }));
      }
      if (isPlainObj(json)) {
        return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k) {
          return fromJSWith(converter, v, k, json);
        }));
      }
      return json;
    }
    function fromJSDefault(json) {
      if (Array.isArray(json)) {
        return IndexedSeq(json).map(fromJSDefault).toList();
      }
      if (isPlainObj(json)) {
        return KeyedSeq(json).map(fromJSDefault).toMap();
      }
      return json;
    }
    function isPlainObj(value) {
      return value && (value.constructor === Object || value.constructor === undefined);
    }
    var src_Math__imul = typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ? Math.imul : function imul(a, b) {
      a = a | 0;
      b = b | 0;
      var c = a & 0xffff;
      var d = b & 0xffff;
      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0;
    };
    function smi(i32) {
      return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
    }
    function hash(o) {
      if (o === false || o === null || o === undefined) {
        return 0;
      }
      if (typeof o.valueOf === 'function') {
        o = o.valueOf();
        if (o === false || o === null || o === undefined) {
          return 0;
        }
      }
      if (o === true) {
        return 1;
      }
      var type = typeof o;
      if (type === 'number') {
        var h = o | 0;
        if (h !== o) {
          h ^= o * 0xFFFFFFFF;
        }
        while (o > 0xFFFFFFFF) {
          o /= 0xFFFFFFFF;
          h ^= o;
        }
        return smi(h);
      }
      if (type === 'string') {
        return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
      }
      if (typeof o.hashCode === 'function') {
        return o.hashCode();
      }
      return hashJSObj(o);
    }
    function cachedHashString(string) {
      var hash = stringHashCache[string];
      if (hash === undefined) {
        hash = hashString(string);
        if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
          STRING_HASH_CACHE_SIZE = 0;
          stringHashCache = {};
        }
        STRING_HASH_CACHE_SIZE++;
        stringHashCache[string] = hash;
      }
      return hash;
    }
    function hashString(string) {
      var hash = 0;
      for (var ii = 0; ii < string.length; ii++) {
        hash = 31 * hash + string.charCodeAt(ii) | 0;
      }
      return smi(hash);
    }
    function hashJSObj(obj) {
      var hash;
      if (usingWeakMap) {
        hash = weakMap.get(obj);
        if (hash !== undefined) {
          return hash;
        }
      }
      hash = obj[UID_HASH_KEY];
      if (hash !== undefined) {
        return hash;
      }
      if (!canDefineProperty) {
        hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
        if (hash !== undefined) {
          return hash;
        }
        hash = getIENodeHash(obj);
        if (hash !== undefined) {
          return hash;
        }
      }
      hash = ++objHashUID;
      if (objHashUID & 0x40000000) {
        objHashUID = 0;
      }
      if (usingWeakMap) {
        weakMap.set(obj, hash);
      } else if (isExtensible !== undefined && isExtensible(obj) === false) {
        throw new Error('Non-extensible objects are not allowed as keys.');
      } else if (canDefineProperty) {
        Object.defineProperty(obj, UID_HASH_KEY, {
          'enumerable': false,
          'configurable': false,
          'writable': false,
          'value': hash
        });
      } else if (obj.propertyIsEnumerable !== undefined && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
        obj.propertyIsEnumerable = function() {
          return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
        };
        obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
      } else if (obj.nodeType !== undefined) {
        obj[UID_HASH_KEY] = hash;
      } else {
        throw new Error('Unable to set a non-enumerable property on object.');
      }
      return hash;
    }
    var isExtensible = Object.isExtensible;
    var canDefineProperty = (function() {
      try {
        Object.defineProperty({}, '@', {});
        return true;
      } catch (e) {
        return false;
      }
    }());
    function getIENodeHash(node) {
      if (node && node.nodeType > 0) {
        switch (node.nodeType) {
          case 1:
            return node.uniqueID;
          case 9:
            return node.documentElement && node.documentElement.uniqueID;
        }
      }
    }
    var usingWeakMap = typeof WeakMap === 'function';
    var weakMap;
    if (usingWeakMap) {
      weakMap = new WeakMap();
    }
    var objHashUID = 0;
    var UID_HASH_KEY = '__immutablehash__';
    if (typeof Symbol === 'function') {
      UID_HASH_KEY = Symbol(UID_HASH_KEY);
    }
    var STRING_HASH_CACHE_MIN_STRLEN = 16;
    var STRING_HASH_CACHE_MAX_SIZE = 255;
    var STRING_HASH_CACHE_SIZE = 0;
    var stringHashCache = {};
    function invariant(condition, error) {
      if (!condition)
        throw new Error(error);
    }
    function assertNotInfinite(size) {
      invariant(size !== Infinity, 'Cannot perform this action with an infinite size.');
    }
    createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }
    ToKeyedSequence.prototype.get = function(key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };
    ToKeyedSequence.prototype.has = function(key) {
      return this._iter.has(key);
    };
    ToKeyedSequence.prototype.valueSeq = function() {
      return this._iter.valueSeq();
    };
    ToKeyedSequence.prototype.reverse = function() {
      var this$0 = this;
      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function() {
          return this$0._iter.toSeq().reverse();
        };
      }
      return reversedSequence;
    };
    ToKeyedSequence.prototype.map = function(mapper, context) {
      var this$0 = this;
      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function() {
          return this$0._iter.toSeq().map(mapper, context);
        };
      }
      return mappedSequence;
    };
    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      var ii;
      return this._iter.__iterate(this._useKeys ? function(v, k) {
        return fn(v, k, this$0);
      } : ((ii = reverse ? resolveSize(this) : 0), function(v) {
        return fn(v, reverse ? --ii : ii++, this$0);
      }), reverse);
    };
    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
      if (this._useKeys) {
        return this._iter.__iterator(type, reverse);
      }
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var ii = reverse ? resolveSize(this) : 0;
      return new src_Iterator__Iterator(function() {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, reverse ? --ii : ii++, step.value, step);
      });
    };
    ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;
    createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }
    ToIndexedSequence.prototype.includes = function(value) {
      return this._iter.includes(value);
    };
    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      var iterations = 0;
      return this._iter.__iterate(function(v) {
        return fn(v, iterations++, this$0);
      }, reverse);
    };
    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      return new src_Iterator__Iterator(function() {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value, step);
      });
    };
    createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }
    ToSetSequence.prototype.has = function(key) {
      return this._iter.includes(key);
    };
    ToSetSequence.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      return this._iter.__iterate(function(v) {
        return fn(v, v, this$0);
      }, reverse);
    };
    ToSetSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new src_Iterator__Iterator(function() {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, step.value, step.value, step);
      });
    };
    createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }
    FromEntriesSequence.prototype.entrySeq = function() {
      return this._iter.toSeq();
    };
    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      return this._iter.__iterate(function(entry) {
        if (entry) {
          validateEntry(entry);
          var indexedIterable = isIterable(entry);
          return fn(indexedIterable ? entry.get(1) : entry[1], indexedIterable ? entry.get(0) : entry[0], this$0);
        }
      }, reverse);
    };
    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new src_Iterator__Iterator(function() {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          if (entry) {
            validateEntry(entry);
            var indexedIterable = isIterable(entry);
            return iteratorValue(type, indexedIterable ? entry.get(0) : entry[0], indexedIterable ? entry.get(1) : entry[1], step);
          }
        }
      });
    };
    ToIndexedSequence.prototype.cacheResult = ToKeyedSequence.prototype.cacheResult = ToSetSequence.prototype.cacheResult = FromEntriesSequence.prototype.cacheResult = cacheResultThrough;
    function flipFactory(iterable) {
      var flipSequence = makeSequence(iterable);
      flipSequence._iter = iterable;
      flipSequence.size = iterable.size;
      flipSequence.flip = function() {
        return iterable;
      };
      flipSequence.reverse = function() {
        var reversedSequence = iterable.reverse.apply(this);
        reversedSequence.flip = function() {
          return iterable.reverse();
        };
        return reversedSequence;
      };
      flipSequence.has = function(key) {
        return iterable.includes(key);
      };
      flipSequence.includes = function(key) {
        return iterable.has(key);
      };
      flipSequence.cacheResult = cacheResultThrough;
      flipSequence.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        return iterable.__iterate(function(v, k) {
          return fn(k, v, this$0) !== false;
        }, reverse);
      };
      flipSequence.__iteratorUncached = function(type, reverse) {
        if (type === ITERATE_ENTRIES) {
          var iterator = iterable.__iterator(type, reverse);
          return new src_Iterator__Iterator(function() {
            var step = iterator.next();
            if (!step.done) {
              var k = step.value[0];
              step.value[0] = step.value[1];
              step.value[1] = k;
            }
            return step;
          });
        }
        return iterable.__iterator(type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES, reverse);
      };
      return flipSequence;
    }
    function mapFactory(iterable, mapper, context) {
      var mappedSequence = makeSequence(iterable);
      mappedSequence.size = iterable.size;
      mappedSequence.has = function(key) {
        return iterable.has(key);
      };
      mappedSequence.get = function(key, notSetValue) {
        var v = iterable.get(key, NOT_SET);
        return v === NOT_SET ? notSetValue : mapper.call(context, v, key, iterable);
      };
      mappedSequence.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        return iterable.__iterate(function(v, k, c) {
          return fn(mapper.call(context, v, k, c), k, this$0) !== false;
        }, reverse);
      };
      mappedSequence.__iteratorUncached = function(type, reverse) {
        var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
        return new src_Iterator__Iterator(function() {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);
        });
      };
      return mappedSequence;
    }
    function reverseFactory(iterable, useKeys) {
      var reversedSequence = makeSequence(iterable);
      reversedSequence._iter = iterable;
      reversedSequence.size = iterable.size;
      reversedSequence.reverse = function() {
        return iterable;
      };
      if (iterable.flip) {
        reversedSequence.flip = function() {
          var flipSequence = flipFactory(iterable);
          flipSequence.reverse = function() {
            return iterable.flip();
          };
          return flipSequence;
        };
      }
      reversedSequence.get = function(key, notSetValue) {
        return iterable.get(useKeys ? key : -1 - key, notSetValue);
      };
      reversedSequence.has = function(key) {
        return iterable.has(useKeys ? key : -1 - key);
      };
      reversedSequence.includes = function(value) {
        return iterable.includes(value);
      };
      reversedSequence.cacheResult = cacheResultThrough;
      reversedSequence.__iterate = function(fn, reverse) {
        var this$0 = this;
        return iterable.__iterate(function(v, k) {
          return fn(v, k, this$0);
        }, !reverse);
      };
      reversedSequence.__iterator = function(type, reverse) {
        return iterable.__iterator(type, !reverse);
      };
      return reversedSequence;
    }
    function filterFactory(iterable, predicate, context, useKeys) {
      var filterSequence = makeSequence(iterable);
      if (useKeys) {
        filterSequence.has = function(key) {
          var v = iterable.get(key, NOT_SET);
          return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
        };
        filterSequence.get = function(key, notSetValue) {
          var v = iterable.get(key, NOT_SET);
          return v !== NOT_SET && predicate.call(context, v, key, iterable) ? v : notSetValue;
        };
      }
      filterSequence.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        var iterations = 0;
        iterable.__iterate(function(v, k, c) {
          if (predicate.call(context, v, k, c)) {
            iterations++;
            return fn(v, useKeys ? k : iterations - 1, this$0);
          }
        }, reverse);
        return iterations;
      };
      filterSequence.__iteratorUncached = function(type, reverse) {
        var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
        var iterations = 0;
        return new src_Iterator__Iterator(function() {
          while (true) {
            var step = iterator.next();
            if (step.done) {
              return step;
            }
            var entry = step.value;
            var key = entry[0];
            var value = entry[1];
            if (predicate.call(context, value, key, iterable)) {
              return iteratorValue(type, useKeys ? key : iterations++, value, step);
            }
          }
        });
      };
      return filterSequence;
    }
    function countByFactory(iterable, grouper, context) {
      var groups = src_Map__Map().asMutable();
      iterable.__iterate(function(v, k) {
        groups.update(grouper.call(context, v, k, iterable), 0, function(a) {
          return a + 1;
        });
      });
      return groups.asImmutable();
    }
    function groupByFactory(iterable, grouper, context) {
      var isKeyedIter = isKeyed(iterable);
      var groups = (isOrdered(iterable) ? OrderedMap() : src_Map__Map()).asMutable();
      iterable.__iterate(function(v, k) {
        groups.update(grouper.call(context, v, k, iterable), function(a) {
          return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a);
        });
      });
      var coerce = iterableClass(iterable);
      return groups.map(function(arr) {
        return reify(iterable, coerce(arr));
      });
    }
    function sliceFactory(iterable, begin, end, useKeys) {
      var originalSize = iterable.size;
      if (begin !== undefined) {
        begin = begin | 0;
      }
      if (end !== undefined) {
        end = end | 0;
      }
      if (wholeSlice(begin, end, originalSize)) {
        return iterable;
      }
      var resolvedBegin = resolveBegin(begin, originalSize);
      var resolvedEnd = resolveEnd(end, originalSize);
      if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
        return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
      }
      var resolvedSize = resolvedEnd - resolvedBegin;
      var sliceSize;
      if (resolvedSize === resolvedSize) {
        sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
      }
      var sliceSeq = makeSequence(iterable);
      sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;
      if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
        sliceSeq.get = function(index, notSetValue) {
          index = wrapIndex(this, index);
          return index >= 0 && index < sliceSize ? iterable.get(index + resolvedBegin, notSetValue) : notSetValue;
        };
      }
      sliceSeq.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        if (sliceSize === 0) {
          return 0;
        }
        if (reverse) {
          return this.cacheResult().__iterate(fn, reverse);
        }
        var skipped = 0;
        var isSkipping = true;
        var iterations = 0;
        iterable.__iterate(function(v, k) {
          if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
            iterations++;
            return fn(v, useKeys ? k : iterations - 1, this$0) !== false && iterations !== sliceSize;
          }
        });
        return iterations;
      };
      sliceSeq.__iteratorUncached = function(type, reverse) {
        if (sliceSize !== 0 && reverse) {
          return this.cacheResult().__iterator(type, reverse);
        }
        var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
        var skipped = 0;
        var iterations = 0;
        return new src_Iterator__Iterator(function() {
          while (skipped++ < resolvedBegin) {
            iterator.next();
          }
          if (++iterations > sliceSize) {
            return iteratorDone();
          }
          var step = iterator.next();
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          } else if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations - 1, undefined, step);
          } else {
            return iteratorValue(type, iterations - 1, step.value[1], step);
          }
        });
      };
      return sliceSeq;
    }
    function takeWhileFactory(iterable, predicate, context) {
      var takeSequence = makeSequence(iterable);
      takeSequence.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        if (reverse) {
          return this.cacheResult().__iterate(fn, reverse);
        }
        var iterations = 0;
        iterable.__iterate(function(v, k, c) {
          return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0);
        });
        return iterations;
      };
      takeSequence.__iteratorUncached = function(type, reverse) {
        var this$0 = this;
        if (reverse) {
          return this.cacheResult().__iterator(type, reverse);
        }
        var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
        var iterating = true;
        return new src_Iterator__Iterator(function() {
          if (!iterating) {
            return iteratorDone();
          }
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var k = entry[0];
          var v = entry[1];
          if (!predicate.call(context, v, k, this$0)) {
            iterating = false;
            return iteratorDone();
          }
          return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
        });
      };
      return takeSequence;
    }
    function skipWhileFactory(iterable, predicate, context, useKeys) {
      var skipSequence = makeSequence(iterable);
      skipSequence.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        if (reverse) {
          return this.cacheResult().__iterate(fn, reverse);
        }
        var isSkipping = true;
        var iterations = 0;
        iterable.__iterate(function(v, k, c) {
          if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
            iterations++;
            return fn(v, useKeys ? k : iterations - 1, this$0);
          }
        });
        return iterations;
      };
      skipSequence.__iteratorUncached = function(type, reverse) {
        var this$0 = this;
        if (reverse) {
          return this.cacheResult().__iterator(type, reverse);
        }
        var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
        var skipping = true;
        var iterations = 0;
        return new src_Iterator__Iterator(function() {
          var step,
              k,
              v;
          do {
            step = iterator.next();
            if (step.done) {
              if (useKeys || type === ITERATE_VALUES) {
                return step;
              } else if (type === ITERATE_KEYS) {
                return iteratorValue(type, iterations++, undefined, step);
              } else {
                return iteratorValue(type, iterations++, step.value[1], step);
              }
            }
            var entry = step.value;
            k = entry[0];
            v = entry[1];
            skipping && (skipping = predicate.call(context, v, k, this$0));
          } while (skipping);
          return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
        });
      };
      return skipSequence;
    }
    function concatFactory(iterable, values) {
      var isKeyedIterable = isKeyed(iterable);
      var iters = [iterable].concat(values).map(function(v) {
        if (!isIterable(v)) {
          v = isKeyedIterable ? keyedSeqFromValue(v) : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
        } else if (isKeyedIterable) {
          v = KeyedIterable(v);
        }
        return v;
      }).filter(function(v) {
        return v.size !== 0;
      });
      if (iters.length === 0) {
        return iterable;
      }
      if (iters.length === 1) {
        var singleton = iters[0];
        if (singleton === iterable || isKeyedIterable && isKeyed(singleton) || isIndexed(iterable) && isIndexed(singleton)) {
          return singleton;
        }
      }
      var concatSeq = new ArraySeq(iters);
      if (isKeyedIterable) {
        concatSeq = concatSeq.toKeyedSeq();
      } else if (!isIndexed(iterable)) {
        concatSeq = concatSeq.toSetSeq();
      }
      concatSeq = concatSeq.flatten(true);
      concatSeq.size = iters.reduce(function(sum, seq) {
        if (sum !== undefined) {
          var size = seq.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
      }, 0);
      return concatSeq;
    }
    function flattenFactory(iterable, depth, useKeys) {
      var flatSequence = makeSequence(iterable);
      flatSequence.__iterateUncached = function(fn, reverse) {
        var iterations = 0;
        var stopped = false;
        function flatDeep(iter, currentDepth) {
          var this$0 = this;
          iter.__iterate(function(v, k) {
            if ((!depth || currentDepth < depth) && isIterable(v)) {
              flatDeep(v, currentDepth + 1);
            } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
              stopped = true;
            }
            return !stopped;
          }, reverse);
        }
        flatDeep(iterable, 0);
        return iterations;
      };
      flatSequence.__iteratorUncached = function(type, reverse) {
        var iterator = iterable.__iterator(type, reverse);
        var stack = [];
        var iterations = 0;
        return new src_Iterator__Iterator(function() {
          while (iterator) {
            var step = iterator.next();
            if (step.done !== false) {
              iterator = stack.pop();
              continue;
            }
            var v = step.value;
            if (type === ITERATE_ENTRIES) {
              v = v[1];
            }
            if ((!depth || stack.length < depth) && isIterable(v)) {
              stack.push(iterator);
              iterator = v.__iterator(type, reverse);
            } else {
              return useKeys ? step : iteratorValue(type, iterations++, v, step);
            }
          }
          return iteratorDone();
        });
      };
      return flatSequence;
    }
    function flatMapFactory(iterable, mapper, context) {
      var coerce = iterableClass(iterable);
      return iterable.toSeq().map(function(v, k) {
        return coerce(mapper.call(context, v, k, iterable));
      }).flatten(true);
    }
    function interposeFactory(iterable, separator) {
      var interposedSequence = makeSequence(iterable);
      interposedSequence.size = iterable.size && iterable.size * 2 - 1;
      interposedSequence.__iterateUncached = function(fn, reverse) {
        var this$0 = this;
        var iterations = 0;
        iterable.__iterate(function(v, k) {
          return (!iterations || fn(separator, iterations++, this$0) !== false) && fn(v, iterations++, this$0) !== false;
        }, reverse);
        return iterations;
      };
      interposedSequence.__iteratorUncached = function(type, reverse) {
        var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
        var iterations = 0;
        var step;
        return new src_Iterator__Iterator(function() {
          if (!step || iterations % 2) {
            step = iterator.next();
            if (step.done) {
              return step;
            }
          }
          return iterations % 2 ? iteratorValue(type, iterations++, separator) : iteratorValue(type, iterations++, step.value, step);
        });
      };
      return interposedSequence;
    }
    function sortFactory(iterable, comparator, mapper) {
      if (!comparator) {
        comparator = defaultComparator;
      }
      var isKeyedIterable = isKeyed(iterable);
      var index = 0;
      var entries = iterable.toSeq().map(function(v, k) {
        return [k, v, index++, mapper ? mapper(v, k, iterable) : v];
      }).toArray();
      entries.sort(function(a, b) {
        return comparator(a[3], b[3]) || a[2] - b[2];
      }).forEach(isKeyedIterable ? function(v, i) {
        entries[i].length = 2;
      } : function(v, i) {
        entries[i] = v[1];
      });
      return isKeyedIterable ? KeyedSeq(entries) : isIndexed(iterable) ? IndexedSeq(entries) : SetSeq(entries);
    }
    function maxFactory(iterable, comparator, mapper) {
      if (!comparator) {
        comparator = defaultComparator;
      }
      if (mapper) {
        var entry = iterable.toSeq().map(function(v, k) {
          return [v, mapper(v, k, iterable)];
        }).reduce(function(a, b) {
          return maxCompare(comparator, a[1], b[1]) ? b : a;
        });
        return entry && entry[0];
      } else {
        return iterable.reduce(function(a, b) {
          return maxCompare(comparator, a, b) ? b : a;
        });
      }
    }
    function maxCompare(comparator, a, b) {
      var comp = comparator(b, a);
      return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
    }
    function zipWithFactory(keyIter, zipper, iters) {
      var zipSequence = makeSequence(keyIter);
      zipSequence.size = new ArraySeq(iters).map(function(i) {
        return i.size;
      }).min();
      zipSequence.__iterate = function(fn, reverse) {
        var iterator = this.__iterator(ITERATE_VALUES, reverse);
        var step;
        var iterations = 0;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
        return iterations;
      };
      zipSequence.__iteratorUncached = function(type, reverse) {
        var iterators = iters.map(function(i) {
          return (i = Iterable(i), getIterator(reverse ? i.reverse() : i));
        });
        var iterations = 0;
        var isDone = false;
        return new src_Iterator__Iterator(function() {
          var steps;
          if (!isDone) {
            steps = iterators.map(function(i) {
              return i.next();
            });
            isDone = steps.some(function(s) {
              return s.done;
            });
          }
          if (isDone) {
            return iteratorDone();
          }
          return iteratorValue(type, iterations++, zipper.apply(null, steps.map(function(s) {
            return s.value;
          })));
        });
      };
      return zipSequence;
    }
    function reify(iter, seq) {
      return isSeq(iter) ? seq : iter.constructor(seq);
    }
    function validateEntry(entry) {
      if (entry !== Object(entry)) {
        throw new TypeError('Expected [K, V] tuple: ' + entry);
      }
    }
    function resolveSize(iter) {
      assertNotInfinite(iter.size);
      return ensureSize(iter);
    }
    function iterableClass(iterable) {
      return isKeyed(iterable) ? KeyedIterable : isIndexed(iterable) ? IndexedIterable : SetIterable;
    }
    function makeSequence(iterable) {
      return Object.create((isKeyed(iterable) ? KeyedSeq : isIndexed(iterable) ? IndexedSeq : SetSeq).prototype);
    }
    function cacheResultThrough() {
      if (this._iter.cacheResult) {
        this._iter.cacheResult();
        this.size = this._iter.size;
        return this;
      } else {
        return Seq.prototype.cacheResult.call(this);
      }
    }
    function defaultComparator(a, b) {
      return a > b ? 1 : a < b ? -1 : 0;
    }
    function forceIterator(keyPath) {
      var iter = getIterator(keyPath);
      if (!iter) {
        if (!isArrayLike(keyPath)) {
          throw new TypeError('Expected iterable or array-like: ' + keyPath);
        }
        iter = getIterator(Iterable(keyPath));
      }
      return iter;
    }
    createClass(src_Map__Map, KeyedCollection);
    function src_Map__Map(value) {
      return value === null || value === undefined ? emptyMap() : isMap(value) && !isOrdered(value) ? value : emptyMap().withMutations(function(map) {
        var iter = KeyedIterable(value);
        assertNotInfinite(iter.size);
        iter.forEach(function(v, k) {
          return map.set(k, v);
        });
      });
    }
    src_Map__Map.prototype.toString = function() {
      return this.__toString('Map {', '}');
    };
    src_Map__Map.prototype.get = function(k, notSetValue) {
      return this._root ? this._root.get(0, undefined, k, notSetValue) : notSetValue;
    };
    src_Map__Map.prototype.set = function(k, v) {
      return updateMap(this, k, v);
    };
    src_Map__Map.prototype.setIn = function(keyPath, v) {
      return this.updateIn(keyPath, NOT_SET, function() {
        return v;
      });
    };
    src_Map__Map.prototype.remove = function(k) {
      return updateMap(this, k, NOT_SET);
    };
    src_Map__Map.prototype.deleteIn = function(keyPath) {
      return this.updateIn(keyPath, function() {
        return NOT_SET;
      });
    };
    src_Map__Map.prototype.update = function(k, notSetValue, updater) {
      return arguments.length === 1 ? k(this) : this.updateIn([k], notSetValue, updater);
    };
    src_Map__Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
      if (!updater) {
        updater = notSetValue;
        notSetValue = undefined;
      }
      var updatedValue = updateInDeepMap(this, forceIterator(keyPath), notSetValue, updater);
      return updatedValue === NOT_SET ? undefined : updatedValue;
    };
    src_Map__Map.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };
    src_Map__Map.prototype.merge = function() {
      return mergeIntoMapWith(this, undefined, arguments);
    };
    src_Map__Map.prototype.mergeWith = function(merger) {
      var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, merger, iters);
    };
    src_Map__Map.prototype.mergeIn = function(keyPath) {
      var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(keyPath, emptyMap(), function(m) {
        return typeof m.merge === 'function' ? m.merge.apply(m, iters) : iters[iters.length - 1];
      });
    };
    src_Map__Map.prototype.mergeDeep = function() {
      return mergeIntoMapWith(this, deepMerger(undefined), arguments);
    };
    src_Map__Map.prototype.mergeDeepWith = function(merger) {
      var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, deepMerger(merger), iters);
    };
    src_Map__Map.prototype.mergeDeepIn = function(keyPath) {
      var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(keyPath, emptyMap(), function(m) {
        return typeof m.mergeDeep === 'function' ? m.mergeDeep.apply(m, iters) : iters[iters.length - 1];
      });
    };
    src_Map__Map.prototype.sort = function(comparator) {
      return OrderedMap(sortFactory(this, comparator));
    };
    src_Map__Map.prototype.sortBy = function(mapper, comparator) {
      return OrderedMap(sortFactory(this, comparator, mapper));
    };
    src_Map__Map.prototype.withMutations = function(fn) {
      var mutable = this.asMutable();
      fn(mutable);
      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };
    src_Map__Map.prototype.asMutable = function() {
      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };
    src_Map__Map.prototype.asImmutable = function() {
      return this.__ensureOwner();
    };
    src_Map__Map.prototype.wasAltered = function() {
      return this.__altered;
    };
    src_Map__Map.prototype.__iterator = function(type, reverse) {
      return new MapIterator(this, type, reverse);
    };
    src_Map__Map.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      var iterations = 0;
      this._root && this._root.iterate(function(entry) {
        iterations++;
        return fn(entry[1], entry[0], this$0);
      }, reverse);
      return iterations;
    };
    src_Map__Map.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };
    function isMap(maybeMap) {
      return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
    }
    src_Map__Map.isMap = isMap;
    var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';
    var MapPrototype = src_Map__Map.prototype;
    MapPrototype[IS_MAP_SENTINEL] = true;
    MapPrototype[DELETE] = MapPrototype.remove;
    MapPrototype.removeIn = MapPrototype.deleteIn;
    function ArrayMapNode(ownerID, entries) {
      this.ownerID = ownerID;
      this.entries = entries;
    }
    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0,
          len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };
    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;
      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }
      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);
      if (removed && entries.length === 1) {
        return ;
      }
      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries, key, value);
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);
      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }
      if (isEditable) {
        this.entries = newEntries;
        return this;
      }
      return new ArrayMapNode(ownerID, newEntries);
    };
    function BitmapIndexedNode(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    }
    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };
    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;
      if (!exists && value === NOT_SET) {
        return this;
      }
      var idx = popCount(bitmap & (bit - 1));
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : undefined;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }
      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }
      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }
      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }
      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };
    function HashArrayMapNode(ownerID, count, nodes) {
      this.ownerID = ownerID;
      this.count = count;
      this.nodes = nodes;
    }
    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };
    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];
      if (removed && !node) {
        return this;
      }
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }
      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setIn(nodes, idx, newNode, isEditable);
      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }
      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };
    function HashCollisionNode(ownerID, keyHash, entries) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries;
    }
    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0,
          len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };
    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var removed = value === NOT_SET;
      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
      }
      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;
      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }
      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);
      if (removed && len === 2) {
        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);
      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }
      if (isEditable) {
        this.entries = newEntries;
        return this;
      }
      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };
    function ValueNode(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    }
    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };
    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }
      SetRef(didAlter);
      if (removed) {
        SetRef(didChangeSize);
        return ;
      }
      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [key, value]);
      }
      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };
    ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate = function(fn, reverse) {
      var entries = this.entries;
      for (var ii = 0,
          maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
        if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
          return false;
        }
      }
    };
    BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate = function(fn, reverse) {
      var nodes = this.nodes;
      for (var ii = 0,
          maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
        var node = nodes[reverse ? maxIndex - ii : ii];
        if (node && node.iterate(fn, reverse) === false) {
          return false;
        }
      }
    };
    ValueNode.prototype.iterate = function(fn, reverse) {
      return fn(this.entry);
    };
    createClass(MapIterator, src_Iterator__Iterator);
    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }
    MapIterator.prototype.next = function() {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex;
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
          }
        } else {
          maxIndex = node.nodes.length - 1;
          if (index <= maxIndex) {
            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
            if (subNode) {
              if (subNode.entry) {
                return mapIteratorValue(type, subNode.entry);
              }
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          }
        }
        stack = this._stack = this._stack.__prev;
      }
      return iteratorDone();
    };
    function mapIteratorValue(type, entry) {
      return iteratorValue(type, entry[0], entry[1]);
    }
    function mapIteratorFrame(node, prev) {
      return {
        node: node,
        index: 0,
        __prev: prev
      };
    }
    function makeMap(size, root, ownerID, hash) {
      var map = Object.create(MapPrototype);
      map.size = size;
      map._root = root;
      map.__ownerID = ownerID;
      map.__hash = hash;
      map.__altered = false;
      return map;
    }
    var EMPTY_MAP;
    function emptyMap() {
      return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
    }
    function updateMap(map, k, v) {
      var newRoot;
      var newSize;
      if (!map._root) {
        if (v === NOT_SET) {
          return map;
        }
        newSize = 1;
        newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
      } else {
        var didChangeSize = MakeRef(CHANGE_LENGTH);
        var didAlter = MakeRef(DID_ALTER);
        newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
        if (!didAlter.value) {
          return map;
        }
        newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
      }
      if (map.__ownerID) {
        map.size = newSize;
        map._root = newRoot;
        map.__hash = undefined;
        map.__altered = true;
        return map;
      }
      return newRoot ? makeMap(newSize, newRoot) : emptyMap();
    }
    function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (!node) {
        if (value === NOT_SET) {
          return node;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return new ValueNode(ownerID, keyHash, [key, value]);
      }
      return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
    }
    function isLeafNode(node) {
      return node.constructor === ValueNode || node.constructor === HashCollisionNode;
    }
    function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
      if (node.keyHash === keyHash) {
        return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
      }
      var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
      var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var newNode;
      var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] : ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
      return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
    }
    function createNodes(ownerID, entries, key, value) {
      if (!ownerID) {
        ownerID = new OwnerID();
      }
      var node = new ValueNode(ownerID, hash(key), [key, value]);
      for (var ii = 0; ii < entries.length; ii++) {
        var entry = entries[ii];
        node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
      }
      return node;
    }
    function packNodes(ownerID, nodes, count, excluding) {
      var bitmap = 0;
      var packedII = 0;
      var packedNodes = new Array(count);
      for (var ii = 0,
          bit = 1,
          len = nodes.length; ii < len; ii++, bit <<= 1) {
        var node = nodes[ii];
        if (node !== undefined && ii !== excluding) {
          bitmap |= bit;
          packedNodes[packedII++] = node;
        }
      }
      return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
    }
    function expandNodes(ownerID, nodes, bitmap, including, node) {
      var count = 0;
      var expandedNodes = new Array(SIZE);
      for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
        expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
      }
      expandedNodes[including] = node;
      return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
    }
    function mergeIntoMapWith(map, merger, iterables) {
      var iters = [];
      for (var ii = 0; ii < iterables.length; ii++) {
        var value = iterables[ii];
        var iter = KeyedIterable(value);
        if (!isIterable(value)) {
          iter = iter.map(function(v) {
            return fromJS(v);
          });
        }
        iters.push(iter);
      }
      return mergeIntoCollectionWith(map, merger, iters);
    }
    function deepMerger(merger) {
      return function(existing, value, key) {
        return existing && existing.mergeDeepWith && isIterable(value) ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value, key) : value;
      };
    }
    function mergeIntoCollectionWith(collection, merger, iters) {
      iters = iters.filter(function(x) {
        return x.size !== 0;
      });
      if (iters.length === 0) {
        return collection;
      }
      if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
        return collection.constructor(iters[0]);
      }
      return collection.withMutations(function(collection) {
        var mergeIntoMap = merger ? function(value, key) {
          collection.update(key, NOT_SET, function(existing) {
            return existing === NOT_SET ? value : merger(existing, value, key);
          });
        } : function(value, key) {
          collection.set(key, value);
        };
        for (var ii = 0; ii < iters.length; ii++) {
          iters[ii].forEach(mergeIntoMap);
        }
      });
    }
    function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
      var isNotSet = existing === NOT_SET;
      var step = keyPathIter.next();
      if (step.done) {
        var existingValue = isNotSet ? notSetValue : existing;
        var newValue = updater(existingValue);
        return newValue === existingValue ? existing : newValue;
      }
      invariant(isNotSet || (existing && existing.set), 'invalid keyPath');
      var key = step.value;
      var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
      var nextUpdated = updateInDeepMap(nextExisting, keyPathIter, notSetValue, updater);
      return nextUpdated === nextExisting ? existing : nextUpdated === NOT_SET ? existing.remove(key) : (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
    }
    function popCount(x) {
      x = x - ((x >> 1) & 0x55555555);
      x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
      x = (x + (x >> 4)) & 0x0f0f0f0f;
      x = x + (x >> 8);
      x = x + (x >> 16);
      return x & 0x7f;
    }
    function setIn(array, idx, val, canEdit) {
      var newArray = canEdit ? array : arrCopy(array);
      newArray[idx] = val;
      return newArray;
    }
    function spliceIn(array, idx, val, canEdit) {
      var newLen = array.length + 1;
      if (canEdit && idx + 1 === newLen) {
        array[idx] = val;
        return array;
      }
      var newArray = new Array(newLen);
      var after = 0;
      for (var ii = 0; ii < newLen; ii++) {
        if (ii === idx) {
          newArray[ii] = val;
          after = -1;
        } else {
          newArray[ii] = array[ii + after];
        }
      }
      return newArray;
    }
    function spliceOut(array, idx, canEdit) {
      var newLen = array.length - 1;
      if (canEdit && idx === newLen) {
        array.pop();
        return array;
      }
      var newArray = new Array(newLen);
      var after = 0;
      for (var ii = 0; ii < newLen; ii++) {
        if (ii === idx) {
          after = 1;
        }
        newArray[ii] = array[ii + after];
      }
      return newArray;
    }
    var MAX_ARRAY_MAP_SIZE = SIZE / 4;
    var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
    var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;
    createClass(List, IndexedCollection);
    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedIterable(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function(list) {
        list.setSize(size);
        iter.forEach(function(v, i) {
          return list.set(i, v);
        });
      });
    }
    List.of = function() {
      return this(arguments);
    };
    List.prototype.toString = function() {
      return this.__toString('List [', ']');
    };
    List.prototype.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      if (index >= 0 && index < this.size) {
        index += this._origin;
        var node = listNodeFor(this, index);
        return node && node.array[index & MASK];
      }
      return notSetValue;
    };
    List.prototype.set = function(index, value) {
      return updateList(this, index, value);
    };
    List.prototype.remove = function(index) {
      return !this.has(index) ? this : index === 0 ? this.shift() : index === this.size - 1 ? this.pop() : this.splice(index, 1);
    };
    List.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };
    List.prototype.push = function() {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function(list) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };
    List.prototype.pop = function() {
      return setListBounds(this, 0, -1);
    };
    List.prototype.unshift = function() {
      var values = arguments;
      return this.withMutations(function(list) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };
    List.prototype.shift = function() {
      return setListBounds(this, 1);
    };
    List.prototype.merge = function() {
      return mergeIntoListWith(this, undefined, arguments);
    };
    List.prototype.mergeWith = function(merger) {
      var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, merger, iters);
    };
    List.prototype.mergeDeep = function() {
      return mergeIntoListWith(this, deepMerger(undefined), arguments);
    };
    List.prototype.mergeDeepWith = function(merger) {
      var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, deepMerger(merger), iters);
    };
    List.prototype.setSize = function(size) {
      return setListBounds(this, 0, size);
    };
    List.prototype.slice = function(begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(this, resolveBegin(begin, size), resolveEnd(end, size));
    };
    List.prototype.__iterator = function(type, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      return new src_Iterator__Iterator(function() {
        var value = values();
        return value === DONE ? iteratorDone() : iteratorValue(type, index++, value);
      });
    };
    List.prototype.__iterate = function(fn, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, index++, this) === false) {
          break;
        }
      }
      return index;
    };
    List.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        return this;
      }
      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };
    function isList(maybeList) {
      return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
    }
    List.isList = isList;
    var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';
    var ListPrototype = List.prototype;
    ListPrototype[IS_LIST_SENTINEL] = true;
    ListPrototype[DELETE] = ListPrototype.remove;
    ListPrototype.setIn = MapPrototype.setIn;
    ListPrototype.deleteIn = ListPrototype.removeIn = MapPrototype.removeIn;
    ListPrototype.update = MapPrototype.update;
    ListPrototype.updateIn = MapPrototype.updateIn;
    ListPrototype.mergeIn = MapPrototype.mergeIn;
    ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
    ListPrototype.withMutations = MapPrototype.withMutations;
    ListPrototype.asMutable = MapPrototype.asMutable;
    ListPrototype.asImmutable = MapPrototype.asImmutable;
    ListPrototype.wasAltered = MapPrototype.wasAltered;
    function VNode(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    }
    VNode.prototype.removeBefore = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = (index >>> level) & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = undefined;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };
    VNode.prototype.removeAfter = function(ownerID, level, index) {
      if (index === (level ? 1 << level : 0) || this.array.length === 0) {
        return this;
      }
      var sizeIndex = ((index - 1) >>> level) & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }
      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
          return this;
        }
      }
      var editable = editableVNode(this, ownerID);
      editable.array.splice(sizeIndex + 1);
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };
    var DONE = {};
    function iterateList(list, reverse) {
      var left = list._origin;
      var right = list._capacity;
      var tailPos = getTailOffset(right);
      var tail = list._tail;
      return iterateNodeOrLeaf(list._root, list._level, 0);
      function iterateNodeOrLeaf(node, level, offset) {
        return level === 0 ? iterateLeaf(node, offset) : iterateNode(node, level, offset);
      }
      function iterateLeaf(node, offset) {
        var array = offset === tailPos ? tail && tail.array : node && node.array;
        var from = offset > left ? 0 : left - offset;
        var to = right - offset;
        if (to > SIZE) {
          to = SIZE;
        }
        return function() {
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          return array && array[idx];
        };
      }
      function iterateNode(node, level, offset) {
        var values;
        var array = node && node.array;
        var from = offset > left ? 0 : (left - offset) >> level;
        var to = ((right - offset) >> level) + 1;
        if (to > SIZE) {
          to = SIZE;
        }
        return function() {
          do {
            if (values) {
              var value = values();
              if (value !== DONE) {
                return value;
              }
              values = null;
            }
            if (from === to) {
              return DONE;
            }
            var idx = reverse ? --to : from++;
            values = iterateNodeOrLeaf(array && array[idx], level - SHIFT, offset + (idx << level));
          } while (true);
        };
      }
    }
    function makeList(origin, capacity, level, root, tail, ownerID, hash) {
      var list = Object.create(ListPrototype);
      list.size = capacity - origin;
      list._origin = origin;
      list._capacity = capacity;
      list._level = level;
      list._root = root;
      list._tail = tail;
      list.__ownerID = ownerID;
      list.__hash = hash;
      list.__altered = false;
      return list;
    }
    var EMPTY_LIST;
    function emptyList() {
      return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
    }
    function updateList(list, index, value) {
      index = wrapIndex(list, index);
      if (index !== index) {
        return list;
      }
      if (index >= list.size || index < 0) {
        return list.withMutations(function(list) {
          index < 0 ? setListBounds(list, index).set(0, value) : setListBounds(list, 0, index + 1).set(index, value);
        });
      }
      index += list._origin;
      var newTail = list._tail;
      var newRoot = list._root;
      var didAlter = MakeRef(DID_ALTER);
      if (index >= getTailOffset(list._capacity)) {
        newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
      } else {
        newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
      }
      if (!didAlter.value) {
        return list;
      }
      if (list.__ownerID) {
        list._root = newRoot;
        list._tail = newTail;
        list.__hash = undefined;
        list.__altered = true;
        return list;
      }
      return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
    }
    function updateVNode(node, ownerID, level, index, value, didAlter) {
      var idx = (index >>> level) & MASK;
      var nodeHas = node && idx < node.array.length;
      if (!nodeHas && value === undefined) {
        return node;
      }
      var newNode;
      if (level > 0) {
        var lowerNode = node && node.array[idx];
        var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
        if (newLowerNode === lowerNode) {
          return node;
        }
        newNode = editableVNode(node, ownerID);
        newNode.array[idx] = newLowerNode;
        return newNode;
      }
      if (nodeHas && node.array[idx] === value) {
        return node;
      }
      SetRef(didAlter);
      newNode = editableVNode(node, ownerID);
      if (value === undefined && idx === newNode.array.length - 1) {
        newNode.array.pop();
      } else {
        newNode.array[idx] = value;
      }
      return newNode;
    }
    function editableVNode(node, ownerID) {
      if (ownerID && node && ownerID === node.ownerID) {
        return node;
      }
      return new VNode(node ? node.array.slice() : [], ownerID);
    }
    function listNodeFor(list, rawIndex) {
      if (rawIndex >= getTailOffset(list._capacity)) {
        return list._tail;
      }
      if (rawIndex < 1 << (list._level + SHIFT)) {
        var node = list._root;
        var level = list._level;
        while (node && level > 0) {
          node = node.array[(rawIndex >>> level) & MASK];
          level -= SHIFT;
        }
        return node;
      }
    }
    function setListBounds(list, begin, end) {
      if (begin !== undefined) {
        begin = begin | 0;
      }
      if (end !== undefined) {
        end = end | 0;
      }
      var owner = list.__ownerID || new OwnerID();
      var oldOrigin = list._origin;
      var oldCapacity = list._capacity;
      var newOrigin = oldOrigin + begin;
      var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
      if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
        return list;
      }
      if (newOrigin >= newCapacity) {
        return list.clear();
      }
      var newLevel = list._level;
      var newRoot = list._root;
      var offsetShift = 0;
      while (newOrigin + offsetShift < 0) {
        newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
        newLevel += SHIFT;
        offsetShift += 1 << newLevel;
      }
      if (offsetShift) {
        newOrigin += offsetShift;
        oldOrigin += offsetShift;
        newCapacity += offsetShift;
        oldCapacity += offsetShift;
      }
      var oldTailOffset = getTailOffset(oldCapacity);
      var newTailOffset = getTailOffset(newCapacity);
      while (newTailOffset >= 1 << (newLevel + SHIFT)) {
        newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
        newLevel += SHIFT;
      }
      var oldTail = list._tail;
      var newTail = newTailOffset < oldTailOffset ? listNodeFor(list, newCapacity - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
      if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
        newRoot = editableVNode(newRoot, owner);
        var node = newRoot;
        for (var level = newLevel; level > SHIFT; level -= SHIFT) {
          var idx = (oldTailOffset >>> level) & MASK;
          node = node.array[idx] = editableVNode(node.array[idx], owner);
        }
        node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
      }
      if (newCapacity < oldCapacity) {
        newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
      }
      if (newOrigin >= newTailOffset) {
        newOrigin -= newTailOffset;
        newCapacity -= newTailOffset;
        newLevel = SHIFT;
        newRoot = null;
        newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
      } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
        offsetShift = 0;
        while (newRoot) {
          var beginIndex = (newOrigin >>> newLevel) & MASK;
          if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
            break;
          }
          if (beginIndex) {
            offsetShift += (1 << newLevel) * beginIndex;
          }
          newLevel -= SHIFT;
          newRoot = newRoot.array[beginIndex];
        }
        if (newRoot && newOrigin > oldOrigin) {
          newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
        }
        if (newRoot && newTailOffset < oldTailOffset) {
          newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
        }
        if (offsetShift) {
          newOrigin -= offsetShift;
          newCapacity -= offsetShift;
        }
      }
      if (list.__ownerID) {
        list.size = newCapacity - newOrigin;
        list._origin = newOrigin;
        list._capacity = newCapacity;
        list._level = newLevel;
        list._root = newRoot;
        list._tail = newTail;
        list.__hash = undefined;
        list.__altered = true;
        return list;
      }
      return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
    }
    function mergeIntoListWith(list, merger, iterables) {
      var iters = [];
      var maxSize = 0;
      for (var ii = 0; ii < iterables.length; ii++) {
        var value = iterables[ii];
        var iter = IndexedIterable(value);
        if (iter.size > maxSize) {
          maxSize = iter.size;
        }
        if (!isIterable(value)) {
          iter = iter.map(function(v) {
            return fromJS(v);
          });
        }
        iters.push(iter);
      }
      if (maxSize > list.size) {
        list = list.setSize(maxSize);
      }
      return mergeIntoCollectionWith(list, merger, iters);
    }
    function getTailOffset(size) {
      return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
    }
    createClass(OrderedMap, src_Map__Map);
    function OrderedMap(value) {
      return value === null || value === undefined ? emptyOrderedMap() : isOrderedMap(value) ? value : emptyOrderedMap().withMutations(function(map) {
        var iter = KeyedIterable(value);
        assertNotInfinite(iter.size);
        iter.forEach(function(v, k) {
          return map.set(k, v);
        });
      });
    }
    OrderedMap.of = function() {
      return this(arguments);
    };
    OrderedMap.prototype.toString = function() {
      return this.__toString('OrderedMap {', '}');
    };
    OrderedMap.prototype.get = function(k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };
    OrderedMap.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };
    OrderedMap.prototype.set = function(k, v) {
      return updateOrderedMap(this, k, v);
    };
    OrderedMap.prototype.remove = function(k) {
      return updateOrderedMap(this, k, NOT_SET);
    };
    OrderedMap.prototype.wasAltered = function() {
      return this._map.wasAltered() || this._list.wasAltered();
    };
    OrderedMap.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      return this._list.__iterate(function(entry) {
        return entry && fn(entry[1], entry[0], this$0);
      }, reverse);
    };
    OrderedMap.prototype.__iterator = function(type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };
    OrderedMap.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };
    function isOrderedMap(maybeOrderedMap) {
      return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
    }
    OrderedMap.isOrderedMap = isOrderedMap;
    OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
    OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
    function makeOrderedMap(map, list, ownerID, hash) {
      var omap = Object.create(OrderedMap.prototype);
      omap.size = map ? map.size : 0;
      omap._map = map;
      omap._list = list;
      omap.__ownerID = ownerID;
      omap.__hash = hash;
      return omap;
    }
    var EMPTY_ORDERED_MAP;
    function emptyOrderedMap() {
      return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
    }
    function updateOrderedMap(omap, k, v) {
      var map = omap._map;
      var list = omap._list;
      var i = map.get(k);
      var has = i !== undefined;
      var newMap;
      var newList;
      if (v === NOT_SET) {
        if (!has) {
          return omap;
        }
        if (list.size >= SIZE && list.size >= map.size * 2) {
          newList = list.filter(function(entry, idx) {
            return entry !== undefined && i !== idx;
          });
          newMap = newList.toKeyedSeq().map(function(entry) {
            return entry[0];
          }).flip().toMap();
          if (omap.__ownerID) {
            newMap.__ownerID = newList.__ownerID = omap.__ownerID;
          }
        } else {
          newMap = map.remove(k);
          newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
        }
      } else {
        if (has) {
          if (v === list.get(i)[1]) {
            return omap;
          }
          newMap = map;
          newList = list.set(i, [k, v]);
        } else {
          newMap = map.set(k, list.size);
          newList = list.set(list.size, [k, v]);
        }
      }
      if (omap.__ownerID) {
        omap.size = newMap.size;
        omap._map = newMap;
        omap._list = newList;
        omap.__hash = undefined;
        return omap;
      }
      return makeOrderedMap(newMap, newList);
    }
    createClass(Stack, IndexedCollection);
    function Stack(value) {
      return value === null || value === undefined ? emptyStack() : isStack(value) ? value : emptyStack().unshiftAll(value);
    }
    Stack.of = function() {
      return this(arguments);
    };
    Stack.prototype.toString = function() {
      return this.__toString('Stack [', ']');
    };
    Stack.prototype.get = function(index, notSetValue) {
      var head = this._head;
      index = wrapIndex(this, index);
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };
    Stack.prototype.peek = function() {
      return this._head && this._head.value;
    };
    Stack.prototype.push = function() {
      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments[ii],
          next: head
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };
    Stack.prototype.pushAll = function(iter) {
      iter = IndexedIterable(iter);
      if (iter.size === 0) {
        return this;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.reverse().forEach(function(value) {
        newSize++;
        head = {
          value: value,
          next: head
        };
      });
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };
    Stack.prototype.pop = function() {
      return this.slice(1);
    };
    Stack.prototype.unshift = function() {
      return this.push.apply(this, arguments);
    };
    Stack.prototype.unshiftAll = function(iter) {
      return this.pushAll(iter);
    };
    Stack.prototype.shift = function() {
      return this.pop.apply(this, arguments);
    };
    Stack.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };
    Stack.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };
    Stack.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };
    Stack.prototype.__iterate = function(fn, reverse) {
      if (reverse) {
        return this.reverse().__iterate(fn);
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };
    Stack.prototype.__iterator = function(type, reverse) {
      if (reverse) {
        return this.reverse().__iterator(type);
      }
      var iterations = 0;
      var node = this._head;
      return new src_Iterator__Iterator(function() {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };
    function isStack(maybeStack) {
      return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
    }
    Stack.isStack = isStack;
    var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';
    var StackPrototype = Stack.prototype;
    StackPrototype[IS_STACK_SENTINEL] = true;
    StackPrototype.withMutations = MapPrototype.withMutations;
    StackPrototype.asMutable = MapPrototype.asMutable;
    StackPrototype.asImmutable = MapPrototype.asImmutable;
    StackPrototype.wasAltered = MapPrototype.wasAltered;
    function makeStack(size, head, ownerID, hash) {
      var map = Object.create(StackPrototype);
      map.size = size;
      map._head = head;
      map.__ownerID = ownerID;
      map.__hash = hash;
      map.__altered = false;
      return map;
    }
    var EMPTY_STACK;
    function emptyStack() {
      return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
    }
    createClass(src_Set__Set, SetCollection);
    function src_Set__Set(value) {
      return value === null || value === undefined ? emptySet() : isSet(value) && !isOrdered(value) ? value : emptySet().withMutations(function(set) {
        var iter = SetIterable(value);
        assertNotInfinite(iter.size);
        iter.forEach(function(v) {
          return set.add(v);
        });
      });
    }
    src_Set__Set.of = function() {
      return this(arguments);
    };
    src_Set__Set.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };
    src_Set__Set.prototype.toString = function() {
      return this.__toString('Set {', '}');
    };
    src_Set__Set.prototype.has = function(value) {
      return this._map.has(value);
    };
    src_Set__Set.prototype.add = function(value) {
      return updateSet(this, this._map.set(value, true));
    };
    src_Set__Set.prototype.remove = function(value) {
      return updateSet(this, this._map.remove(value));
    };
    src_Set__Set.prototype.clear = function() {
      return updateSet(this, this._map.clear());
    };
    src_Set__Set.prototype.union = function() {
      var iters = SLICE$0.call(arguments, 0);
      iters = iters.filter(function(x) {
        return x.size !== 0;
      });
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function(set) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetIterable(iters[ii]).forEach(function(value) {
            return set.add(value);
          });
        }
      });
    };
    src_Set__Set.prototype.intersect = function() {
      var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter) {
        return SetIterable(iter);
      });
      var originalSet = this;
      return this.withMutations(function(set) {
        originalSet.forEach(function(value) {
          if (!iters.every(function(iter) {
            return iter.includes(value);
          })) {
            set.remove(value);
          }
        });
      });
    };
    src_Set__Set.prototype.subtract = function() {
      var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter) {
        return SetIterable(iter);
      });
      var originalSet = this;
      return this.withMutations(function(set) {
        originalSet.forEach(function(value) {
          if (iters.some(function(iter) {
            return iter.includes(value);
          })) {
            set.remove(value);
          }
        });
      });
    };
    src_Set__Set.prototype.merge = function() {
      return this.union.apply(this, arguments);
    };
    src_Set__Set.prototype.mergeWith = function(merger) {
      var iters = SLICE$0.call(arguments, 1);
      return this.union.apply(this, iters);
    };
    src_Set__Set.prototype.sort = function(comparator) {
      return OrderedSet(sortFactory(this, comparator));
    };
    src_Set__Set.prototype.sortBy = function(mapper, comparator) {
      return OrderedSet(sortFactory(this, comparator, mapper));
    };
    src_Set__Set.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };
    src_Set__Set.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      return this._map.__iterate(function(_, k) {
        return fn(k, k, this$0);
      }, reverse);
    };
    src_Set__Set.prototype.__iterator = function(type, reverse) {
      return this._map.map(function(_, k) {
        return k;
      }).__iterator(type, reverse);
    };
    src_Set__Set.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };
    function isSet(maybeSet) {
      return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
    }
    src_Set__Set.isSet = isSet;
    var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';
    var SetPrototype = src_Set__Set.prototype;
    SetPrototype[IS_SET_SENTINEL] = true;
    SetPrototype[DELETE] = SetPrototype.remove;
    SetPrototype.mergeDeep = SetPrototype.merge;
    SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
    SetPrototype.withMutations = MapPrototype.withMutations;
    SetPrototype.asMutable = MapPrototype.asMutable;
    SetPrototype.asImmutable = MapPrototype.asImmutable;
    SetPrototype.__empty = emptySet;
    SetPrototype.__make = makeSet;
    function updateSet(set, newMap) {
      if (set.__ownerID) {
        set.size = newMap.size;
        set._map = newMap;
        return set;
      }
      return newMap === set._map ? set : newMap.size === 0 ? set.__empty() : set.__make(newMap);
    }
    function makeSet(map, ownerID) {
      var set = Object.create(SetPrototype);
      set.size = map ? map.size : 0;
      set._map = map;
      set.__ownerID = ownerID;
      return set;
    }
    var EMPTY_SET;
    function emptySet() {
      return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
    }
    createClass(OrderedSet, src_Set__Set);
    function OrderedSet(value) {
      return value === null || value === undefined ? emptyOrderedSet() : isOrderedSet(value) ? value : emptyOrderedSet().withMutations(function(set) {
        var iter = SetIterable(value);
        assertNotInfinite(iter.size);
        iter.forEach(function(v) {
          return set.add(v);
        });
      });
    }
    OrderedSet.of = function() {
      return this(arguments);
    };
    OrderedSet.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };
    OrderedSet.prototype.toString = function() {
      return this.__toString('OrderedSet {', '}');
    };
    function isOrderedSet(maybeOrderedSet) {
      return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
    }
    OrderedSet.isOrderedSet = isOrderedSet;
    var OrderedSetPrototype = OrderedSet.prototype;
    OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;
    OrderedSetPrototype.__empty = emptyOrderedSet;
    OrderedSetPrototype.__make = makeOrderedSet;
    function makeOrderedSet(map, ownerID) {
      var set = Object.create(OrderedSetPrototype);
      set.size = map ? map.size : 0;
      set._map = map;
      set.__ownerID = ownerID;
      return set;
    }
    var EMPTY_ORDERED_SET;
    function emptyOrderedSet() {
      return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
    }
    createClass(Record, KeyedCollection);
    function Record(defaultValues, name) {
      var hasInitialized;
      var RecordType = function Record(values) {
        if (values instanceof RecordType) {
          return values;
        }
        if (!(this instanceof RecordType)) {
          return new RecordType(values);
        }
        if (!hasInitialized) {
          hasInitialized = true;
          var keys = Object.keys(defaultValues);
          setProps(RecordTypePrototype, keys);
          RecordTypePrototype.size = keys.length;
          RecordTypePrototype._name = name;
          RecordTypePrototype._keys = keys;
          RecordTypePrototype._defaultValues = defaultValues;
        }
        this._map = src_Map__Map(values);
      };
      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;
      return RecordType;
    }
    Record.prototype.toString = function() {
      return this.__toString(recordName(this) + ' {', '}');
    };
    Record.prototype.has = function(k) {
      return this._defaultValues.hasOwnProperty(k);
    };
    Record.prototype.get = function(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var defaultVal = this._defaultValues[k];
      return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };
    Record.prototype.clear = function() {
      if (this.__ownerID) {
        this._map && this._map.clear();
        return this;
      }
      var RecordType = this.constructor;
      return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
    };
    Record.prototype.set = function(k, v) {
      if (!this.has(k)) {
        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
      }
      var newMap = this._map && this._map.set(k, v);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };
    Record.prototype.remove = function(k) {
      if (!this.has(k)) {
        return this;
      }
      var newMap = this._map && this._map.remove(k);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };
    Record.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };
    Record.prototype.__iterator = function(type, reverse) {
      var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k) {
        return this$0.get(k);
      }).__iterator(type, reverse);
    };
    Record.prototype.__iterate = function(fn, reverse) {
      var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k) {
        return this$0.get(k);
      }).__iterate(fn, reverse);
    };
    Record.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map && this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return makeRecord(this, newMap, ownerID);
    };
    var RecordPrototype = Record.prototype;
    RecordPrototype[DELETE] = RecordPrototype.remove;
    RecordPrototype.deleteIn = RecordPrototype.removeIn = MapPrototype.removeIn;
    RecordPrototype.merge = MapPrototype.merge;
    RecordPrototype.mergeWith = MapPrototype.mergeWith;
    RecordPrototype.mergeIn = MapPrototype.mergeIn;
    RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
    RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
    RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
    RecordPrototype.setIn = MapPrototype.setIn;
    RecordPrototype.update = MapPrototype.update;
    RecordPrototype.updateIn = MapPrototype.updateIn;
    RecordPrototype.withMutations = MapPrototype.withMutations;
    RecordPrototype.asMutable = MapPrototype.asMutable;
    RecordPrototype.asImmutable = MapPrototype.asImmutable;
    function makeRecord(likeRecord, map, ownerID) {
      var record = Object.create(Object.getPrototypeOf(likeRecord));
      record._map = map;
      record.__ownerID = ownerID;
      return record;
    }
    function recordName(record) {
      return record._name || record.constructor.name || 'Record';
    }
    function setProps(prototype, names) {
      try {
        names.forEach(setProp.bind(undefined, prototype));
      } catch (error) {}
    }
    function setProp(prototype, name) {
      Object.defineProperty(prototype, name, {
        get: function() {
          return this.get(name);
        },
        set: function(value) {
          invariant(this.__ownerID, 'Cannot set on an immutable record.');
          this.set(name, value);
        }
      });
    }
    function deepEqual(a, b) {
      if (a === b) {
        return true;
      }
      if (!isIterable(b) || a.size !== undefined && b.size !== undefined && a.size !== b.size || a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash || isKeyed(a) !== isKeyed(b) || isIndexed(a) !== isIndexed(b) || isOrdered(a) !== isOrdered(b)) {
        return false;
      }
      if (a.size === 0 && b.size === 0) {
        return true;
      }
      var notAssociative = !isAssociative(a);
      if (isOrdered(a)) {
        var entries = a.entries();
        return b.every(function(v, k) {
          var entry = entries.next().value;
          return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
        }) && entries.next().done;
      }
      var flipped = false;
      if (a.size === undefined) {
        if (b.size === undefined) {
          if (typeof a.cacheResult === 'function') {
            a.cacheResult();
          }
        } else {
          flipped = true;
          var _ = a;
          a = b;
          b = _;
        }
      }
      var allEqual = true;
      var bSize = b.__iterate(function(v, k) {
        if (notAssociative ? !a.has(v) : flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
          allEqual = false;
          return false;
        }
      });
      return allEqual && a.size === bSize;
    }
    createClass(Range, IndexedSeq);
    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }
    Range.prototype.toString = function() {
      if (this.size === 0) {
        return 'Range []';
      }
      return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
    };
    Range.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._start + wrapIndex(this, index) * this._step : notSetValue;
    };
    Range.prototype.includes = function(searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);
    };
    Range.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };
    Range.prototype.indexOf = function(searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index;
        }
      }
      return -1;
    };
    Range.prototype.lastIndexOf = function(searchValue) {
      return this.indexOf(searchValue);
    };
    Range.prototype.__iterate = function(fn, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(value, ii, this) === false) {
          return ii + 1;
        }
        value += reverse ? -step : step;
      }
      return ii;
    };
    Range.prototype.__iterator = function(type, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      var ii = 0;
      return new src_Iterator__Iterator(function() {
        var v = value;
        value += reverse ? -step : step;
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
      });
    };
    Range.prototype.equals = function(other) {
      return other instanceof Range ? this._start === other._start && this._end === other._end && this._step === other._step : deepEqual(this, other);
    };
    var EMPTY_RANGE;
    createClass(Repeat, IndexedSeq);
    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }
    Repeat.prototype.toString = function() {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };
    Repeat.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };
    Repeat.prototype.includes = function(searchValue) {
      return is(this._value, searchValue);
    };
    Repeat.prototype.slice = function(begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size) ? this : new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };
    Repeat.prototype.reverse = function() {
      return this;
    };
    Repeat.prototype.indexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };
    Repeat.prototype.lastIndexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };
    Repeat.prototype.__iterate = function(fn, reverse) {
      for (var ii = 0; ii < this.size; ii++) {
        if (fn(this._value, ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };
    Repeat.prototype.__iterator = function(type, reverse) {
      var this$0 = this;
      var ii = 0;
      return new src_Iterator__Iterator(function() {
        return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone();
      });
    };
    Repeat.prototype.equals = function(other) {
      return other instanceof Repeat ? is(this._value, other._value) : deepEqual(other);
    };
    var EMPTY_REPEAT;
    function mixin(ctor, methods) {
      var keyCopier = function(key) {
        ctor.prototype[key] = methods[key];
      };
      Object.keys(methods).forEach(keyCopier);
      Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(methods).forEach(keyCopier);
      return ctor;
    }
    Iterable.Iterator = src_Iterator__Iterator;
    mixin(Iterable, {
      toArray: function() {
        assertNotInfinite(this.size);
        var array = new Array(this.size || 0);
        this.valueSeq().__iterate(function(v, i) {
          array[i] = v;
        });
        return array;
      },
      toIndexedSeq: function() {
        return new ToIndexedSequence(this);
      },
      toJS: function() {
        return this.toSeq().map(function(value) {
          return value && typeof value.toJS === 'function' ? value.toJS() : value;
        }).__toJS();
      },
      toJSON: function() {
        return this.toSeq().map(function(value) {
          return value && typeof value.toJSON === 'function' ? value.toJSON() : value;
        }).__toJS();
      },
      toKeyedSeq: function() {
        return new ToKeyedSequence(this, true);
      },
      toMap: function() {
        return src_Map__Map(this.toKeyedSeq());
      },
      toObject: function() {
        assertNotInfinite(this.size);
        var object = {};
        this.__iterate(function(v, k) {
          object[k] = v;
        });
        return object;
      },
      toOrderedMap: function() {
        return OrderedMap(this.toKeyedSeq());
      },
      toOrderedSet: function() {
        return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
      },
      toSet: function() {
        return src_Set__Set(isKeyed(this) ? this.valueSeq() : this);
      },
      toSetSeq: function() {
        return new ToSetSequence(this);
      },
      toSeq: function() {
        return isIndexed(this) ? this.toIndexedSeq() : isKeyed(this) ? this.toKeyedSeq() : this.toSetSeq();
      },
      toStack: function() {
        return Stack(isKeyed(this) ? this.valueSeq() : this);
      },
      toList: function() {
        return List(isKeyed(this) ? this.valueSeq() : this);
      },
      toString: function() {
        return '[Iterable]';
      },
      __toString: function(head, tail) {
        if (this.size === 0) {
          return head + tail;
        }
        return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
      },
      concat: function() {
        var values = SLICE$0.call(arguments, 0);
        return reify(this, concatFactory(this, values));
      },
      includes: function(searchValue) {
        return this.some(function(value) {
          return is(value, searchValue);
        });
      },
      entries: function() {
        return this.__iterator(ITERATE_ENTRIES);
      },
      every: function(predicate, context) {
        assertNotInfinite(this.size);
        var returnValue = true;
        this.__iterate(function(v, k, c) {
          if (!predicate.call(context, v, k, c)) {
            returnValue = false;
            return false;
          }
        });
        return returnValue;
      },
      filter: function(predicate, context) {
        return reify(this, filterFactory(this, predicate, context, true));
      },
      find: function(predicate, context, notSetValue) {
        var entry = this.findEntry(predicate, context);
        return entry ? entry[1] : notSetValue;
      },
      findEntry: function(predicate, context) {
        var found;
        this.__iterate(function(v, k, c) {
          if (predicate.call(context, v, k, c)) {
            found = [k, v];
            return false;
          }
        });
        return found;
      },
      findLastEntry: function(predicate, context) {
        return this.toSeq().reverse().findEntry(predicate, context);
      },
      forEach: function(sideEffect, context) {
        assertNotInfinite(this.size);
        return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
      },
      join: function(separator) {
        assertNotInfinite(this.size);
        separator = separator !== undefined ? '' + separator : ',';
        var joined = '';
        var isFirst = true;
        this.__iterate(function(v) {
          isFirst ? (isFirst = false) : (joined += separator);
          joined += v !== null && v !== undefined ? v.toString() : '';
        });
        return joined;
      },
      keys: function() {
        return this.__iterator(ITERATE_KEYS);
      },
      map: function(mapper, context) {
        return reify(this, mapFactory(this, mapper, context));
      },
      reduce: function(reducer, initialReduction, context) {
        assertNotInfinite(this.size);
        var reduction;
        var useFirst;
        if (arguments.length < 2) {
          useFirst = true;
        } else {
          reduction = initialReduction;
        }
        this.__iterate(function(v, k, c) {
          if (useFirst) {
            useFirst = false;
            reduction = v;
          } else {
            reduction = reducer.call(context, reduction, v, k, c);
          }
        });
        return reduction;
      },
      reduceRight: function(reducer, initialReduction, context) {
        var reversed = this.toKeyedSeq().reverse();
        return reversed.reduce.apply(reversed, arguments);
      },
      reverse: function() {
        return reify(this, reverseFactory(this, true));
      },
      slice: function(begin, end) {
        return reify(this, sliceFactory(this, begin, end, true));
      },
      some: function(predicate, context) {
        return !this.every(not(predicate), context);
      },
      sort: function(comparator) {
        return reify(this, sortFactory(this, comparator));
      },
      values: function() {
        return this.__iterator(ITERATE_VALUES);
      },
      butLast: function() {
        return this.slice(0, -1);
      },
      isEmpty: function() {
        return this.size !== undefined ? this.size === 0 : !this.some(function() {
          return true;
        });
      },
      count: function(predicate, context) {
        return ensureSize(predicate ? this.toSeq().filter(predicate, context) : this);
      },
      countBy: function(grouper, context) {
        return countByFactory(this, grouper, context);
      },
      equals: function(other) {
        return deepEqual(this, other);
      },
      entrySeq: function() {
        var iterable = this;
        if (iterable._cache) {
          return new ArraySeq(iterable._cache);
        }
        var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
        entriesSequence.fromEntrySeq = function() {
          return iterable.toSeq();
        };
        return entriesSequence;
      },
      filterNot: function(predicate, context) {
        return this.filter(not(predicate), context);
      },
      findLast: function(predicate, context, notSetValue) {
        return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
      },
      first: function() {
        return this.find(returnTrue);
      },
      flatMap: function(mapper, context) {
        return reify(this, flatMapFactory(this, mapper, context));
      },
      flatten: function(depth) {
        return reify(this, flattenFactory(this, depth, true));
      },
      fromEntrySeq: function() {
        return new FromEntriesSequence(this);
      },
      get: function(searchKey, notSetValue) {
        return this.find(function(_, key) {
          return is(key, searchKey);
        }, undefined, notSetValue);
      },
      getIn: function(searchKeyPath, notSetValue) {
        var nested = this;
        var iter = forceIterator(searchKeyPath);
        var step;
        while (!(step = iter.next()).done) {
          var key = step.value;
          nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
          if (nested === NOT_SET) {
            return notSetValue;
          }
        }
        return nested;
      },
      groupBy: function(grouper, context) {
        return groupByFactory(this, grouper, context);
      },
      has: function(searchKey) {
        return this.get(searchKey, NOT_SET) !== NOT_SET;
      },
      hasIn: function(searchKeyPath) {
        return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
      },
      isSubset: function(iter) {
        iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
        return this.every(function(value) {
          return iter.includes(value);
        });
      },
      isSuperset: function(iter) {
        iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
        return iter.isSubset(this);
      },
      keySeq: function() {
        return this.toSeq().map(keyMapper).toIndexedSeq();
      },
      last: function() {
        return this.toSeq().reverse().first();
      },
      max: function(comparator) {
        return maxFactory(this, comparator);
      },
      maxBy: function(mapper, comparator) {
        return maxFactory(this, comparator, mapper);
      },
      min: function(comparator) {
        return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
      },
      minBy: function(mapper, comparator) {
        return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
      },
      rest: function() {
        return this.slice(1);
      },
      skip: function(amount) {
        return this.slice(Math.max(0, amount));
      },
      skipLast: function(amount) {
        return reify(this, this.toSeq().reverse().skip(amount).reverse());
      },
      skipWhile: function(predicate, context) {
        return reify(this, skipWhileFactory(this, predicate, context, true));
      },
      skipUntil: function(predicate, context) {
        return this.skipWhile(not(predicate), context);
      },
      sortBy: function(mapper, comparator) {
        return reify(this, sortFactory(this, comparator, mapper));
      },
      take: function(amount) {
        return this.slice(0, Math.max(0, amount));
      },
      takeLast: function(amount) {
        return reify(this, this.toSeq().reverse().take(amount).reverse());
      },
      takeWhile: function(predicate, context) {
        return reify(this, takeWhileFactory(this, predicate, context));
      },
      takeUntil: function(predicate, context) {
        return this.takeWhile(not(predicate), context);
      },
      valueSeq: function() {
        return this.toIndexedSeq();
      },
      hashCode: function() {
        return this.__hash || (this.__hash = hashIterable(this));
      }
    });
    var IterablePrototype = Iterable.prototype;
    IterablePrototype[IS_ITERABLE_SENTINEL] = true;
    IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
    IterablePrototype.__toJS = IterablePrototype.toArray;
    IterablePrototype.__toStringMapper = quoteString;
    IterablePrototype.inspect = IterablePrototype.toSource = function() {
      return this.toString();
    };
    IterablePrototype.chain = IterablePrototype.flatMap;
    IterablePrototype.contains = IterablePrototype.includes;
    (function() {
      try {
        Object.defineProperty(IterablePrototype, 'length', {get: function() {
            if (!Iterable.noLengthWarning) {
              var stack;
              try {
                throw new Error();
              } catch (error) {
                stack = error.stack;
              }
              if (stack.indexOf('_wrapObject') === -1) {
                console && console.warn && console.warn('iterable.length has been deprecated, ' + 'use iterable.size or iterable.count(). ' + 'This warning will become a silent error in a future version. ' + stack);
                return this.size;
              }
            }
          }});
      } catch (e) {}
    })();
    mixin(KeyedIterable, {
      flip: function() {
        return reify(this, flipFactory(this));
      },
      findKey: function(predicate, context) {
        var entry = this.findEntry(predicate, context);
        return entry && entry[0];
      },
      findLastKey: function(predicate, context) {
        return this.toSeq().reverse().findKey(predicate, context);
      },
      keyOf: function(searchValue) {
        return this.findKey(function(value) {
          return is(value, searchValue);
        });
      },
      lastKeyOf: function(searchValue) {
        return this.findLastKey(function(value) {
          return is(value, searchValue);
        });
      },
      mapEntries: function(mapper, context) {
        var this$0 = this;
        var iterations = 0;
        return reify(this, this.toSeq().map(function(v, k) {
          return mapper.call(context, [k, v], iterations++, this$0);
        }).fromEntrySeq());
      },
      mapKeys: function(mapper, context) {
        var this$0 = this;
        return reify(this, this.toSeq().flip().map(function(k, v) {
          return mapper.call(context, k, v, this$0);
        }).flip());
      }
    });
    var KeyedIterablePrototype = KeyedIterable.prototype;
    KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
    KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
    KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
    KeyedIterablePrototype.__toStringMapper = function(v, k) {
      return JSON.stringify(k) + ': ' + quoteString(v);
    };
    mixin(IndexedIterable, {
      toKeyedSeq: function() {
        return new ToKeyedSequence(this, false);
      },
      filter: function(predicate, context) {
        return reify(this, filterFactory(this, predicate, context, false));
      },
      findIndex: function(predicate, context) {
        var entry = this.findEntry(predicate, context);
        return entry ? entry[0] : -1;
      },
      indexOf: function(searchValue) {
        var key = this.toKeyedSeq().keyOf(searchValue);
        return key === undefined ? -1 : key;
      },
      lastIndexOf: function(searchValue) {
        return this.toSeq().reverse().indexOf(searchValue);
      },
      reverse: function() {
        return reify(this, reverseFactory(this, false));
      },
      slice: function(begin, end) {
        return reify(this, sliceFactory(this, begin, end, false));
      },
      splice: function(index, removeNum) {
        var numArgs = arguments.length;
        removeNum = Math.max(removeNum | 0, 0);
        if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
          return this;
        }
        index = resolveBegin(index, index < 0 ? this.count() : this.size);
        var spliced = this.slice(0, index);
        return reify(this, numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));
      },
      findLastIndex: function(predicate, context) {
        var key = this.toKeyedSeq().findLastKey(predicate, context);
        return key === undefined ? -1 : key;
      },
      first: function() {
        return this.get(0);
      },
      flatten: function(depth) {
        return reify(this, flattenFactory(this, depth, false));
      },
      get: function(index, notSetValue) {
        index = wrapIndex(this, index);
        return (index < 0 || (this.size === Infinity || (this.size !== undefined && index > this.size))) ? notSetValue : this.find(function(_, key) {
          return key === index;
        }, undefined, notSetValue);
      },
      has: function(index) {
        index = wrapIndex(this, index);
        return index >= 0 && (this.size !== undefined ? this.size === Infinity || index < this.size : this.indexOf(index) !== -1);
      },
      interpose: function(separator) {
        return reify(this, interposeFactory(this, separator));
      },
      interleave: function() {
        var iterables = [this].concat(arrCopy(arguments));
        var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
        var interleaved = zipped.flatten(true);
        if (zipped.size) {
          interleaved.size = zipped.size * iterables.length;
        }
        return reify(this, interleaved);
      },
      last: function() {
        return this.get(-1);
      },
      skipWhile: function(predicate, context) {
        return reify(this, skipWhileFactory(this, predicate, context, false));
      },
      zip: function() {
        var iterables = [this].concat(arrCopy(arguments));
        return reify(this, zipWithFactory(this, defaultZipper, iterables));
      },
      zipWith: function(zipper) {
        var iterables = arrCopy(arguments);
        iterables[0] = this;
        return reify(this, zipWithFactory(this, zipper, iterables));
      }
    });
    IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
    IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;
    mixin(SetIterable, {
      get: function(value, notSetValue) {
        return this.has(value) ? value : notSetValue;
      },
      includes: function(value) {
        return this.has(value);
      },
      keySeq: function() {
        return this.valueSeq();
      }
    });
    SetIterable.prototype.has = IterablePrototype.includes;
    mixin(KeyedSeq, KeyedIterable.prototype);
    mixin(IndexedSeq, IndexedIterable.prototype);
    mixin(SetSeq, SetIterable.prototype);
    mixin(KeyedCollection, KeyedIterable.prototype);
    mixin(IndexedCollection, IndexedIterable.prototype);
    mixin(SetCollection, SetIterable.prototype);
    function keyMapper(v, k) {
      return k;
    }
    function entryMapper(v, k) {
      return [k, v];
    }
    function not(predicate) {
      return function() {
        return !predicate.apply(this, arguments);
      };
    }
    function neg(predicate) {
      return function() {
        return -predicate.apply(this, arguments);
      };
    }
    function quoteString(value) {
      return typeof value === 'string' ? JSON.stringify(value) : value;
    }
    function defaultZipper() {
      return arrCopy(arguments);
    }
    function defaultNegComparator(a, b) {
      return a < b ? 1 : a > b ? -1 : 0;
    }
    function hashIterable(iterable) {
      if (iterable.size === Infinity) {
        return 0;
      }
      var ordered = isOrdered(iterable);
      var keyed = isKeyed(iterable);
      var h = ordered ? 1 : 0;
      var size = iterable.__iterate(keyed ? ordered ? function(v, k) {
        h = 31 * h + hashMerge(hash(v), hash(k)) | 0;
      } : function(v, k) {
        h = h + hashMerge(hash(v), hash(k)) | 0;
      } : ordered ? function(v) {
        h = 31 * h + hash(v) | 0;
      } : function(v) {
        h = h + hash(v) | 0;
      });
      return murmurHashOfSize(size, h);
    }
    function murmurHashOfSize(size, h) {
      h = src_Math__imul(h, 0xCC9E2D51);
      h = src_Math__imul(h << 15 | h >>> -15, 0x1B873593);
      h = src_Math__imul(h << 13 | h >>> -13, 5);
      h = (h + 0xE6546B64 | 0) ^ size;
      h = src_Math__imul(h ^ h >>> 16, 0x85EBCA6B);
      h = src_Math__imul(h ^ h >>> 13, 0xC2B2AE35);
      h = smi(h ^ h >>> 16);
      return h;
    }
    function hashMerge(a, b) {
      return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0;
    }
    var Immutable = {
      Iterable: Iterable,
      Seq: Seq,
      Collection: Collection,
      Map: src_Map__Map,
      OrderedMap: OrderedMap,
      List: List,
      Stack: Stack,
      Set: src_Set__Set,
      OrderedSet: OrderedSet,
      Record: Record,
      Range: Range,
      Repeat: Repeat,
      is: is,
      fromJS: fromJS
    };
    return Immutable;
  }));
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.shared", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      SHARED = '__core-js_shared__',
      store = $.g[SHARED] || ($.g[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.uid", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var sid = 0;
  function uid(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
  }
  uid.safe = require("npm:core-js@0.9.18/library/modules/$").g.Symbol || uid;
  module.exports = uid;
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.redef", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:core-js@0.9.18/library/modules/$").hide;
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.keyof", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$");
  module.exports = function(object, el) {
    var O = $.toObject(object),
        keys = $.getKeys(O),
        length = keys.length,
        index = 0,
        key;
    while (length > index)
      if (O[key = keys[index++]] === el)
        return key;
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.enum-keys", ["npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$");
  module.exports = function(it) {
    var keys = $.getKeys(it),
        getDesc = $.getDesc,
        getSymbols = $.getSymbols;
    if (getSymbols)
      $.each.call(getSymbols(it), function(key) {
        if (getDesc(it, key).enumerable)
          keys.push(key);
      });
    return keys;
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:classnames@2.1.5/index", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function() {
    'use strict';
    var hasOwn = {}.hasOwnProperty;
    function classNames() {
      var classes = '';
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!arg)
          continue;
        var argType = typeof arg;
        if (argType === 'string' || argType === 'number') {
          classes += ' ' + arg;
        } else if (Array.isArray(arg)) {
          classes += ' ' + classNames.apply(null, arg);
        } else if (argType === 'object') {
          for (var key in arg) {
            if (hasOwn.call(arg, key) && arg[key]) {
              classes += ' ' + key;
            }
          }
        }
      }
      return classes.substr(1);
    }
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = classNames;
    } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
      define('classnames', function() {
        return classNames;
      });
    } else {
      window.classNames = classNames;
    }
  }());
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseFlatten", ["npm:lodash@3.10.1/internal/arrayPush", "npm:lodash@3.10.1/lang/isArguments", "npm:lodash@3.10.1/lang/isArray", "npm:lodash@3.10.1/internal/isArrayLike", "npm:lodash@3.10.1/internal/isObjectLike"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var arrayPush = require("npm:lodash@3.10.1/internal/arrayPush"),
      isArguments = require("npm:lodash@3.10.1/lang/isArguments"),
      isArray = require("npm:lodash@3.10.1/lang/isArray"),
      isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike"),
      isObjectLike = require("npm:lodash@3.10.1/internal/isObjectLike");
  function baseFlatten(array, isDeep, isStrict, result) {
    result || (result = []);
    var index = -1,
        length = array.length;
    while (++index < length) {
      var value = array[index];
      if (isObjectLike(value) && isArrayLike(value) && (isStrict || isArray(value) || isArguments(value))) {
        if (isDeep) {
          baseFlatten(value, isDeep, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  module.exports = baseFlatten;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/mapDelete", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function mapDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }
  module.exports = mapDelete;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/mapGet", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function mapGet(key) {
    return key == '__proto__' ? undefined : this.__data__[key];
  }
  module.exports = mapGet;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/mapHas", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function mapHas(key) {
    return key != '__proto__' && hasOwnProperty.call(this.__data__, key);
  }
  module.exports = mapHas;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/mapSet", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function mapSet(key, value) {
    if (key != '__proto__') {
      this.__data__[key] = value;
    }
    return this;
  }
  module.exports = mapSet;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/createMonotonicInterpolant", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = createMonotonicInterpolant;
  function createMonotonicInterpolant(xs, ys) {
    var length = xs.length;
    var indexes = [];
    for (var i = 0; i < length; i++) {
      indexes.push(i);
    }
    indexes.sort(function(a, b) {
      return xs[a] < xs[b] ? -1 : 1;
    });
    var oldXs = xs,
        oldYs = ys;
    xs = [];
    ys = [];
    for (var i = 0; i < length; i++) {
      xs.push(+oldXs[indexes[i]]);
      ys.push(+oldYs[indexes[i]]);
    }
    var dys = [];
    var dxs = [];
    var ms = [];
    var dx = undefined,
        dy = undefined;
    for (var i = 0; i < length - 1; i++) {
      dx = xs[i + 1] - xs[i];
      dy = ys[i + 1] - ys[i];
      dxs.push(dx);
      dys.push(dy);
      ms.push(dy / dx);
    }
    var c1s = [ms[0]];
    for (var i = 0; i < dxs.length - 1; i++) {
      var _m = ms[i];
      var mNext = ms[i + 1];
      if (_m * mNext <= 0) {
        c1s.push(0);
      } else {
        dx = dxs[i];
        var dxNext = dxs[i + 1];
        var common = dx + dxNext;
        c1s.push(3 * common / ((common + dxNext) / _m + (common + dx) / mNext));
      }
    }
    c1s.push(ms[ms.length - 1]);
    var c2s = [];
    var c3s = [];
    var m = undefined;
    for (var i = 0; i < c1s.length - 1; i++) {
      m = ms[i];
      var c1 = c1s[i];
      var invDx = 1 / dxs[i];
      var common = c1 + c1s[i + 1] - m - m;
      c2s.push((m - c1 - common) * invDx);
      c3s.push(common * invDx * invDx);
    }
    return function(x) {
      var i = xs.length - 1;
      if (x === xs[i]) {
        return ys[i];
      }
      var low = 0;
      var high = c3s.length - 1;
      var mid = undefined;
      while (low <= high) {
        mid = Math.floor(0.5 * (low + high));
        var xHere = xs[mid];
        if (xHere < x) {
          low = mid + 1;
        } else if (xHere > x) {
          high = mid - 1;
        } else {
          return ys[mid];
        }
      }
      i = Math.max(0, high);
      var diff = x - xs[i],
          diffSq = diff * diff;
      return ys[i] + c1s[i] * diff + c2s[i] * diffSq + c3s[i] * diff * diffSq;
    };
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/shimKeys", ["npm:lodash@3.10.1/lang/isArguments", "npm:lodash@3.10.1/lang/isArray", "npm:lodash@3.10.1/internal/isIndex", "npm:lodash@3.10.1/internal/isLength", "npm:lodash@3.10.1/object/keysIn"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isArguments = require("npm:lodash@3.10.1/lang/isArguments"),
      isArray = require("npm:lodash@3.10.1/lang/isArray"),
      isIndex = require("npm:lodash@3.10.1/internal/isIndex"),
      isLength = require("npm:lodash@3.10.1/internal/isLength"),
      keysIn = require("npm:lodash@3.10.1/object/keysIn");
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function shimKeys(object) {
    var props = keysIn(object),
        propsLength = props.length,
        length = propsLength && object.length;
    var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object));
    var index = -1,
        result = [];
    while (++index < propsLength) {
      var key = props[index];
      if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = shimKeys;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseCopy", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function baseCopy(source, props, object) {
    object || (object = {});
    var index = -1,
        length = props.length;
    while (++index < length) {
      var key = props[index];
      object[key] = source[key];
    }
    return object;
  }
  module.exports = baseCopy;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/utility/identity", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function identity(value) {
    return value;
  }
  module.exports = identity;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/isIterateeCall", ["npm:lodash@3.10.1/internal/isArrayLike", "npm:lodash@3.10.1/internal/isIndex", "npm:lodash@3.10.1/lang/isObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike"),
      isIndex = require("npm:lodash@3.10.1/internal/isIndex"),
      isObject = require("npm:lodash@3.10.1/lang/isObject");
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number' ? (isArrayLike(object) && isIndex(index, object.length)) : (type == 'string' && index in object)) {
      var other = object[index];
      return value === value ? (value === other) : (other !== other);
    }
    return false;
  }
  module.exports = isIterateeCall;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/assignDefaults", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function assignDefaults(objectValue, sourceValue) {
    return objectValue === undefined ? sourceValue : objectValue;
  }
  module.exports = assignDefaults;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/createDefaults", ["npm:lodash@3.10.1/function/restParam"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var restParam = require("npm:lodash@3.10.1/function/restParam");
  function createDefaults(assigner, customizer) {
    return restParam(function(args) {
      var object = args[0];
      if (object == null) {
        return object;
      }
      args.push(customizer);
      return assigner.apply(undefined, args);
    });
  }
  module.exports = createDefaults;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/utils/createStoreShape", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = createStoreShape;
  function createStoreShape(PropTypes) {
    return PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    });
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/utils/shallowEqual", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = shallowEqual;
  function shallowEqual(objA, objB) {
    if (objA === objB) {
      return true;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var i = 0; i < keysA.length; i++) {
      if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        return false;
      }
    }
    return true;
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/utils/isPlainObject", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = isPlainObject;
  var fnToString = function fnToString(fn) {
    return Function.prototype.toString.call(fn);
  };
  function isPlainObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    var proto = typeof obj.constructor === 'function' ? Object.getPrototypeOf(obj) : Object.prototype;
    if (proto === null) {
      return true;
    }
    var constructor = proto.constructor;
    return typeof constructor === 'function' && constructor instanceof constructor && fnToString(constructor) === fnToString(Object);
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/mapValues", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = mapValues;
  function mapValues(obj, fn) {
    return Object.keys(obj).reduce(function(result, key) {
      result[key] = fn(obj[key], key);
      return result;
    }, {});
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/pick", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = pick;
  function pick(obj, fn) {
    return Object.keys(obj).reduce(function(result, key) {
      if (fn(obj[key])) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/bindActionCreators", ["npm:redux@3.0.2/lib/utils/mapValues"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = bindActionCreators;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _utilsMapValues = require("npm:redux@3.0.2/lib/utils/mapValues");
  var _utilsMapValues2 = _interopRequireDefault(_utilsMapValues);
  function bindActionCreator(actionCreator, dispatch) {
    return function() {
      return dispatch(actionCreator.apply(undefined, arguments));
    };
  }
  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }
    if (typeof actionCreators !== 'object' || actionCreators === null || actionCreators === undefined) {
      throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
    }
    return _utilsMapValues2['default'](actionCreators, function(actionCreator) {
      return bindActionCreator(actionCreator, dispatch);
    });
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/compose", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.__esModule = true;
  exports["default"] = compose;
  function compose() {
    for (var _len = arguments.length,
        funcs = Array(_len),
        _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }
    return function(arg) {
      return funcs.reduceRight(function(composed, f) {
        return f(composed);
      }, arg);
    };
  }
  module.exports = exports["default"];
  global.define = __define;
  return module.exports;
});

System.register("npm:hoist-non-react-statics@1.0.3/index", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };
  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    arguments: true,
    arity: true
  };
  module.exports = function hoistNonReactStatics(targetComponent, sourceComponent) {
    var keys = Object.getOwnPropertyNames(sourceComponent);
    for (var i = 0; i < keys.length; ++i) {
      if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]]) {
        targetComponent[keys[i]] = sourceComponent[keys[i]];
      }
    }
    return targetComponent;
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:process@0.11.2", ["npm:process@0.11.2/browser"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:process@0.11.2/browser");
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactMultiChildUpdateTypes", ["npm:fbjs@0.3.1/lib/keyMirror"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var keyMirror = require("npm:fbjs@0.3.1/lib/keyMirror");
  var ReactMultiChildUpdateTypes = keyMirror({
    INSERT_MARKUP: null,
    MOVE_EXISTING: null,
    REMOVE_NODE: null,
    SET_MARKUP: null,
    TEXT_CONTENT: null
  });
  module.exports = ReactMultiChildUpdateTypes;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/setTextContent", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/escapeTextContentForBrowser", "npm:react@0.14.0/lib/setInnerHTML"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var escapeTextContentForBrowser = require("npm:react@0.14.0/lib/escapeTextContentForBrowser");
  var setInnerHTML = require("npm:react@0.14.0/lib/setInnerHTML");
  var setTextContent = function(node, text) {
    node.textContent = text;
  };
  if (ExecutionEnvironment.canUseDOM) {
    if (!('textContent' in document.documentElement)) {
      setTextContent = function(node, text) {
        setInnerHTML(node, escapeTextContentForBrowser(text));
      };
    }
  }
  module.exports = setTextContent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/DOMPropertyOperations", ["npm:react@0.14.0/lib/DOMProperty", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/quoteAttributeValueForBrowser", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var quoteAttributeValueForBrowser = require("npm:react@0.14.0/lib/quoteAttributeValueForBrowser");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var VALID_ATTRIBUTE_NAME_REGEX = /^[a-zA-Z_][\w\.\-]*$/;
    var illegalAttributeNameCache = {};
    var validatedAttributeNameCache = {};
    function isAttributeNameSafe(attributeName) {
      if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
        return true;
      }
      if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
        return false;
      }
      if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
        validatedAttributeNameCache[attributeName] = true;
        return true;
      }
      illegalAttributeNameCache[attributeName] = true;
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid attribute name: `%s`', attributeName) : undefined;
      return false;
    }
    function shouldIgnoreValue(propertyInfo, value) {
      return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
    }
    if (process.env.NODE_ENV !== 'production') {
      var reactProps = {
        children: true,
        dangerouslySetInnerHTML: true,
        key: true,
        ref: true
      };
      var warnedProperties = {};
      var warnUnknownProperty = function(name) {
        if (reactProps.hasOwnProperty(name) && reactProps[name] || warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
          return ;
        }
        warnedProperties[name] = true;
        var lowerCasedName = name.toLowerCase();
        var standardName = DOMProperty.isCustomAttribute(lowerCasedName) ? lowerCasedName : DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ? DOMProperty.getPossibleStandardName[lowerCasedName] : null;
        process.env.NODE_ENV !== 'production' ? warning(standardName == null, 'Unknown DOM property %s. Did you mean %s?', name, standardName) : undefined;
      };
    }
    var DOMPropertyOperations = {
      createMarkupForID: function(id) {
        return DOMProperty.ID_ATTRIBUTE_NAME + '=' + quoteAttributeValueForBrowser(id);
      },
      setAttributeForID: function(node, id) {
        node.setAttribute(DOMProperty.ID_ATTRIBUTE_NAME, id);
      },
      createMarkupForProperty: function(name, value) {
        var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
        if (propertyInfo) {
          if (shouldIgnoreValue(propertyInfo, value)) {
            return '';
          }
          var attributeName = propertyInfo.attributeName;
          if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
            return attributeName + '=""';
          }
          return attributeName + '=' + quoteAttributeValueForBrowser(value);
        } else if (DOMProperty.isCustomAttribute(name)) {
          if (value == null) {
            return '';
          }
          return name + '=' + quoteAttributeValueForBrowser(value);
        } else if (process.env.NODE_ENV !== 'production') {
          warnUnknownProperty(name);
        }
        return null;
      },
      createMarkupForCustomAttribute: function(name, value) {
        if (!isAttributeNameSafe(name) || value == null) {
          return '';
        }
        return name + '=' + quoteAttributeValueForBrowser(value);
      },
      setValueForProperty: function(node, name, value) {
        var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
        if (propertyInfo) {
          var mutationMethod = propertyInfo.mutationMethod;
          if (mutationMethod) {
            mutationMethod(node, value);
          } else if (shouldIgnoreValue(propertyInfo, value)) {
            this.deleteValueForProperty(node, name);
          } else if (propertyInfo.mustUseAttribute) {
            var attributeName = propertyInfo.attributeName;
            var namespace = propertyInfo.attributeNamespace;
            if (namespace) {
              node.setAttributeNS(namespace, attributeName, '' + value);
            } else if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
              node.setAttribute(attributeName, '');
            } else {
              node.setAttribute(attributeName, '' + value);
            }
          } else {
            var propName = propertyInfo.propertyName;
            if (!propertyInfo.hasSideEffects || '' + node[propName] !== '' + value) {
              node[propName] = value;
            }
          }
        } else if (DOMProperty.isCustomAttribute(name)) {
          DOMPropertyOperations.setValueForAttribute(node, name, value);
        } else if (process.env.NODE_ENV !== 'production') {
          warnUnknownProperty(name);
        }
      },
      setValueForAttribute: function(node, name, value) {
        if (!isAttributeNameSafe(name)) {
          return ;
        }
        if (value == null) {
          node.removeAttribute(name);
        } else {
          node.setAttribute(name, '' + value);
        }
      },
      deleteValueForProperty: function(node, name) {
        var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
        if (propertyInfo) {
          var mutationMethod = propertyInfo.mutationMethod;
          if (mutationMethod) {
            mutationMethod(node, undefined);
          } else if (propertyInfo.mustUseAttribute) {
            node.removeAttribute(propertyInfo.attributeName);
          } else {
            var propName = propertyInfo.propertyName;
            var defaultValue = DOMProperty.getDefaultValueForProperty(node.nodeName, propName);
            if (!propertyInfo.hasSideEffects || '' + node[propName] !== defaultValue) {
              node[propName] = defaultValue;
            }
          }
        } else if (DOMProperty.isCustomAttribute(name)) {
          node.removeAttribute(name);
        } else if (process.env.NODE_ENV !== 'production') {
          warnUnknownProperty(name);
        }
      }
    };
    ReactPerf.measureMethods(DOMPropertyOperations, 'DOMPropertyOperations', {
      setValueForProperty: 'setValueForProperty',
      setValueForAttribute: 'setValueForAttribute',
      deleteValueForProperty: 'deleteValueForProperty'
    });
    module.exports = DOMPropertyOperations;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/EventPluginUtils", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/ReactErrorUtils", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
    var ReactErrorUtils = require("npm:react@0.14.0/lib/ReactErrorUtils");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var injection = {
      Mount: null,
      injectMount: function(InjectedMount) {
        injection.Mount = InjectedMount;
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(InjectedMount && InjectedMount.getNode && InjectedMount.getID, 'EventPluginUtils.injection.injectMount(...): Injected Mount ' + 'module is missing getNode or getID.') : undefined;
        }
      }
    };
    var topLevelTypes = EventConstants.topLevelTypes;
    function isEndish(topLevelType) {
      return topLevelType === topLevelTypes.topMouseUp || topLevelType === topLevelTypes.topTouchEnd || topLevelType === topLevelTypes.topTouchCancel;
    }
    function isMoveish(topLevelType) {
      return topLevelType === topLevelTypes.topMouseMove || topLevelType === topLevelTypes.topTouchMove;
    }
    function isStartish(topLevelType) {
      return topLevelType === topLevelTypes.topMouseDown || topLevelType === topLevelTypes.topTouchStart;
    }
    var validateEventDispatches;
    if (process.env.NODE_ENV !== 'production') {
      validateEventDispatches = function(event) {
        var dispatchListeners = event._dispatchListeners;
        var dispatchIDs = event._dispatchIDs;
        var listenersIsArr = Array.isArray(dispatchListeners);
        var idsIsArr = Array.isArray(dispatchIDs);
        var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
        var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;
        process.env.NODE_ENV !== 'production' ? warning(idsIsArr === listenersIsArr && IDsLen === listenersLen, 'EventPluginUtils: Invalid `event`.') : undefined;
      };
    }
    function executeDispatch(event, simulated, listener, domID) {
      var type = event.type || 'unknown-event';
      event.currentTarget = injection.Mount.getNode(domID);
      if (simulated) {
        ReactErrorUtils.invokeGuardedCallbackWithCatch(type, listener, event, domID);
      } else {
        ReactErrorUtils.invokeGuardedCallback(type, listener, event, domID);
      }
      event.currentTarget = null;
    }
    function executeDispatchesInOrder(event, simulated) {
      var dispatchListeners = event._dispatchListeners;
      var dispatchIDs = event._dispatchIDs;
      if (process.env.NODE_ENV !== 'production') {
        validateEventDispatches(event);
      }
      if (Array.isArray(dispatchListeners)) {
        for (var i = 0; i < dispatchListeners.length; i++) {
          if (event.isPropagationStopped()) {
            break;
          }
          executeDispatch(event, simulated, dispatchListeners[i], dispatchIDs[i]);
        }
      } else if (dispatchListeners) {
        executeDispatch(event, simulated, dispatchListeners, dispatchIDs);
      }
      event._dispatchListeners = null;
      event._dispatchIDs = null;
    }
    function executeDispatchesInOrderStopAtTrueImpl(event) {
      var dispatchListeners = event._dispatchListeners;
      var dispatchIDs = event._dispatchIDs;
      if (process.env.NODE_ENV !== 'production') {
        validateEventDispatches(event);
      }
      if (Array.isArray(dispatchListeners)) {
        for (var i = 0; i < dispatchListeners.length; i++) {
          if (event.isPropagationStopped()) {
            break;
          }
          if (dispatchListeners[i](event, dispatchIDs[i])) {
            return dispatchIDs[i];
          }
        }
      } else if (dispatchListeners) {
        if (dispatchListeners(event, dispatchIDs)) {
          return dispatchIDs;
        }
      }
      return null;
    }
    function executeDispatchesInOrderStopAtTrue(event) {
      var ret = executeDispatchesInOrderStopAtTrueImpl(event);
      event._dispatchIDs = null;
      event._dispatchListeners = null;
      return ret;
    }
    function executeDirectDispatch(event) {
      if (process.env.NODE_ENV !== 'production') {
        validateEventDispatches(event);
      }
      var dispatchListener = event._dispatchListeners;
      var dispatchID = event._dispatchIDs;
      !!Array.isArray(dispatchListener) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'executeDirectDispatch(...): Invalid `event`.') : invariant(false) : undefined;
      var res = dispatchListener ? dispatchListener(event, dispatchID) : null;
      event._dispatchListeners = null;
      event._dispatchIDs = null;
      return res;
    }
    function hasDispatches(event) {
      return !!event._dispatchListeners;
    }
    var EventPluginUtils = {
      isEndish: isEndish,
      isMoveish: isMoveish,
      isStartish: isStartish,
      executeDirectDispatch: executeDirectDispatch,
      executeDispatchesInOrder: executeDispatchesInOrder,
      executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
      hasDispatches: hasDispatches,
      getNode: function(id) {
        return injection.Mount.getNode(id);
      },
      getID: function(node) {
        return injection.Mount.getID(node);
      },
      injection: injection
    };
    module.exports = EventPluginUtils;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactInstanceHandles", ["npm:react@0.14.0/lib/ReactRootIndex", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactRootIndex = require("npm:react@0.14.0/lib/ReactRootIndex");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var SEPARATOR = '.';
    var SEPARATOR_LENGTH = SEPARATOR.length;
    var MAX_TREE_DEPTH = 10000;
    function getReactRootIDString(index) {
      return SEPARATOR + index.toString(36);
    }
    function isBoundary(id, index) {
      return id.charAt(index) === SEPARATOR || index === id.length;
    }
    function isValidID(id) {
      return id === '' || id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR;
    }
    function isAncestorIDOf(ancestorID, descendantID) {
      return descendantID.indexOf(ancestorID) === 0 && isBoundary(descendantID, ancestorID.length);
    }
    function getParentID(id) {
      return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
    }
    function getNextDescendantID(ancestorID, destinationID) {
      !(isValidID(ancestorID) && isValidID(destinationID)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'getNextDescendantID(%s, %s): Received an invalid React DOM ID.', ancestorID, destinationID) : invariant(false) : undefined;
      !isAncestorIDOf(ancestorID, destinationID) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'getNextDescendantID(...): React has made an invalid assumption about ' + 'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.', ancestorID, destinationID) : invariant(false) : undefined;
      if (ancestorID === destinationID) {
        return ancestorID;
      }
      var start = ancestorID.length + SEPARATOR_LENGTH;
      var i;
      for (i = start; i < destinationID.length; i++) {
        if (isBoundary(destinationID, i)) {
          break;
        }
      }
      return destinationID.substr(0, i);
    }
    function getFirstCommonAncestorID(oneID, twoID) {
      var minLength = Math.min(oneID.length, twoID.length);
      if (minLength === 0) {
        return '';
      }
      var lastCommonMarkerIndex = 0;
      for (var i = 0; i <= minLength; i++) {
        if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
          lastCommonMarkerIndex = i;
        } else if (oneID.charAt(i) !== twoID.charAt(i)) {
          break;
        }
      }
      var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
      !isValidID(longestCommonID) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s', oneID, twoID, longestCommonID) : invariant(false) : undefined;
      return longestCommonID;
    }
    function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
      start = start || '';
      stop = stop || '';
      !(start !== stop) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.', start) : invariant(false) : undefined;
      var traverseUp = isAncestorIDOf(stop, start);
      !(traverseUp || isAncestorIDOf(start, stop)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' + 'not have a parent path.', start, stop) : invariant(false) : undefined;
      var depth = 0;
      var traverse = traverseUp ? getParentID : getNextDescendantID;
      for (var id = start; ; id = traverse(id, stop)) {
        var ret;
        if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
          ret = cb(id, traverseUp, arg);
        }
        if (ret === false || id === stop) {
          break;
        }
        !(depth++ < MAX_TREE_DEPTH) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' + 'traversing the React DOM ID tree. This may be due to malformed IDs: %s', start, stop, id) : invariant(false) : undefined;
      }
    }
    var ReactInstanceHandles = {
      createReactRootID: function() {
        return getReactRootIDString(ReactRootIndex.createReactRootIndex());
      },
      createReactID: function(rootID, name) {
        return rootID + name;
      },
      getReactRootIDFromNodeID: function(id) {
        if (id && id.charAt(0) === SEPARATOR && id.length > 1) {
          var index = id.indexOf(SEPARATOR, 1);
          return index > -1 ? id.substr(0, index) : id;
        }
        return null;
      },
      traverseEnterLeave: function(leaveID, enterID, cb, upArg, downArg) {
        var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
        if (ancestorID !== leaveID) {
          traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
        }
        if (ancestorID !== enterID) {
          traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
        }
      },
      traverseTwoPhase: function(targetID, cb, arg) {
        if (targetID) {
          traverseParentPath('', targetID, cb, arg, true, false);
          traverseParentPath(targetID, '', cb, arg, false, true);
        }
      },
      traverseTwoPhaseSkipTarget: function(targetID, cb, arg) {
        if (targetID) {
          traverseParentPath('', targetID, cb, arg, true, true);
          traverseParentPath(targetID, '', cb, arg, true, true);
        }
      },
      traverseAncestors: function(targetID, cb, arg) {
        traverseParentPath('', targetID, cb, arg, true, false);
      },
      getFirstCommonAncestorID: getFirstCommonAncestorID,
      _getNextDescendantID: getNextDescendantID,
      isAncestorIDOf: isAncestorIDOf,
      SEPARATOR: SEPARATOR
    };
    module.exports = ReactInstanceHandles;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactMarkupChecksum", ["npm:react@0.14.0/lib/adler32"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var adler32 = require("npm:react@0.14.0/lib/adler32");
  var TAG_END = /\/?>/;
  var ReactMarkupChecksum = {
    CHECKSUM_ATTR_NAME: 'data-react-checksum',
    addChecksumToMarkup: function(markup) {
      var checksum = adler32(markup);
      return markup.replace(TAG_END, ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '"$&');
    },
    canReuseMarkup: function(markup, element) {
      var existingChecksum = element.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
      existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
      var markupChecksum = adler32(markup);
      return markupChecksum === existingChecksum;
    }
  };
  module.exports = ReactMarkupChecksum;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactRef", ["npm:react@0.14.0/lib/ReactOwner", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactOwner = require("npm:react@0.14.0/lib/ReactOwner");
    var ReactRef = {};
    function attachRef(ref, component, owner) {
      if (typeof ref === 'function') {
        ref(component.getPublicInstance());
      } else {
        ReactOwner.addComponentAsRefTo(component, ref, owner);
      }
    }
    function detachRef(ref, component, owner) {
      if (typeof ref === 'function') {
        ref(null);
      } else {
        ReactOwner.removeComponentAsRefFrom(component, ref, owner);
      }
    }
    ReactRef.attachRefs = function(instance, element) {
      if (element === null || element === false) {
        return ;
      }
      var ref = element.ref;
      if (ref != null) {
        attachRef(ref, instance, element._owner);
      }
    };
    ReactRef.shouldUpdateRefs = function(prevElement, nextElement) {
      var prevEmpty = prevElement === null || prevElement === false;
      var nextEmpty = nextElement === null || nextElement === false;
      return (prevEmpty || nextEmpty || nextElement._owner !== prevElement._owner || nextElement.ref !== prevElement.ref);
    };
    ReactRef.detachRefs = function(instance, element) {
      if (element === null || element === false) {
        return ;
      }
      var ref = element.ref;
      if (ref != null) {
        detachRef(ref, instance, element._owner);
      }
    };
    module.exports = ReactRef;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/CallbackQueue", ["npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function CallbackQueue() {
      this._callbacks = null;
      this._contexts = null;
    }
    assign(CallbackQueue.prototype, {
      enqueue: function(callback, context) {
        this._callbacks = this._callbacks || [];
        this._contexts = this._contexts || [];
        this._callbacks.push(callback);
        this._contexts.push(context);
      },
      notifyAll: function() {
        var callbacks = this._callbacks;
        var contexts = this._contexts;
        if (callbacks) {
          !(callbacks.length === contexts.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Mismatched list of contexts in callback queue') : invariant(false) : undefined;
          this._callbacks = null;
          this._contexts = null;
          for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].call(contexts[i]);
          }
          callbacks.length = 0;
          contexts.length = 0;
        }
      },
      reset: function() {
        this._callbacks = null;
        this._contexts = null;
      },
      destructor: function() {
        this.reset();
      }
    });
    PooledClass.addPoolingTo(CallbackQueue);
    module.exports = CallbackQueue;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/isTextNode", ["npm:fbjs@0.3.1/lib/isNode"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var isNode = require("npm:fbjs@0.3.1/lib/isNode");
  function isTextNode(object) {
    return isNode(object) && object.nodeType == 3;
  }
  module.exports = isTextNode;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactCompositeComponent", ["npm:react@0.14.0/lib/ReactComponentEnvironment", "npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactInstanceMap", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ReactPropTypeLocations", "npm:react@0.14.0/lib/ReactPropTypeLocationNames", "npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/ReactUpdateQueue", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyObject", "npm:fbjs@0.3.1/lib/invariant", "npm:react@0.14.0/lib/shouldUpdateReactComponent", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactComponentEnvironment = require("npm:react@0.14.0/lib/ReactComponentEnvironment");
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactInstanceMap = require("npm:react@0.14.0/lib/ReactInstanceMap");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var ReactPropTypeLocations = require("npm:react@0.14.0/lib/ReactPropTypeLocations");
    var ReactPropTypeLocationNames = require("npm:react@0.14.0/lib/ReactPropTypeLocationNames");
    var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
    var ReactUpdateQueue = require("npm:react@0.14.0/lib/ReactUpdateQueue");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var emptyObject = require("npm:fbjs@0.3.1/lib/emptyObject");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var shouldUpdateReactComponent = require("npm:react@0.14.0/lib/shouldUpdateReactComponent");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function getDeclarationErrorAddendum(component) {
      var owner = component._currentElement._owner || null;
      if (owner) {
        var name = owner.getName();
        if (name) {
          return ' Check the render method of `' + name + '`.';
        }
      }
      return '';
    }
    function StatelessComponent(Component) {}
    StatelessComponent.prototype.render = function() {
      var Component = ReactInstanceMap.get(this)._currentElement.type;
      return Component(this.props, this.context, this.updater);
    };
    var nextMountID = 1;
    var ReactCompositeComponentMixin = {
      construct: function(element) {
        this._currentElement = element;
        this._rootNodeID = null;
        this._instance = null;
        this._pendingElement = null;
        this._pendingStateQueue = null;
        this._pendingReplaceState = false;
        this._pendingForceUpdate = false;
        this._renderedComponent = null;
        this._context = null;
        this._mountOrder = 0;
        this._topLevelWrapper = null;
        this._pendingCallbacks = null;
      },
      mountComponent: function(rootID, transaction, context) {
        this._context = context;
        this._mountOrder = nextMountID++;
        this._rootNodeID = rootID;
        var publicProps = this._processProps(this._currentElement.props);
        var publicContext = this._processContext(context);
        var Component = this._currentElement.type;
        var inst;
        var renderedElement;
        var canInstantiate = ('prototype' in Component);
        if (canInstantiate) {
          if (process.env.NODE_ENV !== 'production') {
            ReactCurrentOwner.current = this;
            try {
              inst = new Component(publicProps, publicContext, ReactUpdateQueue);
            } finally {
              ReactCurrentOwner.current = null;
            }
          } else {
            inst = new Component(publicProps, publicContext, ReactUpdateQueue);
          }
        }
        if (!canInstantiate || inst === null || inst === false || ReactElement.isValidElement(inst)) {
          renderedElement = inst;
          inst = new StatelessComponent(Component);
        }
        if (process.env.NODE_ENV !== 'production') {
          if (inst.render == null) {
            process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`, returned ' + 'null/false from a stateless component, or tried to render an ' + 'element whose type is a function that isn\'t a React component.', Component.displayName || Component.name || 'Component') : undefined;
          } else {
            process.env.NODE_ENV !== 'production' ? warning(Component.prototype && Component.prototype.isReactComponent || !canInstantiate || !(inst instanceof Component), '%s(...): React component classes must extend React.Component.', Component.displayName || Component.name || 'Component') : undefined;
          }
        }
        inst.props = publicProps;
        inst.context = publicContext;
        inst.refs = emptyObject;
        inst.updater = ReactUpdateQueue;
        this._instance = inst;
        ReactInstanceMap.set(inst, this);
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(!inst.getInitialState || inst.getInitialState.isReactClassApproved, 'getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', this.getName() || 'a component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(!inst.getDefaultProps || inst.getDefaultProps.isReactClassApproved, 'getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', this.getName() || 'a component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(!inst.propTypes, 'propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', this.getName() || 'a component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(!inst.contextTypes, 'contextTypes was defined as an instance property on %s. Use a ' + 'static property to define contextTypes instead.', this.getName() || 'a component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(typeof inst.componentShouldUpdate !== 'function', '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', this.getName() || 'A component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(typeof inst.componentDidUnmount !== 'function', '%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', this.getName() || 'A component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(typeof inst.componentWillRecieveProps !== 'function', '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', this.getName() || 'A component') : undefined;
        }
        var initialState = inst.state;
        if (initialState === undefined) {
          inst.state = initialState = null;
        }
        !(typeof initialState === 'object' && !Array.isArray(initialState)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.state: must be set to an object or null', this.getName() || 'ReactCompositeComponent') : invariant(false) : undefined;
        this._pendingStateQueue = null;
        this._pendingReplaceState = false;
        this._pendingForceUpdate = false;
        if (inst.componentWillMount) {
          inst.componentWillMount();
          if (this._pendingStateQueue) {
            inst.state = this._processPendingState(inst.props, inst.context);
          }
        }
        if (renderedElement === undefined) {
          renderedElement = this._renderValidatedComponent();
        }
        this._renderedComponent = this._instantiateReactComponent(renderedElement);
        var markup = ReactReconciler.mountComponent(this._renderedComponent, rootID, transaction, this._processChildContext(context));
        if (inst.componentDidMount) {
          transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);
        }
        return markup;
      },
      unmountComponent: function() {
        var inst = this._instance;
        if (inst.componentWillUnmount) {
          inst.componentWillUnmount();
        }
        ReactReconciler.unmountComponent(this._renderedComponent);
        this._renderedComponent = null;
        this._instance = null;
        this._pendingStateQueue = null;
        this._pendingReplaceState = false;
        this._pendingForceUpdate = false;
        this._pendingCallbacks = null;
        this._pendingElement = null;
        this._context = null;
        this._rootNodeID = null;
        this._topLevelWrapper = null;
        ReactInstanceMap.remove(inst);
      },
      _maskContext: function(context) {
        var maskedContext = null;
        var Component = this._currentElement.type;
        var contextTypes = Component.contextTypes;
        if (!contextTypes) {
          return emptyObject;
        }
        maskedContext = {};
        for (var contextName in contextTypes) {
          maskedContext[contextName] = context[contextName];
        }
        return maskedContext;
      },
      _processContext: function(context) {
        var maskedContext = this._maskContext(context);
        if (process.env.NODE_ENV !== 'production') {
          var Component = this._currentElement.type;
          if (Component.contextTypes) {
            this._checkPropTypes(Component.contextTypes, maskedContext, ReactPropTypeLocations.context);
          }
        }
        return maskedContext;
      },
      _processChildContext: function(currentContext) {
        var Component = this._currentElement.type;
        var inst = this._instance;
        var childContext = inst.getChildContext && inst.getChildContext();
        if (childContext) {
          !(typeof Component.childContextTypes === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', this.getName() || 'ReactCompositeComponent') : invariant(false) : undefined;
          if (process.env.NODE_ENV !== 'production') {
            this._checkPropTypes(Component.childContextTypes, childContext, ReactPropTypeLocations.childContext);
          }
          for (var name in childContext) {
            !(name in Component.childContextTypes) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', this.getName() || 'ReactCompositeComponent', name) : invariant(false) : undefined;
          }
          return assign({}, currentContext, childContext);
        }
        return currentContext;
      },
      _processProps: function(newProps) {
        if (process.env.NODE_ENV !== 'production') {
          var Component = this._currentElement.type;
          if (Component.propTypes) {
            this._checkPropTypes(Component.propTypes, newProps, ReactPropTypeLocations.prop);
          }
        }
        return newProps;
      },
      _checkPropTypes: function(propTypes, props, location) {
        var componentName = this.getName();
        for (var propName in propTypes) {
          if (propTypes.hasOwnProperty(propName)) {
            var error;
            try {
              !(typeof propTypes[propName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually ' + 'from React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], propName) : invariant(false) : undefined;
              error = propTypes[propName](props, propName, componentName, location);
            } catch (ex) {
              error = ex;
            }
            if (error instanceof Error) {
              var addendum = getDeclarationErrorAddendum(this);
              if (location === ReactPropTypeLocations.prop) {
                process.env.NODE_ENV !== 'production' ? warning(false, 'Failed Composite propType: %s%s', error.message, addendum) : undefined;
              } else {
                process.env.NODE_ENV !== 'production' ? warning(false, 'Failed Context Types: %s%s', error.message, addendum) : undefined;
              }
            }
          }
        }
      },
      receiveComponent: function(nextElement, transaction, nextContext) {
        var prevElement = this._currentElement;
        var prevContext = this._context;
        this._pendingElement = null;
        this.updateComponent(transaction, prevElement, nextElement, prevContext, nextContext);
      },
      performUpdateIfNecessary: function(transaction) {
        if (this._pendingElement != null) {
          ReactReconciler.receiveComponent(this, this._pendingElement || this._currentElement, transaction, this._context);
        }
        if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
          this.updateComponent(transaction, this._currentElement, this._currentElement, this._context, this._context);
        }
      },
      updateComponent: function(transaction, prevParentElement, nextParentElement, prevUnmaskedContext, nextUnmaskedContext) {
        var inst = this._instance;
        var nextContext = this._context === nextUnmaskedContext ? inst.context : this._processContext(nextUnmaskedContext);
        var nextProps;
        if (prevParentElement === nextParentElement) {
          nextProps = nextParentElement.props;
        } else {
          nextProps = this._processProps(nextParentElement.props);
          if (inst.componentWillReceiveProps) {
            inst.componentWillReceiveProps(nextProps, nextContext);
          }
        }
        var nextState = this._processPendingState(nextProps, nextContext);
        var shouldUpdate = this._pendingForceUpdate || !inst.shouldComponentUpdate || inst.shouldComponentUpdate(nextProps, nextState, nextContext);
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(typeof shouldUpdate !== 'undefined', '%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', this.getName() || 'ReactCompositeComponent') : undefined;
        }
        if (shouldUpdate) {
          this._pendingForceUpdate = false;
          this._performComponentUpdate(nextParentElement, nextProps, nextState, nextContext, transaction, nextUnmaskedContext);
        } else {
          this._currentElement = nextParentElement;
          this._context = nextUnmaskedContext;
          inst.props = nextProps;
          inst.state = nextState;
          inst.context = nextContext;
        }
      },
      _processPendingState: function(props, context) {
        var inst = this._instance;
        var queue = this._pendingStateQueue;
        var replace = this._pendingReplaceState;
        this._pendingReplaceState = false;
        this._pendingStateQueue = null;
        if (!queue) {
          return inst.state;
        }
        if (replace && queue.length === 1) {
          return queue[0];
        }
        var nextState = assign({}, replace ? queue[0] : inst.state);
        for (var i = replace ? 1 : 0; i < queue.length; i++) {
          var partial = queue[i];
          assign(nextState, typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial);
        }
        return nextState;
      },
      _performComponentUpdate: function(nextElement, nextProps, nextState, nextContext, transaction, unmaskedContext) {
        var inst = this._instance;
        var hasComponentDidUpdate = Boolean(inst.componentDidUpdate);
        var prevProps;
        var prevState;
        var prevContext;
        if (hasComponentDidUpdate) {
          prevProps = inst.props;
          prevState = inst.state;
          prevContext = inst.context;
        }
        if (inst.componentWillUpdate) {
          inst.componentWillUpdate(nextProps, nextState, nextContext);
        }
        this._currentElement = nextElement;
        this._context = unmaskedContext;
        inst.props = nextProps;
        inst.state = nextState;
        inst.context = nextContext;
        this._updateRenderedComponent(transaction, unmaskedContext);
        if (hasComponentDidUpdate) {
          transaction.getReactMountReady().enqueue(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), inst);
        }
      },
      _updateRenderedComponent: function(transaction, context) {
        var prevComponentInstance = this._renderedComponent;
        var prevRenderedElement = prevComponentInstance._currentElement;
        var nextRenderedElement = this._renderValidatedComponent();
        if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
          ReactReconciler.receiveComponent(prevComponentInstance, nextRenderedElement, transaction, this._processChildContext(context));
        } else {
          var thisID = this._rootNodeID;
          var prevComponentID = prevComponentInstance._rootNodeID;
          ReactReconciler.unmountComponent(prevComponentInstance);
          this._renderedComponent = this._instantiateReactComponent(nextRenderedElement);
          var nextMarkup = ReactReconciler.mountComponent(this._renderedComponent, thisID, transaction, this._processChildContext(context));
          this._replaceNodeWithMarkupByID(prevComponentID, nextMarkup);
        }
      },
      _replaceNodeWithMarkupByID: function(prevComponentID, nextMarkup) {
        ReactComponentEnvironment.replaceNodeWithMarkupByID(prevComponentID, nextMarkup);
      },
      _renderValidatedComponentWithoutOwnerOrContext: function() {
        var inst = this._instance;
        var renderedComponent = inst.render();
        if (process.env.NODE_ENV !== 'production') {
          if (typeof renderedComponent === 'undefined' && inst.render._isMockFunction) {
            renderedComponent = null;
          }
        }
        return renderedComponent;
      },
      _renderValidatedComponent: function() {
        var renderedComponent;
        ReactCurrentOwner.current = this;
        try {
          renderedComponent = this._renderValidatedComponentWithoutOwnerOrContext();
        } finally {
          ReactCurrentOwner.current = null;
        }
        !(renderedComponent === null || renderedComponent === false || ReactElement.isValidElement(renderedComponent)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.render(): A valid ReactComponent must be returned. You may have ' + 'returned undefined, an array or some other invalid object.', this.getName() || 'ReactCompositeComponent') : invariant(false) : undefined;
        return renderedComponent;
      },
      attachRef: function(ref, component) {
        var inst = this.getPublicInstance();
        !(inst != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Stateless function components cannot have refs.') : invariant(false) : undefined;
        var publicComponentInstance = component.getPublicInstance();
        if (process.env.NODE_ENV !== 'production') {
          var componentName = component && component.getName ? component.getName() : 'a component';
          process.env.NODE_ENV !== 'production' ? warning(publicComponentInstance != null, 'Stateless function components cannot be given refs ' + '(See ref "%s" in %s created by %s). ' + 'Attempts to access this ref will fail.', ref, componentName, this.getName()) : undefined;
        }
        var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
        refs[ref] = publicComponentInstance;
      },
      detachRef: function(ref) {
        var refs = this.getPublicInstance().refs;
        delete refs[ref];
      },
      getName: function() {
        var type = this._currentElement.type;
        var constructor = this._instance && this._instance.constructor;
        return type.displayName || constructor && constructor.displayName || type.name || constructor && constructor.name || null;
      },
      getPublicInstance: function() {
        var inst = this._instance;
        if (inst instanceof StatelessComponent) {
          return null;
        }
        return inst;
      },
      _instantiateReactComponent: null
    };
    ReactPerf.measureMethods(ReactCompositeComponentMixin, 'ReactCompositeComponent', {
      mountComponent: 'mountComponent',
      updateComponent: 'updateComponent',
      _renderValidatedComponent: '_renderValidatedComponent'
    });
    var ReactCompositeComponent = {Mixin: ReactCompositeComponentMixin};
    module.exports = ReactCompositeComponent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/FallbackCompositionState", ["npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/getTextContentAccessor"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var getTextContentAccessor = require("npm:react@0.14.0/lib/getTextContentAccessor");
  function FallbackCompositionState(root) {
    this._root = root;
    this._startText = this.getText();
    this._fallbackText = null;
  }
  assign(FallbackCompositionState.prototype, {
    destructor: function() {
      this._root = null;
      this._startText = null;
      this._fallbackText = null;
    },
    getText: function() {
      if ('value' in this._root) {
        return this._root.value;
      }
      return this._root[getTextContentAccessor()];
    },
    getData: function() {
      if (this._fallbackText) {
        return this._fallbackText;
      }
      var start;
      var startValue = this._startText;
      var startLength = startValue.length;
      var end;
      var endValue = this.getText();
      var endLength = endValue.length;
      for (start = 0; start < startLength; start++) {
        if (startValue[start] !== endValue[start]) {
          break;
        }
      }
      var minEnd = startLength - start;
      for (end = 1; end <= minEnd; end++) {
        if (startValue[startLength - end] !== endValue[endLength - end]) {
          break;
        }
      }
      var sliceTail = end > 1 ? 1 - end : undefined;
      this._fallbackText = endValue.slice(start, sliceTail);
      return this._fallbackText;
    }
  });
  PooledClass.addPoolingTo(FallbackCompositionState);
  module.exports = FallbackCompositionState;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticCompositionEvent", ["npm:react@0.14.0/lib/SyntheticEvent"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
  var CompositionEventInterface = {data: null};
  function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticEvent.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);
  module.exports = SyntheticCompositionEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ChangeEventPlugin", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/EventPluginHub", "npm:react@0.14.0/lib/EventPropagators", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/SyntheticEvent", "npm:react@0.14.0/lib/getEventTarget", "npm:react@0.14.0/lib/isEventSupported", "npm:react@0.14.0/lib/isTextInputElement", "npm:fbjs@0.3.1/lib/keyOf", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
    var EventPluginHub = require("npm:react@0.14.0/lib/EventPluginHub");
    var EventPropagators = require("npm:react@0.14.0/lib/EventPropagators");
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
    var getEventTarget = require("npm:react@0.14.0/lib/getEventTarget");
    var isEventSupported = require("npm:react@0.14.0/lib/isEventSupported");
    var isTextInputElement = require("npm:react@0.14.0/lib/isTextInputElement");
    var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
    var topLevelTypes = EventConstants.topLevelTypes;
    var eventTypes = {change: {
        phasedRegistrationNames: {
          bubbled: keyOf({onChange: null}),
          captured: keyOf({onChangeCapture: null})
        },
        dependencies: [topLevelTypes.topBlur, topLevelTypes.topChange, topLevelTypes.topClick, topLevelTypes.topFocus, topLevelTypes.topInput, topLevelTypes.topKeyDown, topLevelTypes.topKeyUp, topLevelTypes.topSelectionChange]
      }};
    var activeElement = null;
    var activeElementID = null;
    var activeElementValue = null;
    var activeElementValueProp = null;
    function shouldUseChangeEvent(elem) {
      var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
      return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
    }
    var doesChangeEventBubble = false;
    if (ExecutionEnvironment.canUseDOM) {
      doesChangeEventBubble = isEventSupported('change') && (!('documentMode' in document) || document.documentMode > 8);
    }
    function manualDispatchChangeEvent(nativeEvent) {
      var event = SyntheticEvent.getPooled(eventTypes.change, activeElementID, nativeEvent, getEventTarget(nativeEvent));
      EventPropagators.accumulateTwoPhaseDispatches(event);
      ReactUpdates.batchedUpdates(runEventInBatch, event);
    }
    function runEventInBatch(event) {
      EventPluginHub.enqueueEvents(event);
      EventPluginHub.processEventQueue(false);
    }
    function startWatchingForChangeEventIE8(target, targetID) {
      activeElement = target;
      activeElementID = targetID;
      activeElement.attachEvent('onchange', manualDispatchChangeEvent);
    }
    function stopWatchingForChangeEventIE8() {
      if (!activeElement) {
        return ;
      }
      activeElement.detachEvent('onchange', manualDispatchChangeEvent);
      activeElement = null;
      activeElementID = null;
    }
    function getTargetIDForChangeEvent(topLevelType, topLevelTarget, topLevelTargetID) {
      if (topLevelType === topLevelTypes.topChange) {
        return topLevelTargetID;
      }
    }
    function handleEventsForChangeEventIE8(topLevelType, topLevelTarget, topLevelTargetID) {
      if (topLevelType === topLevelTypes.topFocus) {
        stopWatchingForChangeEventIE8();
        startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
      } else if (topLevelType === topLevelTypes.topBlur) {
        stopWatchingForChangeEventIE8();
      }
    }
    var isInputEventSupported = false;
    if (ExecutionEnvironment.canUseDOM) {
      isInputEventSupported = isEventSupported('input') && (!('documentMode' in document) || document.documentMode > 9);
    }
    var newValueProp = {
      get: function() {
        return activeElementValueProp.get.call(this);
      },
      set: function(val) {
        activeElementValue = '' + val;
        activeElementValueProp.set.call(this, val);
      }
    };
    function startWatchingForValueChange(target, targetID) {
      activeElement = target;
      activeElementID = targetID;
      activeElementValue = target.value;
      activeElementValueProp = Object.getOwnPropertyDescriptor(target.constructor.prototype, 'value');
      Object.defineProperty(activeElement, 'value', newValueProp);
      activeElement.attachEvent('onpropertychange', handlePropertyChange);
    }
    function stopWatchingForValueChange() {
      if (!activeElement) {
        return ;
      }
      delete activeElement.value;
      activeElement.detachEvent('onpropertychange', handlePropertyChange);
      activeElement = null;
      activeElementID = null;
      activeElementValue = null;
      activeElementValueProp = null;
    }
    function handlePropertyChange(nativeEvent) {
      if (nativeEvent.propertyName !== 'value') {
        return ;
      }
      var value = nativeEvent.srcElement.value;
      if (value === activeElementValue) {
        return ;
      }
      activeElementValue = value;
      manualDispatchChangeEvent(nativeEvent);
    }
    function getTargetIDForInputEvent(topLevelType, topLevelTarget, topLevelTargetID) {
      if (topLevelType === topLevelTypes.topInput) {
        return topLevelTargetID;
      }
    }
    function handleEventsForInputEventIE(topLevelType, topLevelTarget, topLevelTargetID) {
      if (topLevelType === topLevelTypes.topFocus) {
        stopWatchingForValueChange();
        startWatchingForValueChange(topLevelTarget, topLevelTargetID);
      } else if (topLevelType === topLevelTypes.topBlur) {
        stopWatchingForValueChange();
      }
    }
    function getTargetIDForInputEventIE(topLevelType, topLevelTarget, topLevelTargetID) {
      if (topLevelType === topLevelTypes.topSelectionChange || topLevelType === topLevelTypes.topKeyUp || topLevelType === topLevelTypes.topKeyDown) {
        if (activeElement && activeElement.value !== activeElementValue) {
          activeElementValue = activeElement.value;
          return activeElementID;
        }
      }
    }
    function shouldUseClickEvent(elem) {
      return elem.nodeName && elem.nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
    }
    function getTargetIDForClickEvent(topLevelType, topLevelTarget, topLevelTargetID) {
      if (topLevelType === topLevelTypes.topClick) {
        return topLevelTargetID;
      }
    }
    var ChangeEventPlugin = {
      eventTypes: eventTypes,
      extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
        var getTargetIDFunc,
            handleEventFunc;
        if (shouldUseChangeEvent(topLevelTarget)) {
          if (doesChangeEventBubble) {
            getTargetIDFunc = getTargetIDForChangeEvent;
          } else {
            handleEventFunc = handleEventsForChangeEventIE8;
          }
        } else if (isTextInputElement(topLevelTarget)) {
          if (isInputEventSupported) {
            getTargetIDFunc = getTargetIDForInputEvent;
          } else {
            getTargetIDFunc = getTargetIDForInputEventIE;
            handleEventFunc = handleEventsForInputEventIE;
          }
        } else if (shouldUseClickEvent(topLevelTarget)) {
          getTargetIDFunc = getTargetIDForClickEvent;
        }
        if (getTargetIDFunc) {
          var targetID = getTargetIDFunc(topLevelType, topLevelTarget, topLevelTargetID);
          if (targetID) {
            var event = SyntheticEvent.getPooled(eventTypes.change, targetID, nativeEvent, nativeEventTarget);
            event.type = 'change';
            EventPropagators.accumulateTwoPhaseDispatches(event);
            return event;
          }
        }
        if (handleEventFunc) {
          handleEventFunc(topLevelType, topLevelTarget, topLevelTargetID);
        }
      }
    };
    module.exports = ChangeEventPlugin;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticMouseEvent", ["npm:react@0.14.0/lib/SyntheticUIEvent", "npm:react@0.14.0/lib/ViewportMetrics", "npm:react@0.14.0/lib/getEventModifierState"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticUIEvent = require("npm:react@0.14.0/lib/SyntheticUIEvent");
  var ViewportMetrics = require("npm:react@0.14.0/lib/ViewportMetrics");
  var getEventModifierState = require("npm:react@0.14.0/lib/getEventModifierState");
  var MouseEventInterface = {
    screenX: null,
    screenY: null,
    clientX: null,
    clientY: null,
    ctrlKey: null,
    shiftKey: null,
    altKey: null,
    metaKey: null,
    getModifierState: getEventModifierState,
    button: function(event) {
      var button = event.button;
      if ('which' in event) {
        return button;
      }
      return button === 2 ? 2 : button === 4 ? 1 : 0;
    },
    buttons: null,
    relatedTarget: function(event) {
      return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
    },
    pageX: function(event) {
      return 'pageX' in event ? event.pageX : event.clientX + ViewportMetrics.currentScrollLeft;
    },
    pageY: function(event) {
      return 'pageY' in event ? event.pageY : event.clientY + ViewportMetrics.currentScrollTop;
    }
  };
  function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);
  module.exports = SyntheticMouseEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactBrowserComponentMixin", ["npm:react@0.14.0/lib/ReactInstanceMap", "npm:react@0.14.0/lib/findDOMNode", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactInstanceMap = require("npm:react@0.14.0/lib/ReactInstanceMap");
    var findDOMNode = require("npm:react@0.14.0/lib/findDOMNode");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var didWarnKey = '_getDOMNodeDidWarn';
    var ReactBrowserComponentMixin = {getDOMNode: function() {
        process.env.NODE_ENV !== 'production' ? warning(this.constructor[didWarnKey], '%s.getDOMNode(...) is deprecated. Please use ' + 'ReactDOM.findDOMNode(instance) instead.', ReactInstanceMap.get(this).getName() || this.tagName || 'Unknown') : undefined;
        this.constructor[didWarnKey] = true;
        return findDOMNode(this);
      }};
    module.exports = ReactBrowserComponentMixin;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/AutoFocusUtils", ["npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/findDOMNode", "npm:fbjs@0.3.1/lib/focusNode"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
  var findDOMNode = require("npm:react@0.14.0/lib/findDOMNode");
  var focusNode = require("npm:fbjs@0.3.1/lib/focusNode");
  var Mixin = {componentDidMount: function() {
      if (this.props.autoFocus) {
        focusNode(findDOMNode(this));
      }
    }};
  var AutoFocusUtils = {
    Mixin: Mixin,
    focusDOMComponent: function() {
      focusNode(ReactMount.getNode(this._rootNodeID));
    }
  };
  module.exports = AutoFocusUtils;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/camelizeStyleName", ["npm:fbjs@0.3.1/lib/camelize"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var camelize = require("npm:fbjs@0.3.1/lib/camelize");
  var msPattern = /^-ms-/;
  function camelizeStyleName(string) {
    return camelize(string.replace(msPattern, 'ms-'));
  }
  module.exports = camelizeStyleName;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/hyphenateStyleName", ["npm:fbjs@0.3.1/lib/hyphenate"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var hyphenate = require("npm:fbjs@0.3.1/lib/hyphenate");
  var msPattern = /^ms-/;
  function hyphenateStyleName(string) {
    return hyphenate(string).replace(msPattern, '-ms-');
  }
  module.exports = hyphenateStyleName;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactPropTypes", ["npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactPropTypeLocationNames", "npm:fbjs@0.3.1/lib/emptyFunction", "npm:react@0.14.0/lib/getIteratorFn"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
  var ReactPropTypeLocationNames = require("npm:react@0.14.0/lib/ReactPropTypeLocationNames");
  var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
  var getIteratorFn = require("npm:react@0.14.0/lib/getIteratorFn");
  var ANONYMOUS = '<<anonymous>>';
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };
  function createChainableTypeChecker(validate) {
    function checkType(isRequired, props, propName, componentName, location, propFullName) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;
      if (props[propName] == null) {
        var locationName = ReactPropTypeLocationNames[location];
        if (isRequired) {
          return new Error('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }
    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);
    return chainedCheckType;
  }
  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        var locationName = ReactPropTypeLocationNames[location];
        var preciseType = getPreciseType(propValue);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturns(null));
  }
  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var locationName = ReactPropTypeLocationNames[location];
        var propType = getPropType(propValue);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']');
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!ReactElement.isValidElement(props[propName])) {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var locationName = ReactPropTypeLocationNames[location];
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      return createChainableTypeChecker(function() {
        return new Error('Invalid argument supplied to oneOf, expected an instance of array.');
      });
    }
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (propValue === expectedValues[i]) {
          return null;
        }
      }
      var locationName = ReactPropTypeLocationNames[location];
      var valuesString = JSON.stringify(expectedValues);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }
  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      return createChainableTypeChecker(function() {
        return new Error('Invalid argument supplied to oneOfType, expected an instance of array.');
      });
    }
    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName) == null) {
          return null;
        }
      }
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }
  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || ReactElement.isValidElement(propValue)) {
          return true;
        }
        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }
        return true;
      default:
        return false;
    }
  }
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      return 'object';
    }
    return propType;
  }
  function getPreciseType(propValue) {
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return '<<anonymous>>';
    }
    return propValue.constructor.name;
  }
  module.exports = ReactPropTypes;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactChildren", ["npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/ReactElement", "npm:fbjs@0.3.1/lib/emptyFunction", "npm:react@0.14.0/lib/traverseAllChildren"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
  var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
  var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
  var traverseAllChildren = require("npm:react@0.14.0/lib/traverseAllChildren");
  var twoArgumentPooler = PooledClass.twoArgumentPooler;
  var fourArgumentPooler = PooledClass.fourArgumentPooler;
  var userProvidedKeyEscapeRegex = /\/(?!\/)/g;
  function escapeUserProvidedKey(text) {
    return ('' + text).replace(userProvidedKeyEscapeRegex, '//');
  }
  function ForEachBookKeeping(forEachFunction, forEachContext) {
    this.func = forEachFunction;
    this.context = forEachContext;
    this.count = 0;
  }
  ForEachBookKeeping.prototype.destructor = function() {
    this.func = null;
    this.context = null;
    this.count = 0;
  };
  PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);
  function forEachSingleChild(bookKeeping, child, name) {
    var func = bookKeeping.func;
    var context = bookKeeping.context;
    func.call(context, child, bookKeeping.count++);
  }
  function forEachChildren(children, forEachFunc, forEachContext) {
    if (children == null) {
      return children;
    }
    var traverseContext = ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
    traverseAllChildren(children, forEachSingleChild, traverseContext);
    ForEachBookKeeping.release(traverseContext);
  }
  function MapBookKeeping(mapResult, keyPrefix, mapFunction, mapContext) {
    this.result = mapResult;
    this.keyPrefix = keyPrefix;
    this.func = mapFunction;
    this.context = mapContext;
    this.count = 0;
  }
  MapBookKeeping.prototype.destructor = function() {
    this.result = null;
    this.keyPrefix = null;
    this.func = null;
    this.context = null;
    this.count = 0;
  };
  PooledClass.addPoolingTo(MapBookKeeping, fourArgumentPooler);
  function mapSingleChildIntoContext(bookKeeping, child, childKey) {
    var result = bookKeeping.result;
    var keyPrefix = bookKeeping.keyPrefix;
    var func = bookKeeping.func;
    var context = bookKeeping.context;
    var mappedChild = func.call(context, child, bookKeeping.count++);
    if (Array.isArray(mappedChild)) {
      mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
    } else if (mappedChild != null) {
      if (ReactElement.isValidElement(mappedChild)) {
        mappedChild = ReactElement.cloneAndReplaceKey(mappedChild, keyPrefix + (mappedChild !== child ? escapeUserProvidedKey(mappedChild.key || '') + '/' : '') + childKey);
      }
      result.push(mappedChild);
    }
  }
  function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
    var escapedPrefix = '';
    if (prefix != null) {
      escapedPrefix = escapeUserProvidedKey(prefix) + '/';
    }
    var traverseContext = MapBookKeeping.getPooled(array, escapedPrefix, func, context);
    traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
    MapBookKeeping.release(traverseContext);
  }
  function mapChildren(children, func, context) {
    if (children == null) {
      return children;
    }
    var result = [];
    mapIntoWithKeyPrefixInternal(children, result, null, func, context);
    return result;
  }
  function forEachSingleChildDummy(traverseContext, child, name) {
    return null;
  }
  function countChildren(children, context) {
    return traverseAllChildren(children, forEachSingleChildDummy, null);
  }
  function toArray(children) {
    var result = [];
    mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
    return result;
  }
  var ReactChildren = {
    forEach: forEachChildren,
    map: mapChildren,
    mapIntoWithKeyPrefixInternal: mapIntoWithKeyPrefixInternal,
    count: countChildren,
    toArray: toArray
  };
  module.exports = ReactChildren;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactMultiChild", ["npm:react@0.14.0/lib/ReactComponentEnvironment", "npm:react@0.14.0/lib/ReactMultiChildUpdateTypes", "npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/ReactChildReconciler", "npm:react@0.14.0/lib/flattenChildren", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactComponentEnvironment = require("npm:react@0.14.0/lib/ReactComponentEnvironment");
    var ReactMultiChildUpdateTypes = require("npm:react@0.14.0/lib/ReactMultiChildUpdateTypes");
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
    var ReactChildReconciler = require("npm:react@0.14.0/lib/ReactChildReconciler");
    var flattenChildren = require("npm:react@0.14.0/lib/flattenChildren");
    var updateDepth = 0;
    var updateQueue = [];
    var markupQueue = [];
    function enqueueInsertMarkup(parentID, markup, toIndex) {
      updateQueue.push({
        parentID: parentID,
        parentNode: null,
        type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
        markupIndex: markupQueue.push(markup) - 1,
        content: null,
        fromIndex: null,
        toIndex: toIndex
      });
    }
    function enqueueMove(parentID, fromIndex, toIndex) {
      updateQueue.push({
        parentID: parentID,
        parentNode: null,
        type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
        markupIndex: null,
        content: null,
        fromIndex: fromIndex,
        toIndex: toIndex
      });
    }
    function enqueueRemove(parentID, fromIndex) {
      updateQueue.push({
        parentID: parentID,
        parentNode: null,
        type: ReactMultiChildUpdateTypes.REMOVE_NODE,
        markupIndex: null,
        content: null,
        fromIndex: fromIndex,
        toIndex: null
      });
    }
    function enqueueSetMarkup(parentID, markup) {
      updateQueue.push({
        parentID: parentID,
        parentNode: null,
        type: ReactMultiChildUpdateTypes.SET_MARKUP,
        markupIndex: null,
        content: markup,
        fromIndex: null,
        toIndex: null
      });
    }
    function enqueueTextContent(parentID, textContent) {
      updateQueue.push({
        parentID: parentID,
        parentNode: null,
        type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
        markupIndex: null,
        content: textContent,
        fromIndex: null,
        toIndex: null
      });
    }
    function processQueue() {
      if (updateQueue.length) {
        ReactComponentEnvironment.processChildrenUpdates(updateQueue, markupQueue);
        clearQueue();
      }
    }
    function clearQueue() {
      updateQueue.length = 0;
      markupQueue.length = 0;
    }
    var ReactMultiChild = {Mixin: {
        _reconcilerInstantiateChildren: function(nestedChildren, transaction, context) {
          if (process.env.NODE_ENV !== 'production') {
            if (this._currentElement) {
              try {
                ReactCurrentOwner.current = this._currentElement._owner;
                return ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context);
              } finally {
                ReactCurrentOwner.current = null;
              }
            }
          }
          return ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context);
        },
        _reconcilerUpdateChildren: function(prevChildren, nextNestedChildrenElements, transaction, context) {
          var nextChildren;
          if (process.env.NODE_ENV !== 'production') {
            if (this._currentElement) {
              try {
                ReactCurrentOwner.current = this._currentElement._owner;
                nextChildren = flattenChildren(nextNestedChildrenElements);
              } finally {
                ReactCurrentOwner.current = null;
              }
              return ReactChildReconciler.updateChildren(prevChildren, nextChildren, transaction, context);
            }
          }
          nextChildren = flattenChildren(nextNestedChildrenElements);
          return ReactChildReconciler.updateChildren(prevChildren, nextChildren, transaction, context);
        },
        mountChildren: function(nestedChildren, transaction, context) {
          var children = this._reconcilerInstantiateChildren(nestedChildren, transaction, context);
          this._renderedChildren = children;
          var mountImages = [];
          var index = 0;
          for (var name in children) {
            if (children.hasOwnProperty(name)) {
              var child = children[name];
              var rootID = this._rootNodeID + name;
              var mountImage = ReactReconciler.mountComponent(child, rootID, transaction, context);
              child._mountIndex = index++;
              mountImages.push(mountImage);
            }
          }
          return mountImages;
        },
        updateTextContent: function(nextContent) {
          updateDepth++;
          var errorThrown = true;
          try {
            var prevChildren = this._renderedChildren;
            ReactChildReconciler.unmountChildren(prevChildren);
            for (var name in prevChildren) {
              if (prevChildren.hasOwnProperty(name)) {
                this._unmountChild(prevChildren[name]);
              }
            }
            this.setTextContent(nextContent);
            errorThrown = false;
          } finally {
            updateDepth--;
            if (!updateDepth) {
              if (errorThrown) {
                clearQueue();
              } else {
                processQueue();
              }
            }
          }
        },
        updateMarkup: function(nextMarkup) {
          updateDepth++;
          var errorThrown = true;
          try {
            var prevChildren = this._renderedChildren;
            ReactChildReconciler.unmountChildren(prevChildren);
            for (var name in prevChildren) {
              if (prevChildren.hasOwnProperty(name)) {
                this._unmountChildByName(prevChildren[name], name);
              }
            }
            this.setMarkup(nextMarkup);
            errorThrown = false;
          } finally {
            updateDepth--;
            if (!updateDepth) {
              if (errorThrown) {
                clearQueue();
              } else {
                processQueue();
              }
            }
          }
        },
        updateChildren: function(nextNestedChildrenElements, transaction, context) {
          updateDepth++;
          var errorThrown = true;
          try {
            this._updateChildren(nextNestedChildrenElements, transaction, context);
            errorThrown = false;
          } finally {
            updateDepth--;
            if (!updateDepth) {
              if (errorThrown) {
                clearQueue();
              } else {
                processQueue();
              }
            }
          }
        },
        _updateChildren: function(nextNestedChildrenElements, transaction, context) {
          var prevChildren = this._renderedChildren;
          var nextChildren = this._reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, transaction, context);
          this._renderedChildren = nextChildren;
          if (!nextChildren && !prevChildren) {
            return ;
          }
          var name;
          var lastIndex = 0;
          var nextIndex = 0;
          for (name in nextChildren) {
            if (!nextChildren.hasOwnProperty(name)) {
              continue;
            }
            var prevChild = prevChildren && prevChildren[name];
            var nextChild = nextChildren[name];
            if (prevChild === nextChild) {
              this.moveChild(prevChild, nextIndex, lastIndex);
              lastIndex = Math.max(prevChild._mountIndex, lastIndex);
              prevChild._mountIndex = nextIndex;
            } else {
              if (prevChild) {
                lastIndex = Math.max(prevChild._mountIndex, lastIndex);
                this._unmountChild(prevChild);
              }
              this._mountChildByNameAtIndex(nextChild, name, nextIndex, transaction, context);
            }
            nextIndex++;
          }
          for (name in prevChildren) {
            if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
              this._unmountChild(prevChildren[name]);
            }
          }
        },
        unmountChildren: function() {
          var renderedChildren = this._renderedChildren;
          ReactChildReconciler.unmountChildren(renderedChildren);
          this._renderedChildren = null;
        },
        moveChild: function(child, toIndex, lastIndex) {
          if (child._mountIndex < lastIndex) {
            enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
          }
        },
        createChild: function(child, mountImage) {
          enqueueInsertMarkup(this._rootNodeID, mountImage, child._mountIndex);
        },
        removeChild: function(child) {
          enqueueRemove(this._rootNodeID, child._mountIndex);
        },
        setTextContent: function(textContent) {
          enqueueTextContent(this._rootNodeID, textContent);
        },
        setMarkup: function(markup) {
          enqueueSetMarkup(this._rootNodeID, markup);
        },
        _mountChildByNameAtIndex: function(child, name, index, transaction, context) {
          var rootID = this._rootNodeID + name;
          var mountImage = ReactReconciler.mountComponent(child, rootID, transaction, context);
          child._mountIndex = index;
          this.createChild(child, mountImage);
        },
        _unmountChild: function(child) {
          this.removeChild(child);
          child._mountIndex = null;
        }
      }};
    module.exports = ReactMultiChild;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactEventListener", ["npm:fbjs@0.3.1/lib/EventListener", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/ReactInstanceHandles", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/getEventTarget", "npm:fbjs@0.3.1/lib/getUnboundedScrollPosition", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventListener = require("npm:fbjs@0.3.1/lib/EventListener");
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
    var ReactInstanceHandles = require("npm:react@0.14.0/lib/ReactInstanceHandles");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var getEventTarget = require("npm:react@0.14.0/lib/getEventTarget");
    var getUnboundedScrollPosition = require("npm:fbjs@0.3.1/lib/getUnboundedScrollPosition");
    var DOCUMENT_FRAGMENT_NODE_TYPE = 11;
    function findParent(node) {
      var nodeID = ReactMount.getID(node);
      var rootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
      var container = ReactMount.findReactContainerForID(rootID);
      var parent = ReactMount.getFirstReactDOM(container);
      return parent;
    }
    function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
      this.topLevelType = topLevelType;
      this.nativeEvent = nativeEvent;
      this.ancestors = [];
    }
    assign(TopLevelCallbackBookKeeping.prototype, {destructor: function() {
        this.topLevelType = null;
        this.nativeEvent = null;
        this.ancestors.length = 0;
      }});
    PooledClass.addPoolingTo(TopLevelCallbackBookKeeping, PooledClass.twoArgumentPooler);
    function handleTopLevelImpl(bookKeeping) {
      void handleTopLevelWithPath;
      handleTopLevelWithoutPath(bookKeeping);
    }
    function handleTopLevelWithoutPath(bookKeeping) {
      var topLevelTarget = ReactMount.getFirstReactDOM(getEventTarget(bookKeeping.nativeEvent)) || window;
      var ancestor = topLevelTarget;
      while (ancestor) {
        bookKeeping.ancestors.push(ancestor);
        ancestor = findParent(ancestor);
      }
      for (var i = 0; i < bookKeeping.ancestors.length; i++) {
        topLevelTarget = bookKeeping.ancestors[i];
        var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
        ReactEventListener._handleTopLevel(bookKeeping.topLevelType, topLevelTarget, topLevelTargetID, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
      }
    }
    function handleTopLevelWithPath(bookKeeping) {
      var path = bookKeeping.nativeEvent.path;
      var currentNativeTarget = path[0];
      var eventsFired = 0;
      for (var i = 0; i < path.length; i++) {
        var currentPathElement = path[i];
        if (currentPathElement.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE) {
          currentNativeTarget = path[i + 1];
        }
        var reactParent = ReactMount.getFirstReactDOM(currentPathElement);
        if (reactParent === currentPathElement) {
          var currentPathElementID = ReactMount.getID(currentPathElement);
          var newRootID = ReactInstanceHandles.getReactRootIDFromNodeID(currentPathElementID);
          bookKeeping.ancestors.push(currentPathElement);
          var topLevelTargetID = ReactMount.getID(currentPathElement) || '';
          eventsFired++;
          ReactEventListener._handleTopLevel(bookKeeping.topLevelType, currentPathElement, topLevelTargetID, bookKeeping.nativeEvent, currentNativeTarget);
          while (currentPathElementID !== newRootID) {
            i++;
            currentPathElement = path[i];
            currentPathElementID = ReactMount.getID(currentPathElement);
          }
        }
      }
      if (eventsFired === 0) {
        ReactEventListener._handleTopLevel(bookKeeping.topLevelType, window, '', bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
      }
    }
    function scrollValueMonitor(cb) {
      var scrollPosition = getUnboundedScrollPosition(window);
      cb(scrollPosition);
    }
    var ReactEventListener = {
      _enabled: true,
      _handleTopLevel: null,
      WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,
      setHandleTopLevel: function(handleTopLevel) {
        ReactEventListener._handleTopLevel = handleTopLevel;
      },
      setEnabled: function(enabled) {
        ReactEventListener._enabled = !!enabled;
      },
      isEnabled: function() {
        return ReactEventListener._enabled;
      },
      trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
        var element = handle;
        if (!element) {
          return null;
        }
        return EventListener.listen(element, handlerBaseName, ReactEventListener.dispatchEvent.bind(null, topLevelType));
      },
      trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
        var element = handle;
        if (!element) {
          return null;
        }
        return EventListener.capture(element, handlerBaseName, ReactEventListener.dispatchEvent.bind(null, topLevelType));
      },
      monitorScrollValue: function(refresh) {
        var callback = scrollValueMonitor.bind(null, refresh);
        EventListener.listen(window, 'scroll', callback);
      },
      dispatchEvent: function(topLevelType, nativeEvent) {
        if (!ReactEventListener._enabled) {
          return ;
        }
        var bookKeeping = TopLevelCallbackBookKeeping.getPooled(topLevelType, nativeEvent);
        try {
          ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
        } finally {
          TopLevelCallbackBookKeeping.release(bookKeeping);
        }
      }
    };
    module.exports = ReactEventListener;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactComponent", ["npm:react@0.14.0/lib/ReactNoopUpdateQueue", "npm:fbjs@0.3.1/lib/emptyObject", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactNoopUpdateQueue = require("npm:react@0.14.0/lib/ReactNoopUpdateQueue");
    var emptyObject = require("npm:fbjs@0.3.1/lib/emptyObject");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function ReactComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    ReactComponent.prototype.isReactComponent = {};
    ReactComponent.prototype.setState = function(partialState, callback) {
      !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setState(...): takes an object of state variables to update or a ' + 'function which returns an object of state variables.') : invariant(false) : undefined;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(partialState != null, 'setState(...): You passed an undefined or null state object; ' + 'instead, use forceUpdate().') : undefined;
      }
      this.updater.enqueueSetState(this, partialState);
      if (callback) {
        this.updater.enqueueCallback(this, callback);
      }
    };
    ReactComponent.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this);
      if (callback) {
        this.updater.enqueueCallback(this, callback);
      }
    };
    if (process.env.NODE_ENV !== 'production') {
      var deprecatedAPIs = {
        getDOMNode: ['getDOMNode', 'Use ReactDOM.findDOMNode(component) instead.'],
        isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
        replaceProps: ['replaceProps', 'Instead, call render again at the top level.'],
        replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).'],
        setProps: ['setProps', 'Instead, call render again at the top level.']
      };
      var defineDeprecationWarning = function(methodName, info) {
        try {
          Object.defineProperty(ReactComponent.prototype, methodName, {get: function() {
              process.env.NODE_ENV !== 'production' ? warning(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]) : undefined;
              return undefined;
            }});
        } catch (x) {}
      };
      for (var fnName in deprecatedAPIs) {
        if (deprecatedAPIs.hasOwnProperty(fnName)) {
          defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
        }
      }
    }
    module.exports = ReactComponent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMSelection", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/getNodeForCharacterOffset", "npm:react@0.14.0/lib/getTextContentAccessor"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var getNodeForCharacterOffset = require("npm:react@0.14.0/lib/getNodeForCharacterOffset");
  var getTextContentAccessor = require("npm:react@0.14.0/lib/getTextContentAccessor");
  function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
    return anchorNode === focusNode && anchorOffset === focusOffset;
  }
  function getIEOffsets(node) {
    var selection = document.selection;
    var selectedRange = selection.createRange();
    var selectedLength = selectedRange.text.length;
    var fromStart = selectedRange.duplicate();
    fromStart.moveToElementText(node);
    fromStart.setEndPoint('EndToStart', selectedRange);
    var startOffset = fromStart.text.length;
    var endOffset = startOffset + selectedLength;
    return {
      start: startOffset,
      end: endOffset
    };
  }
  function getModernOffsets(node) {
    var selection = window.getSelection && window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    var anchorNode = selection.anchorNode;
    var anchorOffset = selection.anchorOffset;
    var focusNode = selection.focusNode;
    var focusOffset = selection.focusOffset;
    var currentRange = selection.getRangeAt(0);
    try {
      currentRange.startContainer.nodeType;
      currentRange.endContainer.nodeType;
    } catch (e) {
      return null;
    }
    var isSelectionCollapsed = isCollapsed(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
    var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;
    var tempRange = currentRange.cloneRange();
    tempRange.selectNodeContents(node);
    tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);
    var isTempRangeCollapsed = isCollapsed(tempRange.startContainer, tempRange.startOffset, tempRange.endContainer, tempRange.endOffset);
    var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
    var end = start + rangeLength;
    var detectionRange = document.createRange();
    detectionRange.setStart(anchorNode, anchorOffset);
    detectionRange.setEnd(focusNode, focusOffset);
    var isBackward = detectionRange.collapsed;
    return {
      start: isBackward ? end : start,
      end: isBackward ? start : end
    };
  }
  function setIEOffsets(node, offsets) {
    var range = document.selection.createRange().duplicate();
    var start,
        end;
    if (typeof offsets.end === 'undefined') {
      start = offsets.start;
      end = start;
    } else if (offsets.start > offsets.end) {
      start = offsets.end;
      end = offsets.start;
    } else {
      start = offsets.start;
      end = offsets.end;
    }
    range.moveToElementText(node);
    range.moveStart('character', start);
    range.setEndPoint('EndToStart', range);
    range.moveEnd('character', end - start);
    range.select();
  }
  function setModernOffsets(node, offsets) {
    if (!window.getSelection) {
      return ;
    }
    var selection = window.getSelection();
    var length = node[getTextContentAccessor()].length;
    var start = Math.min(offsets.start, length);
    var end = typeof offsets.end === 'undefined' ? start : Math.min(offsets.end, length);
    if (!selection.extend && start > end) {
      var temp = end;
      end = start;
      start = temp;
    }
    var startMarker = getNodeForCharacterOffset(node, start);
    var endMarker = getNodeForCharacterOffset(node, end);
    if (startMarker && endMarker) {
      var range = document.createRange();
      range.setStart(startMarker.node, startMarker.offset);
      selection.removeAllRanges();
      if (start > end) {
        selection.addRange(range);
        selection.extend(endMarker.node, endMarker.offset);
      } else {
        range.setEnd(endMarker.node, endMarker.offset);
        selection.addRange(range);
      }
    }
  }
  var useIEOffsets = ExecutionEnvironment.canUseDOM && 'selection' in document && !('getSelection' in window);
  var ReactDOMSelection = {
    getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,
    setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
  };
  module.exports = ReactDOMSelection;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SyntheticKeyboardEvent", ["npm:react@0.14.0/lib/SyntheticUIEvent", "npm:react@0.14.0/lib/getEventCharCode", "npm:react@0.14.0/lib/getEventKey", "npm:react@0.14.0/lib/getEventModifierState"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var SyntheticUIEvent = require("npm:react@0.14.0/lib/SyntheticUIEvent");
  var getEventCharCode = require("npm:react@0.14.0/lib/getEventCharCode");
  var getEventKey = require("npm:react@0.14.0/lib/getEventKey");
  var getEventModifierState = require("npm:react@0.14.0/lib/getEventModifierState");
  var KeyboardEventInterface = {
    key: getEventKey,
    location: null,
    ctrlKey: null,
    shiftKey: null,
    altKey: null,
    metaKey: null,
    repeat: null,
    locale: null,
    getModifierState: getEventModifierState,
    charCode: function(event) {
      if (event.type === 'keypress') {
        return getEventCharCode(event);
      }
      return 0;
    },
    keyCode: function(event) {
      if (event.type === 'keydown' || event.type === 'keyup') {
        return event.keyCode;
      }
      return 0;
    },
    which: function(event) {
      if (event.type === 'keypress') {
        return getEventCharCode(event);
      }
      if (event.type === 'keydown' || event.type === 'keyup') {
        return event.keyCode;
      }
      return 0;
    }
  };
  function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
  }
  SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);
  module.exports = SyntheticKeyboardEvent;
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/performanceNow", ["npm:fbjs@0.3.1/lib/performance"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var performance = require("npm:fbjs@0.3.1/lib/performance");
  var curPerformance = performance;
  if (!curPerformance || !curPerformance.now) {
    curPerformance = Date;
  }
  var performanceNow = curPerformance.now.bind(curPerformance);
  module.exports = performanceNow;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactServerRendering", ["npm:react@0.14.0/lib/ReactDefaultBatchingStrategy", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactInstanceHandles", "npm:react@0.14.0/lib/ReactMarkupChecksum", "npm:react@0.14.0/lib/ReactServerBatchingStrategy", "npm:react@0.14.0/lib/ReactServerRenderingTransaction", "npm:react@0.14.0/lib/ReactUpdates", "npm:fbjs@0.3.1/lib/emptyObject", "npm:react@0.14.0/lib/instantiateReactComponent", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactDefaultBatchingStrategy = require("npm:react@0.14.0/lib/ReactDefaultBatchingStrategy");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactInstanceHandles = require("npm:react@0.14.0/lib/ReactInstanceHandles");
    var ReactMarkupChecksum = require("npm:react@0.14.0/lib/ReactMarkupChecksum");
    var ReactServerBatchingStrategy = require("npm:react@0.14.0/lib/ReactServerBatchingStrategy");
    var ReactServerRenderingTransaction = require("npm:react@0.14.0/lib/ReactServerRenderingTransaction");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var emptyObject = require("npm:fbjs@0.3.1/lib/emptyObject");
    var instantiateReactComponent = require("npm:react@0.14.0/lib/instantiateReactComponent");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function renderToString(element) {
      !ReactElement.isValidElement(element) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'renderToString(): You must pass a valid ReactElement.') : invariant(false) : undefined;
      var transaction;
      try {
        ReactUpdates.injection.injectBatchingStrategy(ReactServerBatchingStrategy);
        var id = ReactInstanceHandles.createReactRootID();
        transaction = ReactServerRenderingTransaction.getPooled(false);
        return transaction.perform(function() {
          var componentInstance = instantiateReactComponent(element, null);
          var markup = componentInstance.mountComponent(id, transaction, emptyObject);
          return ReactMarkupChecksum.addChecksumToMarkup(markup);
        }, null);
      } finally {
        ReactServerRenderingTransaction.release(transaction);
        ReactUpdates.injection.injectBatchingStrategy(ReactDefaultBatchingStrategy);
      }
    }
    function renderToStaticMarkup(element) {
      !ReactElement.isValidElement(element) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'renderToStaticMarkup(): You must pass a valid ReactElement.') : invariant(false) : undefined;
      var transaction;
      try {
        ReactUpdates.injection.injectBatchingStrategy(ReactServerBatchingStrategy);
        var id = ReactInstanceHandles.createReactRootID();
        transaction = ReactServerRenderingTransaction.getPooled(true);
        return transaction.perform(function() {
          var componentInstance = instantiateReactComponent(element, null);
          return componentInstance.mountComponent(id, transaction, emptyObject);
        }, null);
      } finally {
        ReactServerRenderingTransaction.release(transaction);
        ReactUpdates.injection.injectBatchingStrategy(ReactDefaultBatchingStrategy);
      }
    }
    module.exports = {
      renderToString: renderToString,
      renderToStaticMarkup: renderToStaticMarkup
    };
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMFactories", ["npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactElementValidator", "npm:fbjs@0.3.1/lib/mapObject", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactElementValidator = require("npm:react@0.14.0/lib/ReactElementValidator");
    var mapObject = require("npm:fbjs@0.3.1/lib/mapObject");
    function createDOMFactory(tag) {
      if (process.env.NODE_ENV !== 'production') {
        return ReactElementValidator.createFactory(tag);
      }
      return ReactElement.createFactory(tag);
    }
    var ReactDOMFactories = mapObject({
      a: 'a',
      abbr: 'abbr',
      address: 'address',
      area: 'area',
      article: 'article',
      aside: 'aside',
      audio: 'audio',
      b: 'b',
      base: 'base',
      bdi: 'bdi',
      bdo: 'bdo',
      big: 'big',
      blockquote: 'blockquote',
      body: 'body',
      br: 'br',
      button: 'button',
      canvas: 'canvas',
      caption: 'caption',
      cite: 'cite',
      code: 'code',
      col: 'col',
      colgroup: 'colgroup',
      data: 'data',
      datalist: 'datalist',
      dd: 'dd',
      del: 'del',
      details: 'details',
      dfn: 'dfn',
      dialog: 'dialog',
      div: 'div',
      dl: 'dl',
      dt: 'dt',
      em: 'em',
      embed: 'embed',
      fieldset: 'fieldset',
      figcaption: 'figcaption',
      figure: 'figure',
      footer: 'footer',
      form: 'form',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      head: 'head',
      header: 'header',
      hgroup: 'hgroup',
      hr: 'hr',
      html: 'html',
      i: 'i',
      iframe: 'iframe',
      img: 'img',
      input: 'input',
      ins: 'ins',
      kbd: 'kbd',
      keygen: 'keygen',
      label: 'label',
      legend: 'legend',
      li: 'li',
      link: 'link',
      main: 'main',
      map: 'map',
      mark: 'mark',
      menu: 'menu',
      menuitem: 'menuitem',
      meta: 'meta',
      meter: 'meter',
      nav: 'nav',
      noscript: 'noscript',
      object: 'object',
      ol: 'ol',
      optgroup: 'optgroup',
      option: 'option',
      output: 'output',
      p: 'p',
      param: 'param',
      picture: 'picture',
      pre: 'pre',
      progress: 'progress',
      q: 'q',
      rp: 'rp',
      rt: 'rt',
      ruby: 'ruby',
      s: 's',
      samp: 'samp',
      script: 'script',
      section: 'section',
      select: 'select',
      small: 'small',
      source: 'source',
      span: 'span',
      strong: 'strong',
      style: 'style',
      sub: 'sub',
      summary: 'summary',
      sup: 'sup',
      table: 'table',
      tbody: 'tbody',
      td: 'td',
      textarea: 'textarea',
      tfoot: 'tfoot',
      th: 'th',
      thead: 'thead',
      time: 'time',
      title: 'title',
      tr: 'tr',
      track: 'track',
      u: 'u',
      ul: 'ul',
      'var': 'var',
      video: 'video',
      wbr: 'wbr',
      circle: 'circle',
      clipPath: 'clipPath',
      defs: 'defs',
      ellipse: 'ellipse',
      g: 'g',
      image: 'image',
      line: 'line',
      linearGradient: 'linearGradient',
      mask: 'mask',
      path: 'path',
      pattern: 'pattern',
      polygon: 'polygon',
      polyline: 'polyline',
      radialGradient: 'radialGradient',
      rect: 'rect',
      stop: 'stop',
      svg: 'svg',
      text: 'text',
      tspan: 'tspan'
    }, createDOMFactory);
    module.exports = ReactDOMFactories;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dom@0.14.0", ["npm:react-dom@0.14.0/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:react-dom@0.14.0/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$", ["npm:core-js@0.9.18/library/modules/$.fw"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var global = typeof self != 'undefined' ? self : Function('return this')(),
      core = {},
      defineProperty = Object.defineProperty,
      hasOwnProperty = {}.hasOwnProperty,
      ceil = Math.ceil,
      floor = Math.floor,
      max = Math.max,
      min = Math.min;
  var DESC = !!function() {
    try {
      return defineProperty({}, 'a', {get: function() {
          return 2;
        }}).a == 2;
    } catch (e) {}
  }();
  var hide = createDefiner(1);
  function toInteger(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  }
  function desc(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  }
  function simpleSet(object, key, value) {
    object[key] = value;
    return object;
  }
  function createDefiner(bitmap) {
    return DESC ? function(object, key, value) {
      return $.setDesc(object, key, desc(bitmap, value));
    } : simpleSet;
  }
  function isObject(it) {
    return it !== null && (typeof it == 'object' || typeof it == 'function');
  }
  function isFunction(it) {
    return typeof it == 'function';
  }
  function assertDefined(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  }
  var $ = module.exports = require("npm:core-js@0.9.18/library/modules/$.fw")({
    g: global,
    core: core,
    html: global.document && document.documentElement,
    isObject: isObject,
    isFunction: isFunction,
    that: function() {
      return this;
    },
    toInteger: toInteger,
    toLength: function(it) {
      return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
    },
    toIndex: function(index, length) {
      index = toInteger(index);
      return index < 0 ? max(index + length, 0) : min(index, length);
    },
    has: function(it, key) {
      return hasOwnProperty.call(it, key);
    },
    create: Object.create,
    getProto: Object.getPrototypeOf,
    DESC: DESC,
    desc: desc,
    getDesc: Object.getOwnPropertyDescriptor,
    setDesc: defineProperty,
    setDescs: Object.defineProperties,
    getKeys: Object.keys,
    getNames: Object.getOwnPropertyNames,
    getSymbols: Object.getOwnPropertySymbols,
    assertDefined: assertDefined,
    ES5Object: Object,
    toObject: function(it) {
      return $.ES5Object(assertDefined(it));
    },
    hide: hide,
    def: createDefiner(0),
    set: global.Symbol ? simpleSet : hide,
    each: [].forEach
  });
  if (typeof __e != 'undefined')
    __e = core;
  if (typeof __g != 'undefined')
    __g = global;
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/es6.object.statics-accept-primitives", ["npm:core-js@0.9.18/library/modules/$", "npm:core-js@0.9.18/library/modules/$.def", "npm:core-js@0.9.18/library/modules/$.get-names"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      $def = require("npm:core-js@0.9.18/library/modules/$.def"),
      isObject = $.isObject,
      toObject = $.toObject;
  $.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' + 'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(','), function(KEY, ID) {
    var fn = ($.core.Object || {})[KEY] || Object[KEY],
        forced = 0,
        method = {};
    method[KEY] = ID == 0 ? function freeze(it) {
      return isObject(it) ? fn(it) : it;
    } : ID == 1 ? function seal(it) {
      return isObject(it) ? fn(it) : it;
    } : ID == 2 ? function preventExtensions(it) {
      return isObject(it) ? fn(it) : it;
    } : ID == 3 ? function isFrozen(it) {
      return isObject(it) ? fn(it) : true;
    } : ID == 4 ? function isSealed(it) {
      return isObject(it) ? fn(it) : true;
    } : ID == 5 ? function isExtensible(it) {
      return isObject(it) ? fn(it) : false;
    } : ID == 6 ? function getOwnPropertyDescriptor(it, key) {
      return fn(toObject(it), key);
    } : ID == 7 ? function getPrototypeOf(it) {
      return fn(Object($.assertDefined(it)));
    } : ID == 8 ? function keys(it) {
      return fn(toObject(it));
    } : require("npm:core-js@0.9.18/library/modules/$.get-names").get;
    try {
      fn('z');
    } catch (e) {
      forced = 1;
    }
    $def($def.S + $def.F * forced, 'Object', method);
  });
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/core-js/object/create", ["npm:core-js@0.9.18/library/fn/object/create"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/create"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.set-proto", ["npm:core-js@0.9.18/library/modules/$", "npm:core-js@0.9.18/library/modules/$.assert", "npm:core-js@0.9.18/library/modules/$.ctx"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      assert = require("npm:core-js@0.9.18/library/modules/$.assert");
  function check(O, proto) {
    assert.obj(O);
    assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
  }
  module.exports = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? function(buggy, set) {
      try {
        set = require("npm:core-js@0.9.18/library/modules/$.ctx")(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
        set({}, []);
      } catch (e) {
        buggy = true;
      }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy)
          O.__proto__ = proto;
        else
          set(O, proto);
        return O;
      };
    }() : undefined),
    check: check
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/core-js/object/define-property", ["npm:core-js@0.9.18/library/fn/object/define-property"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/define-property"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/createStore", ["npm:redux@3.0.2/lib/utils/isPlainObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = createStore;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _utilsIsPlainObject = require("npm:redux@3.0.2/lib/utils/isPlainObject");
  var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);
  var ActionTypes = {INIT: '@@redux/INIT'};
  exports.ActionTypes = ActionTypes;
  function createStore(reducer, initialState) {
    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }
    var currentReducer = reducer;
    var currentState = initialState;
    var listeners = [];
    var isDispatching = false;
    function getState() {
      return currentState;
    }
    function subscribe(listener) {
      listeners.push(listener);
      return function unsubscribe() {
        var index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    }
    function dispatch(action) {
      if (!_utilsIsPlainObject2['default'](action)) {
        throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
      }
      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
      }
      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }
      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }
      listeners.slice().forEach(function(listener) {
        return listener();
      });
      return action;
    }
    function replaceReducer(nextReducer) {
      currentReducer = nextReducer;
      dispatch({type: ActionTypes.INIT});
    }
    dispatch({type: ActionTypes.INIT});
    return {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    };
  }
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/lang/isFunction", ["npm:lodash@3.10.1/lang/isObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isObject = require("npm:lodash@3.10.1/lang/isObject");
  var funcTag = '[object Function]';
  var objectProto = Object.prototype;
  var objToString = objectProto.toString;
  function isFunction(value) {
    return isObject(value) && objToString.call(value) == funcTag;
  }
  module.exports = isFunction;
  global.define = __define;
  return module.exports;
});

System.register("npm:invariant@2.1.1", ["npm:invariant@2.1.1/browser"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:invariant@2.1.1/browser");
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseIndexOf", ["npm:lodash@3.10.1/internal/indexOfNaN"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var indexOfNaN = require("npm:lodash@3.10.1/internal/indexOfNaN");
  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  module.exports = baseIndexOf;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/SetCache", ["npm:lodash@3.10.1/internal/cachePush", "npm:lodash@3.10.1/internal/getNative"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var cachePush = require("npm:lodash@3.10.1/internal/cachePush"),
      getNative = require("npm:lodash@3.10.1/internal/getNative");
  var Set = getNative(global, 'Set');
  var nativeCreate = getNative(Object, 'create');
  function SetCache(values) {
    var length = values ? values.length : 0;
    this.data = {
      'hash': nativeCreate(null),
      'set': new Set
    };
    while (length--) {
      this.push(values[length]);
    }
  }
  SetCache.prototype.push = cachePush;
  module.exports = SetCache;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/getLength", ["npm:lodash@3.10.1/internal/baseProperty"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseProperty = require("npm:lodash@3.10.1/internal/baseProperty");
  var getLength = baseProperty('length');
  module.exports = getLength;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/array/xor", ["npm:lodash@3.10.1/internal/arrayPush", "npm:lodash@3.10.1/internal/baseDifference", "npm:lodash@3.10.1/internal/baseUniq", "npm:lodash@3.10.1/internal/isArrayLike"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var arrayPush = require("npm:lodash@3.10.1/internal/arrayPush"),
      baseDifference = require("npm:lodash@3.10.1/internal/baseDifference"),
      baseUniq = require("npm:lodash@3.10.1/internal/baseUniq"),
      isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike");
  function xor() {
    var index = -1,
        length = arguments.length;
    while (++index < length) {
      var array = arguments[index];
      if (isArrayLike(array)) {
        var result = result ? arrayPush(baseDifference(result, array), baseDifference(array, result)) : array;
      }
    }
    return result ? baseUniq(result) : [];
  }
  module.exports = xor;
  global.define = __define;
  return module.exports;
});

System.register("npm:keymirror@0.1.1", ["npm:keymirror@0.1.1/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:keymirror@0.1.1/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/backends/createTestBackend", ["npm:lodash@3.10.1/utility/noop"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = createBackend;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var _lodashUtilityNoop = require("npm:lodash@3.10.1/utility/noop");
  var _lodashUtilityNoop2 = _interopRequireDefault(_lodashUtilityNoop);
  var TestBackend = (function() {
    function TestBackend(manager) {
      _classCallCheck(this, TestBackend);
      this.actions = manager.getActions();
    }
    TestBackend.prototype.setup = function setup() {
      this.didCallSetup = true;
    };
    TestBackend.prototype.teardown = function teardown() {
      this.didCallTeardown = true;
    };
    TestBackend.prototype.connectDragSource = function connectDragSource() {
      return _lodashUtilityNoop2['default'];
    };
    TestBackend.prototype.connectDragPreview = function connectDragPreview() {
      return _lodashUtilityNoop2['default'];
    };
    TestBackend.prototype.connectDropTarget = function connectDropTarget() {
      return _lodashUtilityNoop2['default'];
    };
    TestBackend.prototype.simulateBeginDrag = function simulateBeginDrag(sourceIds, options) {
      this.actions.beginDrag(sourceIds, options);
    };
    TestBackend.prototype.simulatePublishDragSource = function simulatePublishDragSource() {
      this.actions.publishDragSource();
    };
    TestBackend.prototype.simulateHover = function simulateHover(targetIds, options) {
      this.actions.hover(targetIds, options);
    };
    TestBackend.prototype.simulateDrop = function simulateDrop() {
      this.actions.drop();
    };
    TestBackend.prototype.simulateEndDrag = function simulateEndDrag() {
      this.actions.endDrag();
    };
    return TestBackend;
  })();
  function createBackend(manager) {
    return new TestBackend(manager);
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/createBaseFor", ["npm:lodash@3.10.1/internal/toObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var toObject = require("npm:lodash@3.10.1/internal/toObject");
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var iterable = toObject(object),
          props = keysFunc(object),
          length = props.length,
          index = fromRight ? length : -1;
      while ((fromRight ? index-- : ++index < length)) {
        var key = props[index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  module.exports = createBaseFor;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/object/keysIn", ["npm:lodash@3.10.1/lang/isArguments", "npm:lodash@3.10.1/lang/isArray", "npm:lodash@3.10.1/internal/isIndex", "npm:lodash@3.10.1/internal/isLength", "npm:lodash@3.10.1/lang/isObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isArguments = require("npm:lodash@3.10.1/lang/isArguments"),
      isArray = require("npm:lodash@3.10.1/lang/isArray"),
      isIndex = require("npm:lodash@3.10.1/internal/isIndex"),
      isLength = require("npm:lodash@3.10.1/internal/isLength"),
      isObject = require("npm:lodash@3.10.1/lang/isObject");
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function keysIn(object) {
    if (object == null) {
      return [];
    }
    if (!isObject(object)) {
      object = Object(object);
    }
    var length = object.length;
    length = (length && isLength(length) && (isArray(object) || isArguments(object)) && length) || 0;
    var Ctor = object.constructor,
        index = -1,
        isProto = typeof Ctor == 'function' && Ctor.prototype === object,
        result = Array(length),
        skipIndexes = length > 0;
    while (++index < length) {
      result[index] = (index + '');
    }
    for (var key in object) {
      if (!(skipIndexes && isIndex(key, length)) && !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = keysIn;
  global.define = __define;
  return module.exports;
});

System.register("npm:disposables@1.0.1/modules/index", ["npm:disposables@1.0.1/modules/isDisposable", "npm:disposables@1.0.1/modules/Disposable", "npm:disposables@1.0.1/modules/CompositeDisposable", "npm:disposables@1.0.1/modules/SerialDisposable"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var _interopRequireWildcard = function(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  };
  exports.__esModule = true;
  var _isDisposable2 = require("npm:disposables@1.0.1/modules/isDisposable");
  var _isDisposable3 = _interopRequireWildcard(_isDisposable2);
  exports.isDisposable = _isDisposable3['default'];
  var _Disposable2 = require("npm:disposables@1.0.1/modules/Disposable");
  var _Disposable3 = _interopRequireWildcard(_Disposable2);
  exports.Disposable = _Disposable3['default'];
  var _CompositeDisposable2 = require("npm:disposables@1.0.1/modules/CompositeDisposable");
  var _CompositeDisposable3 = _interopRequireWildcard(_CompositeDisposable2);
  exports.CompositeDisposable = _CompositeDisposable3['default'];
  var _SerialDisposable2 = require("npm:disposables@1.0.1/modules/SerialDisposable");
  var _SerialDisposable3 = _interopRequireWildcard(_SerialDisposable2);
  exports.SerialDisposable = _SerialDisposable3['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/bindConnectorMethod", ["npm:react-dnd@1.1.8/modules/utils/shallowEqual", "npm:react-dnd@1.1.8/modules/utils/cloneWithRef", "npm:disposables@1.0.1", "npm:react@0.14.0"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = bindConnectorMethod;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _utilsShallowEqual = require("npm:react-dnd@1.1.8/modules/utils/shallowEqual");
  var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
  var _utilsCloneWithRef = require("npm:react-dnd@1.1.8/modules/utils/cloneWithRef");
  var _utilsCloneWithRef2 = _interopRequireDefault(_utilsCloneWithRef);
  var _disposables = require("npm:disposables@1.0.1");
  var _react = require("npm:react@0.14.0");
  function bindConnectorMethod(handlerId, connect) {
    var disposable = new _disposables.SerialDisposable();
    var currentNode = null;
    var currentOptions = null;
    function ref(nextWhatever, nextOptions) {
      if (_react.isValidElement(nextWhatever)) {
        var nextElement = nextWhatever;
        return _utilsCloneWithRef2['default'](nextElement, function(inst) {
          return ref(inst, nextOptions);
        });
      }
      var nextNode = _react.findDOMNode(nextWhatever);
      if (nextNode === currentNode && _utilsShallowEqual2['default'](currentOptions, nextOptions)) {
        return ;
      }
      currentNode = nextNode;
      currentOptions = nextOptions;
      if (!nextNode) {
        disposable.setDisposable(null);
        return ;
      }
      var currentDispose = connect(handlerId, nextNode, nextOptions);
      disposable.setDisposable(new _disposables.Disposable(currentDispose));
    }
    return {
      ref: ref,
      disposable: disposable
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/DropTarget", ["npm:react@0.14.0", "npm:react-dnd@1.1.8/modules/utils/shallowEqual", "npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar", "npm:invariant@2.1.1", "npm:lodash@3.10.1/lang/isPlainObject", "npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments", "npm:react-dnd@1.1.8/modules/decorateHandler", "npm:react-dnd@1.1.8/modules/registerTarget", "npm:react-dnd@1.1.8/modules/createTargetFactory", "npm:react-dnd@1.1.8/modules/createTargetMonitor", "npm:react-dnd@1.1.8/modules/createTargetConnector", "npm:react-dnd@1.1.8/modules/utils/isValidType"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _slice = Array.prototype.slice;
  exports['default'] = DropTarget;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _react = require("npm:react@0.14.0");
  var _react2 = _interopRequireDefault(_react);
  var _utilsShallowEqual = require("npm:react-dnd@1.1.8/modules/utils/shallowEqual");
  var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
  var _utilsShallowEqualScalar = require("npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar");
  var _utilsShallowEqualScalar2 = _interopRequireDefault(_utilsShallowEqualScalar);
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _lodashLangIsPlainObject = require("npm:lodash@3.10.1/lang/isPlainObject");
  var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);
  var _utilsCheckDecoratorArguments = require("npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments");
  var _utilsCheckDecoratorArguments2 = _interopRequireDefault(_utilsCheckDecoratorArguments);
  var _decorateHandler = require("npm:react-dnd@1.1.8/modules/decorateHandler");
  var _decorateHandler2 = _interopRequireDefault(_decorateHandler);
  var _registerTarget = require("npm:react-dnd@1.1.8/modules/registerTarget");
  var _registerTarget2 = _interopRequireDefault(_registerTarget);
  var _createTargetFactory = require("npm:react-dnd@1.1.8/modules/createTargetFactory");
  var _createTargetFactory2 = _interopRequireDefault(_createTargetFactory);
  var _createTargetMonitor = require("npm:react-dnd@1.1.8/modules/createTargetMonitor");
  var _createTargetMonitor2 = _interopRequireDefault(_createTargetMonitor);
  var _createTargetConnector = require("npm:react-dnd@1.1.8/modules/createTargetConnector");
  var _createTargetConnector2 = _interopRequireDefault(_createTargetConnector);
  var _utilsIsValidType = require("npm:react-dnd@1.1.8/modules/utils/isValidType");
  var _utilsIsValidType2 = _interopRequireDefault(_utilsIsValidType);
  function DropTarget(type, spec, collect) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    _utilsCheckDecoratorArguments2['default'].apply(undefined, ['DropTarget', 'type, spec, collect[, options]'].concat(_slice.call(arguments)));
    var getType = type;
    if (typeof type !== 'function') {
      _invariant2['default'](_utilsIsValidType2['default'](type, true), 'Expected "type" provided as the first argument to DropTarget to be ' + 'a string, an array of strings, or a function that returns either given ' + 'the current props. Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', type);
      getType = function() {
        return type;
      };
    }
    _invariant2['default'](_lodashLangIsPlainObject2['default'](spec), 'Expected "spec" provided as the second argument to DropTarget to be ' + 'a plain object. Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', spec);
    var createTarget = _createTargetFactory2['default'](spec);
    _invariant2['default'](typeof collect === 'function', 'Expected "collect" provided as the third argument to DropTarget to be ' + 'a function that returns a plain object of props to inject. ' + 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', collect);
    _invariant2['default'](_lodashLangIsPlainObject2['default'](options), 'Expected "options" provided as the fourth argument to DropTarget to be ' + 'a plain object when specified. ' + 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drop-target.html', collect);
    return function decorateTarget(DecoratedComponent) {
      return _decorateHandler2['default']({
        connectBackend: function connectBackend(backend, targetId) {
          return backend.connectDropTarget(targetId);
        },
        containerDisplayName: 'DropTarget',
        createHandler: createTarget,
        registerHandler: _registerTarget2['default'],
        createMonitor: _createTargetMonitor2['default'],
        createConnector: _createTargetConnector2['default'],
        DecoratedComponent: DecoratedComponent,
        getType: getType,
        collect: collect,
        options: options
      });
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:immutable@3.7.5", ["npm:immutable@3.7.5/dist/immutable"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:immutable@3.7.5/dist/immutable");
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.wks", ["npm:core-js@0.9.18/library/modules/$", "npm:core-js@0.9.18/library/modules/$.shared", "npm:core-js@0.9.18/library/modules/$.uid"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var global = require("npm:core-js@0.9.18/library/modules/$").g,
      store = require("npm:core-js@0.9.18/library/modules/$.shared")('wks');
  module.exports = function(name) {
    return store[name] || (store[name] = global.Symbol && global.Symbol[name] || require("npm:core-js@0.9.18/library/modules/$.uid").safe('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:classnames@2.1.5", ["npm:classnames@2.1.5/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:classnames@2.1.5/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/array/union", ["npm:lodash@3.10.1/internal/baseFlatten", "npm:lodash@3.10.1/internal/baseUniq", "npm:lodash@3.10.1/function/restParam"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseFlatten = require("npm:lodash@3.10.1/internal/baseFlatten"),
      baseUniq = require("npm:lodash@3.10.1/internal/baseUniq"),
      restParam = require("npm:lodash@3.10.1/function/restParam");
  var union = restParam(function(arrays) {
    return baseUniq(baseFlatten(arrays, false, true));
  });
  module.exports = union;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/MapCache", ["npm:lodash@3.10.1/internal/mapDelete", "npm:lodash@3.10.1/internal/mapGet", "npm:lodash@3.10.1/internal/mapHas", "npm:lodash@3.10.1/internal/mapSet"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var mapDelete = require("npm:lodash@3.10.1/internal/mapDelete"),
      mapGet = require("npm:lodash@3.10.1/internal/mapGet"),
      mapHas = require("npm:lodash@3.10.1/internal/mapHas"),
      mapSet = require("npm:lodash@3.10.1/internal/mapSet");
  function MapCache() {
    this.__data__ = {};
  }
  MapCache.prototype['delete'] = mapDelete;
  MapCache.prototype.get = mapGet;
  MapCache.prototype.has = mapHas;
  MapCache.prototype.set = mapSet;
  module.exports = MapCache;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/OffsetHelpers", ["npm:react-dnd@1.1.8/modules/utils/BrowserDetector", "npm:react-dnd@1.1.8/modules/utils/createMonotonicInterpolant"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports.getElementClientOffset = getElementClientOffset;
  exports.getEventClientOffset = getEventClientOffset;
  exports.getDragPreviewOffset = getDragPreviewOffset;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _BrowserDetector = require("npm:react-dnd@1.1.8/modules/utils/BrowserDetector");
  var _createMonotonicInterpolant = require("npm:react-dnd@1.1.8/modules/utils/createMonotonicInterpolant");
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
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/object/keys", ["npm:lodash@3.10.1/internal/getNative", "npm:lodash@3.10.1/internal/isArrayLike", "npm:lodash@3.10.1/lang/isObject", "npm:lodash@3.10.1/internal/shimKeys"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var getNative = require("npm:lodash@3.10.1/internal/getNative"),
      isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike"),
      isObject = require("npm:lodash@3.10.1/lang/isObject"),
      shimKeys = require("npm:lodash@3.10.1/internal/shimKeys");
  var nativeKeys = getNative(Object, 'keys');
  var keys = !nativeKeys ? shimKeys : function(object) {
    var Ctor = object == null ? undefined : object.constructor;
    if ((typeof Ctor == 'function' && Ctor.prototype === object) || (typeof object != 'function' && isArrayLike(object))) {
      return shimKeys(object);
    }
    return isObject(object) ? nativeKeys(object) : [];
  };
  module.exports = keys;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseAssign", ["npm:lodash@3.10.1/internal/baseCopy", "npm:lodash@3.10.1/object/keys"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseCopy = require("npm:lodash@3.10.1/internal/baseCopy"),
      keys = require("npm:lodash@3.10.1/object/keys");
  function baseAssign(object, source) {
    return source == null ? object : baseCopy(source, keys(source), object);
  }
  module.exports = baseAssign;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/bindCallback", ["npm:lodash@3.10.1/utility/identity"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var identity = require("npm:lodash@3.10.1/utility/identity");
  function bindCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    if (thisArg === undefined) {
      return func;
    }
    switch (argCount) {
      case 1:
        return function(value) {
          return func.call(thisArg, value);
        };
      case 3:
        return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
      case 4:
        return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      case 5:
        return function(value, other, key, object, source) {
          return func.call(thisArg, value, other, key, object, source);
        };
    }
    return function() {
      return func.apply(thisArg, arguments);
    };
  }
  module.exports = bindCallback;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/components/createProvider", ["npm:react-redux@3.1.0/lib/utils/createStoreShape"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = createProvider;
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
  var _utilsCreateStoreShape = require("npm:react-redux@3.1.0/lib/utils/createStoreShape");
  var _utilsCreateStoreShape2 = _interopRequireDefault(_utilsCreateStoreShape);
  function isUsingOwnerContext(React) {
    var version = React.version;
    if (typeof version !== 'string') {
      return true;
    }
    var sections = version.split('.');
    var major = parseInt(sections[0], 10);
    var minor = parseInt(sections[1], 10);
    return major === 0 && minor === 13;
  }
  function createProvider(React) {
    var Component = React.Component;
    var PropTypes = React.PropTypes;
    var Children = React.Children;
    var storeShape = _utilsCreateStoreShape2['default'](PropTypes);
    var requireFunctionChild = isUsingOwnerContext(React);
    var didWarnAboutChild = false;
    function warnAboutFunctionChild() {
      if (didWarnAboutChild || requireFunctionChild) {
        return ;
      }
      didWarnAboutChild = true;
      console.error('With React 0.14 and later versions, you no longer need to ' + 'wrap <Provider> child into a function.');
    }
    function warnAboutElementChild() {
      if (didWarnAboutChild || !requireFunctionChild) {
        return ;
      }
      didWarnAboutChild = true;
      console.error('With React 0.13, you need to ' + 'wrap <Provider> child into a function. ' + 'This restriction will be removed with React 0.14.');
    }
    var didWarnAboutReceivingStore = false;
    function warnAboutReceivingStore() {
      if (didWarnAboutReceivingStore) {
        return ;
      }
      didWarnAboutReceivingStore = true;
      console.error('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/rackt/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
    }
    var Provider = (function(_Component) {
      _inherits(Provider, _Component);
      Provider.prototype.getChildContext = function getChildContext() {
        return {store: this.store};
      };
      function Provider(props, context) {
        _classCallCheck(this, Provider);
        _Component.call(this, props, context);
        this.store = props.store;
      }
      Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        var store = this.store;
        var nextStore = nextProps.store;
        if (store !== nextStore) {
          warnAboutReceivingStore();
        }
      };
      Provider.prototype.render = function render() {
        var children = this.props.children;
        if (typeof children === 'function') {
          warnAboutFunctionChild();
          children = children();
        } else {
          warnAboutElementChild();
        }
        return Children.only(children);
      };
      return Provider;
    })(Component);
    Provider.childContextTypes = {store: storeShape.isRequired};
    Provider.propTypes = {
      store: storeShape.isRequired,
      children: (requireFunctionChild ? PropTypes.func : PropTypes.element).isRequired
    };
    return Provider;
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/combineReducers", ["npm:redux@3.0.2/lib/createStore", "npm:redux@3.0.2/lib/utils/isPlainObject", "npm:redux@3.0.2/lib/utils/mapValues", "npm:redux@3.0.2/lib/utils/pick", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    exports['default'] = combineReducers;
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {'default': obj};
    }
    var _createStore = require("npm:redux@3.0.2/lib/createStore");
    var _utilsIsPlainObject = require("npm:redux@3.0.2/lib/utils/isPlainObject");
    var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);
    var _utilsMapValues = require("npm:redux@3.0.2/lib/utils/mapValues");
    var _utilsMapValues2 = _interopRequireDefault(_utilsMapValues);
    var _utilsPick = require("npm:redux@3.0.2/lib/utils/pick");
    var _utilsPick2 = _interopRequireDefault(_utilsPick);
    function getUndefinedStateErrorMessage(key, action) {
      var actionType = action && action.type;
      var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
      return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
    }
    function getUnexpectedStateKeyWarningMessage(inputState, outputState, action) {
      var reducerKeys = Object.keys(outputState);
      var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';
      if (reducerKeys.length === 0) {
        return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
      }
      if (!_utilsIsPlainObject2['default'](inputState)) {
        return 'The ' + argumentName + ' has unexpected type of "' + ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
      }
      var unexpectedKeys = Object.keys(inputState).filter(function(key) {
        return reducerKeys.indexOf(key) < 0;
      });
      if (unexpectedKeys.length > 0) {
        return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
      }
    }
    function assertReducerSanity(reducers) {
      Object.keys(reducers).forEach(function(key) {
        var reducer = reducers[key];
        var initialState = reducer(undefined, {type: _createStore.ActionTypes.INIT});
        if (typeof initialState === 'undefined') {
          throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
        }
        var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
        if (typeof reducer(undefined, {type: type}) === 'undefined') {
          throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
        }
      });
    }
    function combineReducers(reducers) {
      var finalReducers = _utilsPick2['default'](reducers, function(val) {
        return typeof val === 'function';
      });
      var sanityError;
      try {
        assertReducerSanity(finalReducers);
      } catch (e) {
        sanityError = e;
      }
      var defaultState = _utilsMapValues2['default'](finalReducers, function() {
        return undefined;
      });
      return function combination(state, action) {
        if (state === undefined)
          state = defaultState;
        if (sanityError) {
          throw sanityError;
        }
        var finalState = _utilsMapValues2['default'](finalReducers, function(reducer, key) {
          var newState = reducer(state[key], action);
          if (typeof newState === 'undefined') {
            var errorMessage = getUndefinedStateErrorMessage(key, action);
            throw new Error(errorMessage);
          }
          return newState;
        });
        if (process.env.NODE_ENV !== 'production') {
          var warningMessage = getUnexpectedStateKeyWarningMessage(state, finalState, action);
          if (warningMessage) {
            console.error(warningMessage);
          }
        }
        return finalState;
      };
    }
    module.exports = exports['default'];
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/utils/applyMiddleware", ["npm:redux@3.0.2/lib/utils/compose"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  exports['default'] = applyMiddleware;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _compose = require("npm:redux@3.0.2/lib/utils/compose");
  var _compose2 = _interopRequireDefault(_compose);
  function applyMiddleware() {
    for (var _len = arguments.length,
        middlewares = Array(_len),
        _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }
    return function(next) {
      return function(reducer, initialState) {
        var store = next(reducer, initialState);
        var _dispatch = store.dispatch;
        var chain = [];
        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch(action) {
            return _dispatch(action);
          }
        };
        chain = middlewares.map(function(middleware) {
          return middleware(middlewareAPI);
        });
        _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);
        return _extends({}, store, {dispatch: _dispatch});
      };
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:hoist-non-react-statics@1.0.3", ["npm:hoist-non-react-statics@1.0.3/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:hoist-non-react-statics@1.0.3/index");
  global.define = __define;
  return module.exports;
});

System.register("github:jspm/nodelibs-process@0.1.2/index", ["npm:process@0.11.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = System._nodeRequire ? process : require("npm:process@0.11.2");
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/EventPluginHub", ["npm:react@0.14.0/lib/EventPluginRegistry", "npm:react@0.14.0/lib/EventPluginUtils", "npm:react@0.14.0/lib/ReactErrorUtils", "npm:react@0.14.0/lib/accumulateInto", "npm:react@0.14.0/lib/forEachAccumulated", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventPluginRegistry = require("npm:react@0.14.0/lib/EventPluginRegistry");
    var EventPluginUtils = require("npm:react@0.14.0/lib/EventPluginUtils");
    var ReactErrorUtils = require("npm:react@0.14.0/lib/ReactErrorUtils");
    var accumulateInto = require("npm:react@0.14.0/lib/accumulateInto");
    var forEachAccumulated = require("npm:react@0.14.0/lib/forEachAccumulated");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var listenerBank = {};
    var eventQueue = null;
    var executeDispatchesAndRelease = function(event, simulated) {
      if (event) {
        EventPluginUtils.executeDispatchesInOrder(event, simulated);
        if (!event.isPersistent()) {
          event.constructor.release(event);
        }
      }
    };
    var executeDispatchesAndReleaseSimulated = function(e) {
      return executeDispatchesAndRelease(e, true);
    };
    var executeDispatchesAndReleaseTopLevel = function(e) {
      return executeDispatchesAndRelease(e, false);
    };
    var InstanceHandle = null;
    function validateInstanceHandle() {
      var valid = InstanceHandle && InstanceHandle.traverseTwoPhase && InstanceHandle.traverseEnterLeave;
      process.env.NODE_ENV !== 'production' ? warning(valid, 'InstanceHandle not injected before use!') : undefined;
    }
    var EventPluginHub = {
      injection: {
        injectMount: EventPluginUtils.injection.injectMount,
        injectInstanceHandle: function(InjectedInstanceHandle) {
          InstanceHandle = InjectedInstanceHandle;
          if (process.env.NODE_ENV !== 'production') {
            validateInstanceHandle();
          }
        },
        getInstanceHandle: function() {
          if (process.env.NODE_ENV !== 'production') {
            validateInstanceHandle();
          }
          return InstanceHandle;
        },
        injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,
        injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName
      },
      eventNameDispatchConfigs: EventPluginRegistry.eventNameDispatchConfigs,
      registrationNameModules: EventPluginRegistry.registrationNameModules,
      putListener: function(id, registrationName, listener) {
        !(typeof listener === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected %s listener to be a function, instead got type %s', registrationName, typeof listener) : invariant(false) : undefined;
        var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
        bankForRegistrationName[id] = listener;
        var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
        if (PluginModule && PluginModule.didPutListener) {
          PluginModule.didPutListener(id, registrationName, listener);
        }
      },
      getListener: function(id, registrationName) {
        var bankForRegistrationName = listenerBank[registrationName];
        return bankForRegistrationName && bankForRegistrationName[id];
      },
      deleteListener: function(id, registrationName) {
        var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
        if (PluginModule && PluginModule.willDeleteListener) {
          PluginModule.willDeleteListener(id, registrationName);
        }
        var bankForRegistrationName = listenerBank[registrationName];
        if (bankForRegistrationName) {
          delete bankForRegistrationName[id];
        }
      },
      deleteAllListeners: function(id) {
        for (var registrationName in listenerBank) {
          if (!listenerBank[registrationName][id]) {
            continue;
          }
          var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
          if (PluginModule && PluginModule.willDeleteListener) {
            PluginModule.willDeleteListener(id, registrationName);
          }
          delete listenerBank[registrationName][id];
        }
      },
      extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
        var events;
        var plugins = EventPluginRegistry.plugins;
        for (var i = 0; i < plugins.length; i++) {
          var possiblePlugin = plugins[i];
          if (possiblePlugin) {
            var extractedEvents = possiblePlugin.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
            if (extractedEvents) {
              events = accumulateInto(events, extractedEvents);
            }
          }
        }
        return events;
      },
      enqueueEvents: function(events) {
        if (events) {
          eventQueue = accumulateInto(eventQueue, events);
        }
      },
      processEventQueue: function(simulated) {
        var processingEventQueue = eventQueue;
        eventQueue = null;
        if (simulated) {
          forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
        } else {
          forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
        }
        !!eventQueue ? process.env.NODE_ENV !== 'production' ? invariant(false, 'processEventQueue(): Additional events were enqueued while processing ' + 'an event queue. Support for this has not yet been implemented.') : invariant(false) : undefined;
        ReactErrorUtils.rethrowCaughtError();
      },
      __purge: function() {
        listenerBank = {};
      },
      __getListenerBank: function() {
        return listenerBank;
      }
    };
    module.exports = EventPluginHub;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactReconciler", ["npm:react@0.14.0/lib/ReactRef"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactRef = require("npm:react@0.14.0/lib/ReactRef");
  function attachRefs() {
    ReactRef.attachRefs(this, this._currentElement);
  }
  var ReactReconciler = {
    mountComponent: function(internalInstance, rootID, transaction, context) {
      var markup = internalInstance.mountComponent(rootID, transaction, context);
      if (internalInstance._currentElement && internalInstance._currentElement.ref != null) {
        transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
      }
      return markup;
    },
    unmountComponent: function(internalInstance) {
      ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
      internalInstance.unmountComponent();
    },
    receiveComponent: function(internalInstance, nextElement, transaction, context) {
      var prevElement = internalInstance._currentElement;
      if (nextElement === prevElement && context === internalInstance._context) {
        return ;
      }
      var refsChanged = ReactRef.shouldUpdateRefs(prevElement, nextElement);
      if (refsChanged) {
        ReactRef.detachRefs(internalInstance, prevElement);
      }
      internalInstance.receiveComponent(nextElement, transaction, context);
      if (refsChanged && internalInstance._currentElement && internalInstance._currentElement.ref != null) {
        transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
      }
    },
    performUpdateIfNecessary: function(internalInstance, transaction) {
      internalInstance.performUpdateIfNecessary(transaction);
    }
  };
  module.exports = ReactReconciler;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactUpdates", ["npm:react@0.14.0/lib/CallbackQueue", "npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/Transaction", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var CallbackQueue = require("npm:react@0.14.0/lib/CallbackQueue");
    var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
    var Transaction = require("npm:react@0.14.0/lib/Transaction");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var dirtyComponents = [];
    var asapCallbackQueue = CallbackQueue.getPooled();
    var asapEnqueued = false;
    var batchingStrategy = null;
    function ensureInjected() {
      !(ReactUpdates.ReactReconcileTransaction && batchingStrategy) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must inject a reconcile transaction class and batching ' + 'strategy') : invariant(false) : undefined;
    }
    var NESTED_UPDATES = {
      initialize: function() {
        this.dirtyComponentsLength = dirtyComponents.length;
      },
      close: function() {
        if (this.dirtyComponentsLength !== dirtyComponents.length) {
          dirtyComponents.splice(0, this.dirtyComponentsLength);
          flushBatchedUpdates();
        } else {
          dirtyComponents.length = 0;
        }
      }
    };
    var UPDATE_QUEUEING = {
      initialize: function() {
        this.callbackQueue.reset();
      },
      close: function() {
        this.callbackQueue.notifyAll();
      }
    };
    var TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];
    function ReactUpdatesFlushTransaction() {
      this.reinitializeTransaction();
      this.dirtyComponentsLength = null;
      this.callbackQueue = CallbackQueue.getPooled();
      this.reconcileTransaction = ReactUpdates.ReactReconcileTransaction.getPooled(false);
    }
    assign(ReactUpdatesFlushTransaction.prototype, Transaction.Mixin, {
      getTransactionWrappers: function() {
        return TRANSACTION_WRAPPERS;
      },
      destructor: function() {
        this.dirtyComponentsLength = null;
        CallbackQueue.release(this.callbackQueue);
        this.callbackQueue = null;
        ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
        this.reconcileTransaction = null;
      },
      perform: function(method, scope, a) {
        return Transaction.Mixin.perform.call(this, this.reconcileTransaction.perform, this.reconcileTransaction, method, scope, a);
      }
    });
    PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);
    function batchedUpdates(callback, a, b, c, d, e) {
      ensureInjected();
      batchingStrategy.batchedUpdates(callback, a, b, c, d, e);
    }
    function mountOrderComparator(c1, c2) {
      return c1._mountOrder - c2._mountOrder;
    }
    function runBatchedUpdates(transaction) {
      var len = transaction.dirtyComponentsLength;
      !(len === dirtyComponents.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected flush transaction\'s stored dirty-components length (%s) to ' + 'match dirty-components array length (%s).', len, dirtyComponents.length) : invariant(false) : undefined;
      dirtyComponents.sort(mountOrderComparator);
      for (var i = 0; i < len; i++) {
        var component = dirtyComponents[i];
        var callbacks = component._pendingCallbacks;
        component._pendingCallbacks = null;
        ReactReconciler.performUpdateIfNecessary(component, transaction.reconcileTransaction);
        if (callbacks) {
          for (var j = 0; j < callbacks.length; j++) {
            transaction.callbackQueue.enqueue(callbacks[j], component.getPublicInstance());
          }
        }
      }
    }
    var flushBatchedUpdates = function() {
      while (dirtyComponents.length || asapEnqueued) {
        if (dirtyComponents.length) {
          var transaction = ReactUpdatesFlushTransaction.getPooled();
          transaction.perform(runBatchedUpdates, null, transaction);
          ReactUpdatesFlushTransaction.release(transaction);
        }
        if (asapEnqueued) {
          asapEnqueued = false;
          var queue = asapCallbackQueue;
          asapCallbackQueue = CallbackQueue.getPooled();
          queue.notifyAll();
          CallbackQueue.release(queue);
        }
      }
    };
    flushBatchedUpdates = ReactPerf.measure('ReactUpdates', 'flushBatchedUpdates', flushBatchedUpdates);
    function enqueueUpdate(component) {
      ensureInjected();
      if (!batchingStrategy.isBatchingUpdates) {
        batchingStrategy.batchedUpdates(enqueueUpdate, component);
        return ;
      }
      dirtyComponents.push(component);
    }
    function asap(callback, context) {
      !batchingStrategy.isBatchingUpdates ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates.asap: Can\'t enqueue an asap callback in a context where' + 'updates are not being batched.') : invariant(false) : undefined;
      asapCallbackQueue.enqueue(callback, context);
      asapEnqueued = true;
    }
    var ReactUpdatesInjection = {
      injectReconcileTransaction: function(ReconcileTransaction) {
        !ReconcileTransaction ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide a reconcile transaction class') : invariant(false) : undefined;
        ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
      },
      injectBatchingStrategy: function(_batchingStrategy) {
        !_batchingStrategy ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide a batching strategy') : invariant(false) : undefined;
        !(typeof _batchingStrategy.batchedUpdates === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide a batchedUpdates() function') : invariant(false) : undefined;
        !(typeof _batchingStrategy.isBatchingUpdates === 'boolean') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide an isBatchingUpdates boolean attribute') : invariant(false) : undefined;
        batchingStrategy = _batchingStrategy;
      }
    };
    var ReactUpdates = {
      ReactReconcileTransaction: null,
      batchedUpdates: batchedUpdates,
      enqueueUpdate: enqueueUpdate,
      flushBatchedUpdates: flushBatchedUpdates,
      injection: ReactUpdatesInjection,
      asap: asap
    };
    module.exports = ReactUpdates;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/containsNode", ["npm:fbjs@0.3.1/lib/isTextNode"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var isTextNode = require("npm:fbjs@0.3.1/lib/isTextNode");
  function containsNode(_x, _x2) {
    var _again = true;
    _function: while (_again) {
      var outerNode = _x,
          innerNode = _x2;
      _again = false;
      if (!outerNode || !innerNode) {
        return false;
      } else if (outerNode === innerNode) {
        return true;
      } else if (isTextNode(outerNode)) {
        return false;
      } else if (isTextNode(innerNode)) {
        _x = outerNode;
        _x2 = innerNode.parentNode;
        _again = true;
        continue _function;
      } else if (outerNode.contains) {
        return outerNode.contains(innerNode);
      } else if (outerNode.compareDocumentPosition) {
        return !!(outerNode.compareDocumentPosition(innerNode) & 16);
      } else {
        return false;
      }
    }
  }
  module.exports = containsNode;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/instantiateReactComponent", ["npm:react@0.14.0/lib/ReactCompositeComponent", "npm:react@0.14.0/lib/ReactEmptyComponent", "npm:react@0.14.0/lib/ReactNativeComponent", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactCompositeComponent = require("npm:react@0.14.0/lib/ReactCompositeComponent");
    var ReactEmptyComponent = require("npm:react@0.14.0/lib/ReactEmptyComponent");
    var ReactNativeComponent = require("npm:react@0.14.0/lib/ReactNativeComponent");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var ReactCompositeComponentWrapper = function() {};
    assign(ReactCompositeComponentWrapper.prototype, ReactCompositeComponent.Mixin, {_instantiateReactComponent: instantiateReactComponent});
    function getDeclarationErrorAddendum(owner) {
      if (owner) {
        var name = owner.getName();
        if (name) {
          return ' Check the render method of `' + name + '`.';
        }
      }
      return '';
    }
    function isInternalComponentType(type) {
      return typeof type === 'function' && typeof type.prototype !== 'undefined' && typeof type.prototype.mountComponent === 'function' && typeof type.prototype.receiveComponent === 'function';
    }
    function instantiateReactComponent(node) {
      var instance;
      if (node === null || node === false) {
        instance = new ReactEmptyComponent(instantiateReactComponent);
      } else if (typeof node === 'object') {
        var element = node;
        !(element && (typeof element.type === 'function' || typeof element.type === 'string')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Element type is invalid: expected a string (for built-in components) ' + 'or a class/function (for composite components) but got: %s.%s', element.type == null ? element.type : typeof element.type, getDeclarationErrorAddendum(element._owner)) : invariant(false) : undefined;
        if (typeof element.type === 'string') {
          instance = ReactNativeComponent.createInternalComponent(element);
        } else if (isInternalComponentType(element.type)) {
          instance = new element.type(element);
        } else {
          instance = new ReactCompositeComponentWrapper();
        }
      } else if (typeof node === 'string' || typeof node === 'number') {
        instance = ReactNativeComponent.createInstanceForText(node);
      } else {
        !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Encountered invalid React node of type %s', typeof node) : invariant(false) : undefined;
      }
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(typeof instance.construct === 'function' && typeof instance.mountComponent === 'function' && typeof instance.receiveComponent === 'function' && typeof instance.unmountComponent === 'function', 'Only React Components can be mounted.') : undefined;
      }
      instance.construct(node);
      instance._mountIndex = 0;
      instance._mountImage = null;
      if (process.env.NODE_ENV !== 'production') {
        instance._isOwnerNecessary = false;
        instance._warnedAboutRefsInRender = false;
      }
      if (process.env.NODE_ENV !== 'production') {
        if (Object.preventExtensions) {
          Object.preventExtensions(instance);
        }
      }
      return instance;
    }
    module.exports = instantiateReactComponent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/BeforeInputEventPlugin", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/EventPropagators", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/FallbackCompositionState", "npm:react@0.14.0/lib/SyntheticCompositionEvent", "npm:react@0.14.0/lib/SyntheticInputEvent", "npm:fbjs@0.3.1/lib/keyOf"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
  var EventPropagators = require("npm:react@0.14.0/lib/EventPropagators");
  var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
  var FallbackCompositionState = require("npm:react@0.14.0/lib/FallbackCompositionState");
  var SyntheticCompositionEvent = require("npm:react@0.14.0/lib/SyntheticCompositionEvent");
  var SyntheticInputEvent = require("npm:react@0.14.0/lib/SyntheticInputEvent");
  var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
  var END_KEYCODES = [9, 13, 27, 32];
  var START_KEYCODE = 229;
  var canUseCompositionEvent = ExecutionEnvironment.canUseDOM && 'CompositionEvent' in window;
  var documentMode = null;
  if (ExecutionEnvironment.canUseDOM && 'documentMode' in document) {
    documentMode = document.documentMode;
  }
  var canUseTextInputEvent = ExecutionEnvironment.canUseDOM && 'TextEvent' in window && !documentMode && !isPresto();
  var useFallbackCompositionData = ExecutionEnvironment.canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);
  function isPresto() {
    var opera = window.opera;
    return typeof opera === 'object' && typeof opera.version === 'function' && parseInt(opera.version(), 10) <= 12;
  }
  var SPACEBAR_CODE = 32;
  var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);
  var topLevelTypes = EventConstants.topLevelTypes;
  var eventTypes = {
    beforeInput: {
      phasedRegistrationNames: {
        bubbled: keyOf({onBeforeInput: null}),
        captured: keyOf({onBeforeInputCapture: null})
      },
      dependencies: [topLevelTypes.topCompositionEnd, topLevelTypes.topKeyPress, topLevelTypes.topTextInput, topLevelTypes.topPaste]
    },
    compositionEnd: {
      phasedRegistrationNames: {
        bubbled: keyOf({onCompositionEnd: null}),
        captured: keyOf({onCompositionEndCapture: null})
      },
      dependencies: [topLevelTypes.topBlur, topLevelTypes.topCompositionEnd, topLevelTypes.topKeyDown, topLevelTypes.topKeyPress, topLevelTypes.topKeyUp, topLevelTypes.topMouseDown]
    },
    compositionStart: {
      phasedRegistrationNames: {
        bubbled: keyOf({onCompositionStart: null}),
        captured: keyOf({onCompositionStartCapture: null})
      },
      dependencies: [topLevelTypes.topBlur, topLevelTypes.topCompositionStart, topLevelTypes.topKeyDown, topLevelTypes.topKeyPress, topLevelTypes.topKeyUp, topLevelTypes.topMouseDown]
    },
    compositionUpdate: {
      phasedRegistrationNames: {
        bubbled: keyOf({onCompositionUpdate: null}),
        captured: keyOf({onCompositionUpdateCapture: null})
      },
      dependencies: [topLevelTypes.topBlur, topLevelTypes.topCompositionUpdate, topLevelTypes.topKeyDown, topLevelTypes.topKeyPress, topLevelTypes.topKeyUp, topLevelTypes.topMouseDown]
    }
  };
  var hasSpaceKeypress = false;
  function isKeypressCommand(nativeEvent) {
    return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && !(nativeEvent.ctrlKey && nativeEvent.altKey);
  }
  function getCompositionEventType(topLevelType) {
    switch (topLevelType) {
      case topLevelTypes.topCompositionStart:
        return eventTypes.compositionStart;
      case topLevelTypes.topCompositionEnd:
        return eventTypes.compositionEnd;
      case topLevelTypes.topCompositionUpdate:
        return eventTypes.compositionUpdate;
    }
  }
  function isFallbackCompositionStart(topLevelType, nativeEvent) {
    return topLevelType === topLevelTypes.topKeyDown && nativeEvent.keyCode === START_KEYCODE;
  }
  function isFallbackCompositionEnd(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case topLevelTypes.topKeyUp:
        return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
      case topLevelTypes.topKeyDown:
        return nativeEvent.keyCode !== START_KEYCODE;
      case topLevelTypes.topKeyPress:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topBlur:
        return true;
      default:
        return false;
    }
  }
  function getDataFromCustomEvent(nativeEvent) {
    var detail = nativeEvent.detail;
    if (typeof detail === 'object' && 'data' in detail) {
      return detail.data;
    }
    return null;
  }
  var currentComposition = null;
  function extractCompositionEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var eventType;
    var fallbackData;
    if (canUseCompositionEvent) {
      eventType = getCompositionEventType(topLevelType);
    } else if (!currentComposition) {
      if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
        eventType = eventTypes.compositionStart;
      }
    } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionEnd;
    }
    if (!eventType) {
      return null;
    }
    if (useFallbackCompositionData) {
      if (!currentComposition && eventType === eventTypes.compositionStart) {
        currentComposition = FallbackCompositionState.getPooled(topLevelTarget);
      } else if (eventType === eventTypes.compositionEnd) {
        if (currentComposition) {
          fallbackData = currentComposition.getData();
        }
      }
    }
    var event = SyntheticCompositionEvent.getPooled(eventType, topLevelTargetID, nativeEvent, nativeEventTarget);
    if (fallbackData) {
      event.data = fallbackData;
    } else {
      var customData = getDataFromCustomEvent(nativeEvent);
      if (customData !== null) {
        event.data = customData;
      }
    }
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }
  function getNativeBeforeInputChars(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case topLevelTypes.topCompositionEnd:
        return getDataFromCustomEvent(nativeEvent);
      case topLevelTypes.topKeyPress:
        var which = nativeEvent.which;
        if (which !== SPACEBAR_CODE) {
          return null;
        }
        hasSpaceKeypress = true;
        return SPACEBAR_CHAR;
      case topLevelTypes.topTextInput:
        var chars = nativeEvent.data;
        if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
          return null;
        }
        return chars;
      default:
        return null;
    }
  }
  function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
    if (currentComposition) {
      if (topLevelType === topLevelTypes.topCompositionEnd || isFallbackCompositionEnd(topLevelType, nativeEvent)) {
        var chars = currentComposition.getData();
        FallbackCompositionState.release(currentComposition);
        currentComposition = null;
        return chars;
      }
      return null;
    }
    switch (topLevelType) {
      case topLevelTypes.topPaste:
        return null;
      case topLevelTypes.topKeyPress:
        if (nativeEvent.which && !isKeypressCommand(nativeEvent)) {
          return String.fromCharCode(nativeEvent.which);
        }
        return null;
      case topLevelTypes.topCompositionEnd:
        return useFallbackCompositionData ? null : nativeEvent.data;
      default:
        return null;
    }
  }
  function extractBeforeInputEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var chars;
    if (canUseTextInputEvent) {
      chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
    } else {
      chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
    }
    if (!chars) {
      return null;
    }
    var event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, topLevelTargetID, nativeEvent, nativeEventTarget);
    event.data = chars;
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }
  var BeforeInputEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      return [extractCompositionEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget), extractBeforeInputEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget)];
    }
  };
  module.exports = BeforeInputEventPlugin;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/EnterLeaveEventPlugin", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/EventPropagators", "npm:react@0.14.0/lib/SyntheticMouseEvent", "npm:react@0.14.0/lib/ReactMount", "npm:fbjs@0.3.1/lib/keyOf"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
  var EventPropagators = require("npm:react@0.14.0/lib/EventPropagators");
  var SyntheticMouseEvent = require("npm:react@0.14.0/lib/SyntheticMouseEvent");
  var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
  var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
  var topLevelTypes = EventConstants.topLevelTypes;
  var getFirstReactDOM = ReactMount.getFirstReactDOM;
  var eventTypes = {
    mouseEnter: {
      registrationName: keyOf({onMouseEnter: null}),
      dependencies: [topLevelTypes.topMouseOut, topLevelTypes.topMouseOver]
    },
    mouseLeave: {
      registrationName: keyOf({onMouseLeave: null}),
      dependencies: [topLevelTypes.topMouseOut, topLevelTypes.topMouseOver]
    }
  };
  var extractedEvents = [null, null];
  var EnterLeaveEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      if (topLevelType === topLevelTypes.topMouseOver && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
        return null;
      }
      if (topLevelType !== topLevelTypes.topMouseOut && topLevelType !== topLevelTypes.topMouseOver) {
        return null;
      }
      var win;
      if (topLevelTarget.window === topLevelTarget) {
        win = topLevelTarget;
      } else {
        var doc = topLevelTarget.ownerDocument;
        if (doc) {
          win = doc.defaultView || doc.parentWindow;
        } else {
          win = window;
        }
      }
      var from;
      var to;
      var fromID = '';
      var toID = '';
      if (topLevelType === topLevelTypes.topMouseOut) {
        from = topLevelTarget;
        fromID = topLevelTargetID;
        to = getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement);
        if (to) {
          toID = ReactMount.getID(to);
        } else {
          to = win;
        }
        to = to || win;
      } else {
        from = win;
        to = topLevelTarget;
        toID = topLevelTargetID;
      }
      if (from === to) {
        return null;
      }
      var leave = SyntheticMouseEvent.getPooled(eventTypes.mouseLeave, fromID, nativeEvent, nativeEventTarget);
      leave.type = 'mouseleave';
      leave.target = from;
      leave.relatedTarget = to;
      var enter = SyntheticMouseEvent.getPooled(eventTypes.mouseEnter, toID, nativeEvent, nativeEventTarget);
      enter.type = 'mouseenter';
      enter.target = to;
      enter.relatedTarget = from;
      EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);
      extractedEvents[0] = leave;
      extractedEvents[1] = enter;
      return extractedEvents;
    }
  };
  module.exports = EnterLeaveEventPlugin;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/CSSPropertyOperations", ["npm:react@0.14.0/lib/CSSProperty", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/ReactPerf", "npm:fbjs@0.3.1/lib/camelizeStyleName", "npm:react@0.14.0/lib/dangerousStyleValue", "npm:fbjs@0.3.1/lib/hyphenateStyleName", "npm:fbjs@0.3.1/lib/memoizeStringOnly", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var CSSProperty = require("npm:react@0.14.0/lib/CSSProperty");
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var camelizeStyleName = require("npm:fbjs@0.3.1/lib/camelizeStyleName");
    var dangerousStyleValue = require("npm:react@0.14.0/lib/dangerousStyleValue");
    var hyphenateStyleName = require("npm:fbjs@0.3.1/lib/hyphenateStyleName");
    var memoizeStringOnly = require("npm:fbjs@0.3.1/lib/memoizeStringOnly");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var processStyleName = memoizeStringOnly(function(styleName) {
      return hyphenateStyleName(styleName);
    });
    var hasShorthandPropertyBug = false;
    var styleFloatAccessor = 'cssFloat';
    if (ExecutionEnvironment.canUseDOM) {
      var tempStyle = document.createElement('div').style;
      try {
        tempStyle.font = '';
      } catch (e) {
        hasShorthandPropertyBug = true;
      }
      if (document.documentElement.style.cssFloat === undefined) {
        styleFloatAccessor = 'styleFloat';
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
      var badStyleValueWithSemicolonPattern = /;\s*$/;
      var warnedStyleNames = {};
      var warnedStyleValues = {};
      var warnHyphenatedStyleName = function(name) {
        if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
          return ;
        }
        warnedStyleNames[name] = true;
        process.env.NODE_ENV !== 'production' ? warning(false, 'Unsupported style property %s. Did you mean %s?', name, camelizeStyleName(name)) : undefined;
      };
      var warnBadVendoredStyleName = function(name) {
        if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
          return ;
        }
        warnedStyleNames[name] = true;
        process.env.NODE_ENV !== 'production' ? warning(false, 'Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1)) : undefined;
      };
      var warnStyleValueWithSemicolon = function(name, value) {
        if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
          return ;
        }
        warnedStyleValues[value] = true;
        process.env.NODE_ENV !== 'production' ? warning(false, 'Style property values shouldn\'t contain a semicolon. ' + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, '')) : undefined;
      };
      var warnValidStyle = function(name, value) {
        if (name.indexOf('-') > -1) {
          warnHyphenatedStyleName(name);
        } else if (badVendoredStyleNamePattern.test(name)) {
          warnBadVendoredStyleName(name);
        } else if (badStyleValueWithSemicolonPattern.test(value)) {
          warnStyleValueWithSemicolon(name, value);
        }
      };
    }
    var CSSPropertyOperations = {
      createMarkupForStyles: function(styles) {
        var serialized = '';
        for (var styleName in styles) {
          if (!styles.hasOwnProperty(styleName)) {
            continue;
          }
          var styleValue = styles[styleName];
          if (process.env.NODE_ENV !== 'production') {
            warnValidStyle(styleName, styleValue);
          }
          if (styleValue != null) {
            serialized += processStyleName(styleName) + ':';
            serialized += dangerousStyleValue(styleName, styleValue) + ';';
          }
        }
        return serialized || null;
      },
      setValueForStyles: function(node, styles) {
        var style = node.style;
        for (var styleName in styles) {
          if (!styles.hasOwnProperty(styleName)) {
            continue;
          }
          if (process.env.NODE_ENV !== 'production') {
            warnValidStyle(styleName, styles[styleName]);
          }
          var styleValue = dangerousStyleValue(styleName, styles[styleName]);
          if (styleName === 'float') {
            styleName = styleFloatAccessor;
          }
          if (styleValue) {
            style[styleName] = styleValue;
          } else {
            var expansion = hasShorthandPropertyBug && CSSProperty.shorthandPropertyExpansions[styleName];
            if (expansion) {
              for (var individualStyleName in expansion) {
                style[individualStyleName] = '';
              }
            } else {
              style[styleName] = '';
            }
          }
        }
      }
    };
    ReactPerf.measureMethods(CSSPropertyOperations, 'CSSPropertyOperations', {setValueForStyles: 'setValueForStyles'});
    module.exports = CSSPropertyOperations;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/LinkedValueUtils", ["npm:react@0.14.0/lib/ReactPropTypes", "npm:react@0.14.0/lib/ReactPropTypeLocations", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactPropTypes = require("npm:react@0.14.0/lib/ReactPropTypes");
    var ReactPropTypeLocations = require("npm:react@0.14.0/lib/ReactPropTypeLocations");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var hasReadOnlyValue = {
      'button': true,
      'checkbox': true,
      'image': true,
      'hidden': true,
      'radio': true,
      'reset': true,
      'submit': true
    };
    function _assertSingleLink(inputProps) {
      !(inputProps.checkedLink == null || inputProps.valueLink == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot provide a checkedLink and a valueLink. If you want to use ' + 'checkedLink, you probably don\'t want to use valueLink and vice versa.') : invariant(false) : undefined;
    }
    function _assertValueLink(inputProps) {
      _assertSingleLink(inputProps);
      !(inputProps.value == null && inputProps.onChange == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot provide a valueLink and a value or onChange event. If you want ' + 'to use value or onChange, you probably don\'t want to use valueLink.') : invariant(false) : undefined;
    }
    function _assertCheckedLink(inputProps) {
      _assertSingleLink(inputProps);
      !(inputProps.checked == null && inputProps.onChange == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot provide a checkedLink and a checked property or onChange event. ' + 'If you want to use checked or onChange, you probably don\'t want to ' + 'use checkedLink') : invariant(false) : undefined;
    }
    var propTypes = {
      value: function(props, propName, componentName) {
        if (!props[propName] || hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled) {
          return null;
        }
        return new Error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
      },
      checked: function(props, propName, componentName) {
        if (!props[propName] || props.onChange || props.readOnly || props.disabled) {
          return null;
        }
        return new Error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
      },
      onChange: ReactPropTypes.func
    };
    var loggedTypeFailures = {};
    function getDeclarationErrorAddendum(owner) {
      if (owner) {
        var name = owner.getName();
        if (name) {
          return ' Check the render method of `' + name + '`.';
        }
      }
      return '';
    }
    var LinkedValueUtils = {
      checkPropTypes: function(tagName, props, owner) {
        for (var propName in propTypes) {
          if (propTypes.hasOwnProperty(propName)) {
            var error = propTypes[propName](props, propName, tagName, ReactPropTypeLocations.prop);
          }
          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            loggedTypeFailures[error.message] = true;
            var addendum = getDeclarationErrorAddendum(owner);
            process.env.NODE_ENV !== 'production' ? warning(false, 'Failed form propType: %s%s', error.message, addendum) : undefined;
          }
        }
      },
      getValue: function(inputProps) {
        if (inputProps.valueLink) {
          _assertValueLink(inputProps);
          return inputProps.valueLink.value;
        }
        return inputProps.value;
      },
      getChecked: function(inputProps) {
        if (inputProps.checkedLink) {
          _assertCheckedLink(inputProps);
          return inputProps.checkedLink.value;
        }
        return inputProps.checked;
      },
      executeOnChange: function(inputProps, event) {
        if (inputProps.valueLink) {
          _assertValueLink(inputProps);
          return inputProps.valueLink.requestChange(event.target.value);
        } else if (inputProps.checkedLink) {
          _assertCheckedLink(inputProps);
          return inputProps.checkedLink.requestChange(event.target.checked);
        } else if (inputProps.onChange) {
          return inputProps.onChange.call(undefined, event);
        }
      }
    };
    module.exports = LinkedValueUtils;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMOption", ["npm:react@0.14.0/lib/ReactChildren", "npm:react@0.14.0/lib/ReactDOMSelect", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactChildren = require("npm:react@0.14.0/lib/ReactChildren");
    var ReactDOMSelect = require("npm:react@0.14.0/lib/ReactDOMSelect");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var valueContextKey = ReactDOMSelect.valueContextKey;
    var ReactDOMOption = {
      mountWrapper: function(inst, props, context) {
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(props.selected == null, 'Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.') : undefined;
        }
        var selectValue = context[valueContextKey];
        var selected = null;
        if (selectValue != null) {
          selected = false;
          if (Array.isArray(selectValue)) {
            for (var i = 0; i < selectValue.length; i++) {
              if ('' + selectValue[i] === '' + props.value) {
                selected = true;
                break;
              }
            }
          } else {
            selected = '' + selectValue === '' + props.value;
          }
        }
        inst._wrapperState = {selected: selected};
      },
      getNativeProps: function(inst, props, context) {
        var nativeProps = assign({
          selected: undefined,
          children: undefined
        }, props);
        if (inst._wrapperState.selected != null) {
          nativeProps.selected = inst._wrapperState.selected;
        }
        var content = '';
        ReactChildren.forEach(props.children, function(child) {
          if (child == null) {
            return ;
          }
          if (typeof child === 'string' || typeof child === 'number') {
            content += child;
          } else {
            process.env.NODE_ENV !== 'production' ? warning(false, 'Only strings and numbers are supported as <option> children.') : undefined;
          }
        });
        nativeProps.children = content;
        return nativeProps;
      }
    };
    module.exports = ReactDOMOption;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactClass", ["npm:react@0.14.0/lib/ReactComponent", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactPropTypeLocations", "npm:react@0.14.0/lib/ReactPropTypeLocationNames", "npm:react@0.14.0/lib/ReactNoopUpdateQueue", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyObject", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/keyMirror", "npm:fbjs@0.3.1/lib/keyOf", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactComponent = require("npm:react@0.14.0/lib/ReactComponent");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactPropTypeLocations = require("npm:react@0.14.0/lib/ReactPropTypeLocations");
    var ReactPropTypeLocationNames = require("npm:react@0.14.0/lib/ReactPropTypeLocationNames");
    var ReactNoopUpdateQueue = require("npm:react@0.14.0/lib/ReactNoopUpdateQueue");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var emptyObject = require("npm:fbjs@0.3.1/lib/emptyObject");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var keyMirror = require("npm:fbjs@0.3.1/lib/keyMirror");
    var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var MIXINS_KEY = keyOf({mixins: null});
    var SpecPolicy = keyMirror({
      DEFINE_ONCE: null,
      DEFINE_MANY: null,
      OVERRIDE_BASE: null,
      DEFINE_MANY_MERGED: null
    });
    var injectedMixins = [];
    var warnedSetProps = false;
    function warnSetProps() {
      if (!warnedSetProps) {
        warnedSetProps = true;
        process.env.NODE_ENV !== 'production' ? warning(false, 'setProps(...) and replaceProps(...) are deprecated. ' + 'Instead, call render again at the top level.') : undefined;
      }
    }
    var ReactClassInterface = {
      mixins: SpecPolicy.DEFINE_MANY,
      statics: SpecPolicy.DEFINE_MANY,
      propTypes: SpecPolicy.DEFINE_MANY,
      contextTypes: SpecPolicy.DEFINE_MANY,
      childContextTypes: SpecPolicy.DEFINE_MANY,
      getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,
      getInitialState: SpecPolicy.DEFINE_MANY_MERGED,
      getChildContext: SpecPolicy.DEFINE_MANY_MERGED,
      render: SpecPolicy.DEFINE_ONCE,
      componentWillMount: SpecPolicy.DEFINE_MANY,
      componentDidMount: SpecPolicy.DEFINE_MANY,
      componentWillReceiveProps: SpecPolicy.DEFINE_MANY,
      shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,
      componentWillUpdate: SpecPolicy.DEFINE_MANY,
      componentDidUpdate: SpecPolicy.DEFINE_MANY,
      componentWillUnmount: SpecPolicy.DEFINE_MANY,
      updateComponent: SpecPolicy.OVERRIDE_BASE
    };
    var RESERVED_SPEC_KEYS = {
      displayName: function(Constructor, displayName) {
        Constructor.displayName = displayName;
      },
      mixins: function(Constructor, mixins) {
        if (mixins) {
          for (var i = 0; i < mixins.length; i++) {
            mixSpecIntoComponent(Constructor, mixins[i]);
          }
        }
      },
      childContextTypes: function(Constructor, childContextTypes) {
        if (process.env.NODE_ENV !== 'production') {
          validateTypeDef(Constructor, childContextTypes, ReactPropTypeLocations.childContext);
        }
        Constructor.childContextTypes = assign({}, Constructor.childContextTypes, childContextTypes);
      },
      contextTypes: function(Constructor, contextTypes) {
        if (process.env.NODE_ENV !== 'production') {
          validateTypeDef(Constructor, contextTypes, ReactPropTypeLocations.context);
        }
        Constructor.contextTypes = assign({}, Constructor.contextTypes, contextTypes);
      },
      getDefaultProps: function(Constructor, getDefaultProps) {
        if (Constructor.getDefaultProps) {
          Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
        } else {
          Constructor.getDefaultProps = getDefaultProps;
        }
      },
      propTypes: function(Constructor, propTypes) {
        if (process.env.NODE_ENV !== 'production') {
          validateTypeDef(Constructor, propTypes, ReactPropTypeLocations.prop);
        }
        Constructor.propTypes = assign({}, Constructor.propTypes, propTypes);
      },
      statics: function(Constructor, statics) {
        mixStaticSpecIntoComponent(Constructor, statics);
      },
      autobind: function() {}
    };
    function validateTypeDef(Constructor, typeDef, location) {
      for (var propName in typeDef) {
        if (typeDef.hasOwnProperty(propName)) {
          process.env.NODE_ENV !== 'production' ? warning(typeof typeDef[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', Constructor.displayName || 'ReactClass', ReactPropTypeLocationNames[location], propName) : undefined;
        }
      }
    }
    function validateMethodOverride(proto, name) {
      var specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;
      if (ReactClassMixin.hasOwnProperty(name)) {
        !(specPolicy === SpecPolicy.OVERRIDE_BASE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to override ' + '`%s` from your class specification. Ensure that your method names ' + 'do not overlap with React methods.', name) : invariant(false) : undefined;
      }
      if (proto.hasOwnProperty(name)) {
        !(specPolicy === SpecPolicy.DEFINE_MANY || specPolicy === SpecPolicy.DEFINE_MANY_MERGED) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to define ' + '`%s` on your component more than once. This conflict may be due ' + 'to a mixin.', name) : invariant(false) : undefined;
      }
    }
    function mixSpecIntoComponent(Constructor, spec) {
      if (!spec) {
        return ;
      }
      !(typeof spec !== 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to ' + 'use a component class as a mixin. Instead, just use a regular object.') : invariant(false) : undefined;
      !!ReactElement.isValidElement(spec) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to ' + 'use a component as a mixin. Instead, just use a regular object.') : invariant(false) : undefined;
      var proto = Constructor.prototype;
      if (spec.hasOwnProperty(MIXINS_KEY)) {
        RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
      }
      for (var name in spec) {
        if (!spec.hasOwnProperty(name)) {
          continue;
        }
        if (name === MIXINS_KEY) {
          continue;
        }
        var property = spec[name];
        validateMethodOverride(proto, name);
        if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
          RESERVED_SPEC_KEYS[name](Constructor, property);
        } else {
          var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
          var isAlreadyDefined = proto.hasOwnProperty(name);
          var isFunction = typeof property === 'function';
          var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;
          if (shouldAutoBind) {
            if (!proto.__reactAutoBindMap) {
              proto.__reactAutoBindMap = {};
            }
            proto.__reactAutoBindMap[name] = property;
            proto[name] = property;
          } else {
            if (isAlreadyDefined) {
              var specPolicy = ReactClassInterface[name];
              !(isReactClassMethod && (specPolicy === SpecPolicy.DEFINE_MANY_MERGED || specPolicy === SpecPolicy.DEFINE_MANY)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: Unexpected spec policy %s for key %s ' + 'when mixing in component specs.', specPolicy, name) : invariant(false) : undefined;
              if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
                proto[name] = createMergedResultFunction(proto[name], property);
              } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
                proto[name] = createChainedFunction(proto[name], property);
              }
            } else {
              proto[name] = property;
              if (process.env.NODE_ENV !== 'production') {
                if (typeof property === 'function' && spec.displayName) {
                  proto[name].displayName = spec.displayName + '_' + name;
                }
              }
            }
          }
        }
      }
    }
    function mixStaticSpecIntoComponent(Constructor, statics) {
      if (!statics) {
        return ;
      }
      for (var name in statics) {
        var property = statics[name];
        if (!statics.hasOwnProperty(name)) {
          continue;
        }
        var isReserved = (name in RESERVED_SPEC_KEYS);
        !!isReserved ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define a reserved ' + 'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' + 'as an instance property instead; it will still be accessible on the ' + 'constructor.', name) : invariant(false) : undefined;
        var isInherited = (name in Constructor);
        !!isInherited ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define ' + '`%s` on your component more than once. This conflict may be ' + 'due to a mixin.', name) : invariant(false) : undefined;
        Constructor[name] = property;
      }
    }
    function mergeIntoWithNoDuplicateKeys(one, two) {
      !(one && two && typeof one === 'object' && typeof two === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.') : invariant(false) : undefined;
      for (var key in two) {
        if (two.hasOwnProperty(key)) {
          !(one[key] === undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): ' + 'Tried to merge two objects with the same key: `%s`. This conflict ' + 'may be due to a mixin; in particular, this may be caused by two ' + 'getInitialState() or getDefaultProps() methods returning objects ' + 'with clashing keys.', key) : invariant(false) : undefined;
          one[key] = two[key];
        }
      }
      return one;
    }
    function createMergedResultFunction(one, two) {
      return function mergedResult() {
        var a = one.apply(this, arguments);
        var b = two.apply(this, arguments);
        if (a == null) {
          return b;
        } else if (b == null) {
          return a;
        }
        var c = {};
        mergeIntoWithNoDuplicateKeys(c, a);
        mergeIntoWithNoDuplicateKeys(c, b);
        return c;
      };
    }
    function createChainedFunction(one, two) {
      return function chainedFunction() {
        one.apply(this, arguments);
        two.apply(this, arguments);
      };
    }
    function bindAutoBindMethod(component, method) {
      var boundMethod = method.bind(component);
      if (process.env.NODE_ENV !== 'production') {
        boundMethod.__reactBoundContext = component;
        boundMethod.__reactBoundMethod = method;
        boundMethod.__reactBoundArguments = null;
        var componentName = component.constructor.displayName;
        var _bind = boundMethod.bind;
        boundMethod.bind = function(newThis) {
          for (var _len = arguments.length,
              args = Array(_len > 1 ? _len - 1 : 0),
              _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          if (newThis !== component && newThis !== null) {
            process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): React component methods may only be bound to the ' + 'component instance. See %s', componentName) : undefined;
          } else if (!args.length) {
            process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): You are binding a component method to the component. ' + 'React does this for you automatically in a high-performance ' + 'way, so you can safely remove this call. See %s', componentName) : undefined;
            return boundMethod;
          }
          var reboundMethod = _bind.apply(boundMethod, arguments);
          reboundMethod.__reactBoundContext = component;
          reboundMethod.__reactBoundMethod = method;
          reboundMethod.__reactBoundArguments = args;
          return reboundMethod;
        };
      }
      return boundMethod;
    }
    function bindAutoBindMethods(component) {
      for (var autoBindKey in component.__reactAutoBindMap) {
        if (component.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
          var method = component.__reactAutoBindMap[autoBindKey];
          component[autoBindKey] = bindAutoBindMethod(component, method);
        }
      }
    }
    var ReactClassMixin = {
      replaceState: function(newState, callback) {
        this.updater.enqueueReplaceState(this, newState);
        if (callback) {
          this.updater.enqueueCallback(this, callback);
        }
      },
      isMounted: function() {
        return this.updater.isMounted(this);
      },
      setProps: function(partialProps, callback) {
        if (process.env.NODE_ENV !== 'production') {
          warnSetProps();
        }
        this.updater.enqueueSetProps(this, partialProps);
        if (callback) {
          this.updater.enqueueCallback(this, callback);
        }
      },
      replaceProps: function(newProps, callback) {
        if (process.env.NODE_ENV !== 'production') {
          warnSetProps();
        }
        this.updater.enqueueReplaceProps(this, newProps);
        if (callback) {
          this.updater.enqueueCallback(this, callback);
        }
      }
    };
    var ReactClassComponent = function() {};
    assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);
    var ReactClass = {
      createClass: function(spec) {
        var Constructor = function(props, context, updater) {
          if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_ENV !== 'production' ? warning(this instanceof Constructor, 'Something is calling a React component directly. Use a factory or ' + 'JSX instead. See: https://fb.me/react-legacyfactory') : undefined;
          }
          if (this.__reactAutoBindMap) {
            bindAutoBindMethods(this);
          }
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
          this.state = null;
          var initialState = this.getInitialState ? this.getInitialState() : null;
          if (process.env.NODE_ENV !== 'production') {
            if (typeof initialState === 'undefined' && this.getInitialState._isMockFunction) {
              initialState = null;
            }
          }
          !(typeof initialState === 'object' && !Array.isArray(initialState)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getInitialState(): must return an object or null', Constructor.displayName || 'ReactCompositeComponent') : invariant(false) : undefined;
          this.state = initialState;
        };
        Constructor.prototype = new ReactClassComponent();
        Constructor.prototype.constructor = Constructor;
        injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));
        mixSpecIntoComponent(Constructor, spec);
        if (Constructor.getDefaultProps) {
          Constructor.defaultProps = Constructor.getDefaultProps();
        }
        if (process.env.NODE_ENV !== 'production') {
          if (Constructor.getDefaultProps) {
            Constructor.getDefaultProps.isReactClassApproved = {};
          }
          if (Constructor.prototype.getInitialState) {
            Constructor.prototype.getInitialState.isReactClassApproved = {};
          }
        }
        !Constructor.prototype.render ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createClass(...): Class specification must implement a `render` method.') : invariant(false) : undefined;
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', spec.displayName || 'A component') : undefined;
          process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', spec.displayName || 'A component') : undefined;
        }
        for (var methodName in ReactClassInterface) {
          if (!Constructor.prototype[methodName]) {
            Constructor.prototype[methodName] = null;
          }
        }
        return Constructor;
      },
      injection: {injectMixin: function(mixin) {
          injectedMixins.push(mixin);
        }}
    };
    module.exports = ReactClass;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactInputSelection", ["npm:react@0.14.0/lib/ReactDOMSelection", "npm:fbjs@0.3.1/lib/containsNode", "npm:fbjs@0.3.1/lib/focusNode", "npm:fbjs@0.3.1/lib/getActiveElement"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactDOMSelection = require("npm:react@0.14.0/lib/ReactDOMSelection");
  var containsNode = require("npm:fbjs@0.3.1/lib/containsNode");
  var focusNode = require("npm:fbjs@0.3.1/lib/focusNode");
  var getActiveElement = require("npm:fbjs@0.3.1/lib/getActiveElement");
  function isInDocument(node) {
    return containsNode(document.documentElement, node);
  }
  var ReactInputSelection = {
    hasSelectionCapabilities: function(elem) {
      var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
      return nodeName && (nodeName === 'input' && elem.type === 'text' || nodeName === 'textarea' || elem.contentEditable === 'true');
    },
    getSelectionInformation: function() {
      var focusedElem = getActiveElement();
      return {
        focusedElem: focusedElem,
        selectionRange: ReactInputSelection.hasSelectionCapabilities(focusedElem) ? ReactInputSelection.getSelection(focusedElem) : null
      };
    },
    restoreSelection: function(priorSelectionInformation) {
      var curFocusedElem = getActiveElement();
      var priorFocusedElem = priorSelectionInformation.focusedElem;
      var priorSelectionRange = priorSelectionInformation.selectionRange;
      if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
        if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
          ReactInputSelection.setSelection(priorFocusedElem, priorSelectionRange);
        }
        focusNode(priorFocusedElem);
      }
    },
    getSelection: function(input) {
      var selection;
      if ('selectionStart' in input) {
        selection = {
          start: input.selectionStart,
          end: input.selectionEnd
        };
      } else if (document.selection && (input.nodeName && input.nodeName.toLowerCase() === 'input')) {
        var range = document.selection.createRange();
        if (range.parentElement() === input) {
          selection = {
            start: -range.moveStart('character', -input.value.length),
            end: -range.moveEnd('character', -input.value.length)
          };
        }
      } else {
        selection = ReactDOMSelection.getOffsets(input);
      }
      return selection || {
        start: 0,
        end: 0
      };
    },
    setSelection: function(input, offsets) {
      var start = offsets.start;
      var end = offsets.end;
      if (typeof end === 'undefined') {
        end = start;
      }
      if ('selectionStart' in input) {
        input.selectionStart = start;
        input.selectionEnd = Math.min(end, input.value.length);
      } else if (document.selection && (input.nodeName && input.nodeName.toLowerCase() === 'input')) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveStart('character', start);
        range.moveEnd('character', end - start);
        range.select();
      } else {
        ReactDOMSelection.setOffsets(input, offsets);
      }
    }
  };
  module.exports = ReactInputSelection;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/SimpleEventPlugin", ["npm:react@0.14.0/lib/EventConstants", "npm:fbjs@0.3.1/lib/EventListener", "npm:react@0.14.0/lib/EventPropagators", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/SyntheticClipboardEvent", "npm:react@0.14.0/lib/SyntheticEvent", "npm:react@0.14.0/lib/SyntheticFocusEvent", "npm:react@0.14.0/lib/SyntheticKeyboardEvent", "npm:react@0.14.0/lib/SyntheticMouseEvent", "npm:react@0.14.0/lib/SyntheticDragEvent", "npm:react@0.14.0/lib/SyntheticTouchEvent", "npm:react@0.14.0/lib/SyntheticUIEvent", "npm:react@0.14.0/lib/SyntheticWheelEvent", "npm:fbjs@0.3.1/lib/emptyFunction", "npm:react@0.14.0/lib/getEventCharCode", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/keyOf", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
    var EventListener = require("npm:fbjs@0.3.1/lib/EventListener");
    var EventPropagators = require("npm:react@0.14.0/lib/EventPropagators");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var SyntheticClipboardEvent = require("npm:react@0.14.0/lib/SyntheticClipboardEvent");
    var SyntheticEvent = require("npm:react@0.14.0/lib/SyntheticEvent");
    var SyntheticFocusEvent = require("npm:react@0.14.0/lib/SyntheticFocusEvent");
    var SyntheticKeyboardEvent = require("npm:react@0.14.0/lib/SyntheticKeyboardEvent");
    var SyntheticMouseEvent = require("npm:react@0.14.0/lib/SyntheticMouseEvent");
    var SyntheticDragEvent = require("npm:react@0.14.0/lib/SyntheticDragEvent");
    var SyntheticTouchEvent = require("npm:react@0.14.0/lib/SyntheticTouchEvent");
    var SyntheticUIEvent = require("npm:react@0.14.0/lib/SyntheticUIEvent");
    var SyntheticWheelEvent = require("npm:react@0.14.0/lib/SyntheticWheelEvent");
    var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
    var getEventCharCode = require("npm:react@0.14.0/lib/getEventCharCode");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
    var topLevelTypes = EventConstants.topLevelTypes;
    var eventTypes = {
      abort: {phasedRegistrationNames: {
          bubbled: keyOf({onAbort: true}),
          captured: keyOf({onAbortCapture: true})
        }},
      blur: {phasedRegistrationNames: {
          bubbled: keyOf({onBlur: true}),
          captured: keyOf({onBlurCapture: true})
        }},
      canPlay: {phasedRegistrationNames: {
          bubbled: keyOf({onCanPlay: true}),
          captured: keyOf({onCanPlayCapture: true})
        }},
      canPlayThrough: {phasedRegistrationNames: {
          bubbled: keyOf({onCanPlayThrough: true}),
          captured: keyOf({onCanPlayThroughCapture: true})
        }},
      click: {phasedRegistrationNames: {
          bubbled: keyOf({onClick: true}),
          captured: keyOf({onClickCapture: true})
        }},
      contextMenu: {phasedRegistrationNames: {
          bubbled: keyOf({onContextMenu: true}),
          captured: keyOf({onContextMenuCapture: true})
        }},
      copy: {phasedRegistrationNames: {
          bubbled: keyOf({onCopy: true}),
          captured: keyOf({onCopyCapture: true})
        }},
      cut: {phasedRegistrationNames: {
          bubbled: keyOf({onCut: true}),
          captured: keyOf({onCutCapture: true})
        }},
      doubleClick: {phasedRegistrationNames: {
          bubbled: keyOf({onDoubleClick: true}),
          captured: keyOf({onDoubleClickCapture: true})
        }},
      drag: {phasedRegistrationNames: {
          bubbled: keyOf({onDrag: true}),
          captured: keyOf({onDragCapture: true})
        }},
      dragEnd: {phasedRegistrationNames: {
          bubbled: keyOf({onDragEnd: true}),
          captured: keyOf({onDragEndCapture: true})
        }},
      dragEnter: {phasedRegistrationNames: {
          bubbled: keyOf({onDragEnter: true}),
          captured: keyOf({onDragEnterCapture: true})
        }},
      dragExit: {phasedRegistrationNames: {
          bubbled: keyOf({onDragExit: true}),
          captured: keyOf({onDragExitCapture: true})
        }},
      dragLeave: {phasedRegistrationNames: {
          bubbled: keyOf({onDragLeave: true}),
          captured: keyOf({onDragLeaveCapture: true})
        }},
      dragOver: {phasedRegistrationNames: {
          bubbled: keyOf({onDragOver: true}),
          captured: keyOf({onDragOverCapture: true})
        }},
      dragStart: {phasedRegistrationNames: {
          bubbled: keyOf({onDragStart: true}),
          captured: keyOf({onDragStartCapture: true})
        }},
      drop: {phasedRegistrationNames: {
          bubbled: keyOf({onDrop: true}),
          captured: keyOf({onDropCapture: true})
        }},
      durationChange: {phasedRegistrationNames: {
          bubbled: keyOf({onDurationChange: true}),
          captured: keyOf({onDurationChangeCapture: true})
        }},
      emptied: {phasedRegistrationNames: {
          bubbled: keyOf({onEmptied: true}),
          captured: keyOf({onEmptiedCapture: true})
        }},
      encrypted: {phasedRegistrationNames: {
          bubbled: keyOf({onEncrypted: true}),
          captured: keyOf({onEncryptedCapture: true})
        }},
      ended: {phasedRegistrationNames: {
          bubbled: keyOf({onEnded: true}),
          captured: keyOf({onEndedCapture: true})
        }},
      error: {phasedRegistrationNames: {
          bubbled: keyOf({onError: true}),
          captured: keyOf({onErrorCapture: true})
        }},
      focus: {phasedRegistrationNames: {
          bubbled: keyOf({onFocus: true}),
          captured: keyOf({onFocusCapture: true})
        }},
      input: {phasedRegistrationNames: {
          bubbled: keyOf({onInput: true}),
          captured: keyOf({onInputCapture: true})
        }},
      keyDown: {phasedRegistrationNames: {
          bubbled: keyOf({onKeyDown: true}),
          captured: keyOf({onKeyDownCapture: true})
        }},
      keyPress: {phasedRegistrationNames: {
          bubbled: keyOf({onKeyPress: true}),
          captured: keyOf({onKeyPressCapture: true})
        }},
      keyUp: {phasedRegistrationNames: {
          bubbled: keyOf({onKeyUp: true}),
          captured: keyOf({onKeyUpCapture: true})
        }},
      load: {phasedRegistrationNames: {
          bubbled: keyOf({onLoad: true}),
          captured: keyOf({onLoadCapture: true})
        }},
      loadedData: {phasedRegistrationNames: {
          bubbled: keyOf({onLoadedData: true}),
          captured: keyOf({onLoadedDataCapture: true})
        }},
      loadedMetadata: {phasedRegistrationNames: {
          bubbled: keyOf({onLoadedMetadata: true}),
          captured: keyOf({onLoadedMetadataCapture: true})
        }},
      loadStart: {phasedRegistrationNames: {
          bubbled: keyOf({onLoadStart: true}),
          captured: keyOf({onLoadStartCapture: true})
        }},
      mouseDown: {phasedRegistrationNames: {
          bubbled: keyOf({onMouseDown: true}),
          captured: keyOf({onMouseDownCapture: true})
        }},
      mouseMove: {phasedRegistrationNames: {
          bubbled: keyOf({onMouseMove: true}),
          captured: keyOf({onMouseMoveCapture: true})
        }},
      mouseOut: {phasedRegistrationNames: {
          bubbled: keyOf({onMouseOut: true}),
          captured: keyOf({onMouseOutCapture: true})
        }},
      mouseOver: {phasedRegistrationNames: {
          bubbled: keyOf({onMouseOver: true}),
          captured: keyOf({onMouseOverCapture: true})
        }},
      mouseUp: {phasedRegistrationNames: {
          bubbled: keyOf({onMouseUp: true}),
          captured: keyOf({onMouseUpCapture: true})
        }},
      paste: {phasedRegistrationNames: {
          bubbled: keyOf({onPaste: true}),
          captured: keyOf({onPasteCapture: true})
        }},
      pause: {phasedRegistrationNames: {
          bubbled: keyOf({onPause: true}),
          captured: keyOf({onPauseCapture: true})
        }},
      play: {phasedRegistrationNames: {
          bubbled: keyOf({onPlay: true}),
          captured: keyOf({onPlayCapture: true})
        }},
      playing: {phasedRegistrationNames: {
          bubbled: keyOf({onPlaying: true}),
          captured: keyOf({onPlayingCapture: true})
        }},
      progress: {phasedRegistrationNames: {
          bubbled: keyOf({onProgress: true}),
          captured: keyOf({onProgressCapture: true})
        }},
      rateChange: {phasedRegistrationNames: {
          bubbled: keyOf({onRateChange: true}),
          captured: keyOf({onRateChangeCapture: true})
        }},
      reset: {phasedRegistrationNames: {
          bubbled: keyOf({onReset: true}),
          captured: keyOf({onResetCapture: true})
        }},
      scroll: {phasedRegistrationNames: {
          bubbled: keyOf({onScroll: true}),
          captured: keyOf({onScrollCapture: true})
        }},
      seeked: {phasedRegistrationNames: {
          bubbled: keyOf({onSeeked: true}),
          captured: keyOf({onSeekedCapture: true})
        }},
      seeking: {phasedRegistrationNames: {
          bubbled: keyOf({onSeeking: true}),
          captured: keyOf({onSeekingCapture: true})
        }},
      stalled: {phasedRegistrationNames: {
          bubbled: keyOf({onStalled: true}),
          captured: keyOf({onStalledCapture: true})
        }},
      submit: {phasedRegistrationNames: {
          bubbled: keyOf({onSubmit: true}),
          captured: keyOf({onSubmitCapture: true})
        }},
      suspend: {phasedRegistrationNames: {
          bubbled: keyOf({onSuspend: true}),
          captured: keyOf({onSuspendCapture: true})
        }},
      timeUpdate: {phasedRegistrationNames: {
          bubbled: keyOf({onTimeUpdate: true}),
          captured: keyOf({onTimeUpdateCapture: true})
        }},
      touchCancel: {phasedRegistrationNames: {
          bubbled: keyOf({onTouchCancel: true}),
          captured: keyOf({onTouchCancelCapture: true})
        }},
      touchEnd: {phasedRegistrationNames: {
          bubbled: keyOf({onTouchEnd: true}),
          captured: keyOf({onTouchEndCapture: true})
        }},
      touchMove: {phasedRegistrationNames: {
          bubbled: keyOf({onTouchMove: true}),
          captured: keyOf({onTouchMoveCapture: true})
        }},
      touchStart: {phasedRegistrationNames: {
          bubbled: keyOf({onTouchStart: true}),
          captured: keyOf({onTouchStartCapture: true})
        }},
      volumeChange: {phasedRegistrationNames: {
          bubbled: keyOf({onVolumeChange: true}),
          captured: keyOf({onVolumeChangeCapture: true})
        }},
      waiting: {phasedRegistrationNames: {
          bubbled: keyOf({onWaiting: true}),
          captured: keyOf({onWaitingCapture: true})
        }},
      wheel: {phasedRegistrationNames: {
          bubbled: keyOf({onWheel: true}),
          captured: keyOf({onWheelCapture: true})
        }}
    };
    var topLevelEventsToDispatchConfig = {
      topAbort: eventTypes.abort,
      topBlur: eventTypes.blur,
      topCanPlay: eventTypes.canPlay,
      topCanPlayThrough: eventTypes.canPlayThrough,
      topClick: eventTypes.click,
      topContextMenu: eventTypes.contextMenu,
      topCopy: eventTypes.copy,
      topCut: eventTypes.cut,
      topDoubleClick: eventTypes.doubleClick,
      topDrag: eventTypes.drag,
      topDragEnd: eventTypes.dragEnd,
      topDragEnter: eventTypes.dragEnter,
      topDragExit: eventTypes.dragExit,
      topDragLeave: eventTypes.dragLeave,
      topDragOver: eventTypes.dragOver,
      topDragStart: eventTypes.dragStart,
      topDrop: eventTypes.drop,
      topDurationChange: eventTypes.durationChange,
      topEmptied: eventTypes.emptied,
      topEncrypted: eventTypes.encrypted,
      topEnded: eventTypes.ended,
      topError: eventTypes.error,
      topFocus: eventTypes.focus,
      topInput: eventTypes.input,
      topKeyDown: eventTypes.keyDown,
      topKeyPress: eventTypes.keyPress,
      topKeyUp: eventTypes.keyUp,
      topLoad: eventTypes.load,
      topLoadedData: eventTypes.loadedData,
      topLoadedMetadata: eventTypes.loadedMetadata,
      topLoadStart: eventTypes.loadStart,
      topMouseDown: eventTypes.mouseDown,
      topMouseMove: eventTypes.mouseMove,
      topMouseOut: eventTypes.mouseOut,
      topMouseOver: eventTypes.mouseOver,
      topMouseUp: eventTypes.mouseUp,
      topPaste: eventTypes.paste,
      topPause: eventTypes.pause,
      topPlay: eventTypes.play,
      topPlaying: eventTypes.playing,
      topProgress: eventTypes.progress,
      topRateChange: eventTypes.rateChange,
      topReset: eventTypes.reset,
      topScroll: eventTypes.scroll,
      topSeeked: eventTypes.seeked,
      topSeeking: eventTypes.seeking,
      topStalled: eventTypes.stalled,
      topSubmit: eventTypes.submit,
      topSuspend: eventTypes.suspend,
      topTimeUpdate: eventTypes.timeUpdate,
      topTouchCancel: eventTypes.touchCancel,
      topTouchEnd: eventTypes.touchEnd,
      topTouchMove: eventTypes.touchMove,
      topTouchStart: eventTypes.touchStart,
      topVolumeChange: eventTypes.volumeChange,
      topWaiting: eventTypes.waiting,
      topWheel: eventTypes.wheel
    };
    for (var type in topLevelEventsToDispatchConfig) {
      topLevelEventsToDispatchConfig[type].dependencies = [type];
    }
    var ON_CLICK_KEY = keyOf({onClick: null});
    var onClickListeners = {};
    var SimpleEventPlugin = {
      eventTypes: eventTypes,
      extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
        var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
        if (!dispatchConfig) {
          return null;
        }
        var EventConstructor;
        switch (topLevelType) {
          case topLevelTypes.topAbort:
          case topLevelTypes.topCanPlay:
          case topLevelTypes.topCanPlayThrough:
          case topLevelTypes.topDurationChange:
          case topLevelTypes.topEmptied:
          case topLevelTypes.topEncrypted:
          case topLevelTypes.topEnded:
          case topLevelTypes.topError:
          case topLevelTypes.topInput:
          case topLevelTypes.topLoad:
          case topLevelTypes.topLoadedData:
          case topLevelTypes.topLoadedMetadata:
          case topLevelTypes.topLoadStart:
          case topLevelTypes.topPause:
          case topLevelTypes.topPlay:
          case topLevelTypes.topPlaying:
          case topLevelTypes.topProgress:
          case topLevelTypes.topRateChange:
          case topLevelTypes.topReset:
          case topLevelTypes.topSeeked:
          case topLevelTypes.topSeeking:
          case topLevelTypes.topStalled:
          case topLevelTypes.topSubmit:
          case topLevelTypes.topSuspend:
          case topLevelTypes.topTimeUpdate:
          case topLevelTypes.topVolumeChange:
          case topLevelTypes.topWaiting:
            EventConstructor = SyntheticEvent;
            break;
          case topLevelTypes.topKeyPress:
            if (getEventCharCode(nativeEvent) === 0) {
              return null;
            }
          case topLevelTypes.topKeyDown:
          case topLevelTypes.topKeyUp:
            EventConstructor = SyntheticKeyboardEvent;
            break;
          case topLevelTypes.topBlur:
          case topLevelTypes.topFocus:
            EventConstructor = SyntheticFocusEvent;
            break;
          case topLevelTypes.topClick:
            if (nativeEvent.button === 2) {
              return null;
            }
          case topLevelTypes.topContextMenu:
          case topLevelTypes.topDoubleClick:
          case topLevelTypes.topMouseDown:
          case topLevelTypes.topMouseMove:
          case topLevelTypes.topMouseOut:
          case topLevelTypes.topMouseOver:
          case topLevelTypes.topMouseUp:
            EventConstructor = SyntheticMouseEvent;
            break;
          case topLevelTypes.topDrag:
          case topLevelTypes.topDragEnd:
          case topLevelTypes.topDragEnter:
          case topLevelTypes.topDragExit:
          case topLevelTypes.topDragLeave:
          case topLevelTypes.topDragOver:
          case topLevelTypes.topDragStart:
          case topLevelTypes.topDrop:
            EventConstructor = SyntheticDragEvent;
            break;
          case topLevelTypes.topTouchCancel:
          case topLevelTypes.topTouchEnd:
          case topLevelTypes.topTouchMove:
          case topLevelTypes.topTouchStart:
            EventConstructor = SyntheticTouchEvent;
            break;
          case topLevelTypes.topScroll:
            EventConstructor = SyntheticUIEvent;
            break;
          case topLevelTypes.topWheel:
            EventConstructor = SyntheticWheelEvent;
            break;
          case topLevelTypes.topCopy:
          case topLevelTypes.topCut:
          case topLevelTypes.topPaste:
            EventConstructor = SyntheticClipboardEvent;
            break;
        }
        !EventConstructor ? process.env.NODE_ENV !== 'production' ? invariant(false, 'SimpleEventPlugin: Unhandled event type, `%s`.', topLevelType) : invariant(false) : undefined;
        var event = EventConstructor.getPooled(dispatchConfig, topLevelTargetID, nativeEvent, nativeEventTarget);
        EventPropagators.accumulateTwoPhaseDispatches(event);
        return event;
      },
      didPutListener: function(id, registrationName, listener) {
        if (registrationName === ON_CLICK_KEY) {
          var node = ReactMount.getNode(id);
          if (!onClickListeners[id]) {
            onClickListeners[id] = EventListener.listen(node, 'click', emptyFunction);
          }
        }
      },
      willDeleteListener: function(id, registrationName) {
        if (registrationName === ON_CLICK_KEY) {
          onClickListeners[id].remove();
          delete onClickListeners[id];
        }
      }
    };
    module.exports = SimpleEventPlugin;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDefaultPerf", ["npm:react@0.14.0/lib/DOMProperty", "npm:react@0.14.0/lib/ReactDefaultPerfAnalysis", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactPerf", "npm:fbjs@0.3.1/lib/performanceNow"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
  var ReactDefaultPerfAnalysis = require("npm:react@0.14.0/lib/ReactDefaultPerfAnalysis");
  var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
  var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
  var performanceNow = require("npm:fbjs@0.3.1/lib/performanceNow");
  function roundFloat(val) {
    return Math.floor(val * 100) / 100;
  }
  function addValue(obj, key, val) {
    obj[key] = (obj[key] || 0) + val;
  }
  var ReactDefaultPerf = {
    _allMeasurements: [],
    _mountStack: [0],
    _injected: false,
    start: function() {
      if (!ReactDefaultPerf._injected) {
        ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);
      }
      ReactDefaultPerf._allMeasurements.length = 0;
      ReactPerf.enableMeasure = true;
    },
    stop: function() {
      ReactPerf.enableMeasure = false;
    },
    getLastMeasurements: function() {
      return ReactDefaultPerf._allMeasurements;
    },
    printExclusive: function(measurements) {
      measurements = measurements || ReactDefaultPerf._allMeasurements;
      var summary = ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
      console.table(summary.map(function(item) {
        return {
          'Component class name': item.componentName,
          'Total inclusive time (ms)': roundFloat(item.inclusive),
          'Exclusive mount time (ms)': roundFloat(item.exclusive),
          'Exclusive render time (ms)': roundFloat(item.render),
          'Mount time per instance (ms)': roundFloat(item.exclusive / item.count),
          'Render time per instance (ms)': roundFloat(item.render / item.count),
          'Instances': item.count
        };
      }));
    },
    printInclusive: function(measurements) {
      measurements = measurements || ReactDefaultPerf._allMeasurements;
      var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
      console.table(summary.map(function(item) {
        return {
          'Owner > component': item.componentName,
          'Inclusive time (ms)': roundFloat(item.time),
          'Instances': item.count
        };
      }));
      console.log('Total time:', ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');
    },
    getMeasurementsSummaryMap: function(measurements) {
      var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements, true);
      return summary.map(function(item) {
        return {
          'Owner > component': item.componentName,
          'Wasted time (ms)': item.time,
          'Instances': item.count
        };
      });
    },
    printWasted: function(measurements) {
      measurements = measurements || ReactDefaultPerf._allMeasurements;
      console.table(ReactDefaultPerf.getMeasurementsSummaryMap(measurements));
      console.log('Total time:', ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');
    },
    printDOM: function(measurements) {
      measurements = measurements || ReactDefaultPerf._allMeasurements;
      var summary = ReactDefaultPerfAnalysis.getDOMSummary(measurements);
      console.table(summary.map(function(item) {
        var result = {};
        result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
        result.type = item.type;
        result.args = JSON.stringify(item.args);
        return result;
      }));
      console.log('Total time:', ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');
    },
    _recordWrite: function(id, fnName, totalTime, args) {
      var writes = ReactDefaultPerf._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1].writes;
      writes[id] = writes[id] || [];
      writes[id].push({
        type: fnName,
        time: totalTime,
        args: args
      });
    },
    measure: function(moduleName, fnName, func) {
      return function() {
        for (var _len = arguments.length,
            args = Array(_len),
            _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        var totalTime;
        var rv;
        var start;
        if (fnName === '_renderNewRootComponent' || fnName === 'flushBatchedUpdates') {
          ReactDefaultPerf._allMeasurements.push({
            exclusive: {},
            inclusive: {},
            render: {},
            counts: {},
            writes: {},
            displayNames: {},
            totalTime: 0,
            created: {}
          });
          start = performanceNow();
          rv = func.apply(this, args);
          ReactDefaultPerf._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1].totalTime = performanceNow() - start;
          return rv;
        } else if (fnName === '_mountImageIntoNode' || moduleName === 'ReactBrowserEventEmitter' || moduleName === 'ReactDOMIDOperations' || moduleName === 'CSSPropertyOperations' || moduleName === 'DOMChildrenOperations' || moduleName === 'DOMPropertyOperations') {
          start = performanceNow();
          rv = func.apply(this, args);
          totalTime = performanceNow() - start;
          if (fnName === '_mountImageIntoNode') {
            var mountID = ReactMount.getID(args[1]);
            ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);
          } else if (fnName === 'dangerouslyProcessChildrenUpdates') {
            args[0].forEach(function(update) {
              var writeArgs = {};
              if (update.fromIndex !== null) {
                writeArgs.fromIndex = update.fromIndex;
              }
              if (update.toIndex !== null) {
                writeArgs.toIndex = update.toIndex;
              }
              if (update.textContent !== null) {
                writeArgs.textContent = update.textContent;
              }
              if (update.markupIndex !== null) {
                writeArgs.markup = args[1][update.markupIndex];
              }
              ReactDefaultPerf._recordWrite(update.parentID, update.type, totalTime, writeArgs);
            });
          } else {
            var id = args[0];
            if (typeof id === 'object') {
              id = ReactMount.getID(args[0]);
            }
            ReactDefaultPerf._recordWrite(id, fnName, totalTime, Array.prototype.slice.call(args, 1));
          }
          return rv;
        } else if (moduleName === 'ReactCompositeComponent' && (fnName === 'mountComponent' || fnName === 'updateComponent' || fnName === '_renderValidatedComponent')) {
          if (this._currentElement.type === ReactMount.TopLevelWrapper) {
            return func.apply(this, args);
          }
          var rootNodeID = fnName === 'mountComponent' ? args[0] : this._rootNodeID;
          var isRender = fnName === '_renderValidatedComponent';
          var isMount = fnName === 'mountComponent';
          var mountStack = ReactDefaultPerf._mountStack;
          var entry = ReactDefaultPerf._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1];
          if (isRender) {
            addValue(entry.counts, rootNodeID, 1);
          } else if (isMount) {
            entry.created[rootNodeID] = true;
            mountStack.push(0);
          }
          start = performanceNow();
          rv = func.apply(this, args);
          totalTime = performanceNow() - start;
          if (isRender) {
            addValue(entry.render, rootNodeID, totalTime);
          } else if (isMount) {
            var subMountTime = mountStack.pop();
            mountStack[mountStack.length - 1] += totalTime;
            addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
            addValue(entry.inclusive, rootNodeID, totalTime);
          } else {
            addValue(entry.inclusive, rootNodeID, totalTime);
          }
          entry.displayNames[rootNodeID] = {
            current: this.getName(),
            owner: this._currentElement._owner ? this._currentElement._owner.getName() : '<root>'
          };
          return rv;
        } else {
          return func.apply(this, args);
        }
      };
    }
  };
  module.exports = ReactDefaultPerf;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMServer", ["npm:react@0.14.0/lib/ReactDefaultInjection", "npm:react@0.14.0/lib/ReactServerRendering", "npm:react@0.14.0/lib/ReactVersion"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactDefaultInjection = require("npm:react@0.14.0/lib/ReactDefaultInjection");
  var ReactServerRendering = require("npm:react@0.14.0/lib/ReactServerRendering");
  var ReactVersion = require("npm:react@0.14.0/lib/ReactVersion");
  ReactDefaultInjection.inject();
  var ReactDOMServer = {
    renderToString: ReactServerRendering.renderToString,
    renderToStaticMarkup: ReactServerRendering.renderToStaticMarkup,
    version: ReactVersion
  };
  module.exports = ReactDOMServer;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactIsomorphic", ["npm:react@0.14.0/lib/ReactChildren", "npm:react@0.14.0/lib/ReactComponent", "npm:react@0.14.0/lib/ReactClass", "npm:react@0.14.0/lib/ReactDOMFactories", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactElementValidator", "npm:react@0.14.0/lib/ReactPropTypes", "npm:react@0.14.0/lib/ReactVersion", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/onlyChild", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactChildren = require("npm:react@0.14.0/lib/ReactChildren");
    var ReactComponent = require("npm:react@0.14.0/lib/ReactComponent");
    var ReactClass = require("npm:react@0.14.0/lib/ReactClass");
    var ReactDOMFactories = require("npm:react@0.14.0/lib/ReactDOMFactories");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactElementValidator = require("npm:react@0.14.0/lib/ReactElementValidator");
    var ReactPropTypes = require("npm:react@0.14.0/lib/ReactPropTypes");
    var ReactVersion = require("npm:react@0.14.0/lib/ReactVersion");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var onlyChild = require("npm:react@0.14.0/lib/onlyChild");
    var createElement = ReactElement.createElement;
    var createFactory = ReactElement.createFactory;
    var cloneElement = ReactElement.cloneElement;
    if (process.env.NODE_ENV !== 'production') {
      createElement = ReactElementValidator.createElement;
      createFactory = ReactElementValidator.createFactory;
      cloneElement = ReactElementValidator.cloneElement;
    }
    var React = {
      Children: {
        map: ReactChildren.map,
        forEach: ReactChildren.forEach,
        count: ReactChildren.count,
        toArray: ReactChildren.toArray,
        only: onlyChild
      },
      Component: ReactComponent,
      createElement: createElement,
      cloneElement: cloneElement,
      isValidElement: ReactElement.isValidElement,
      PropTypes: ReactPropTypes,
      createClass: ReactClass.createClass,
      createFactory: createFactory,
      createMixin: function(mixin) {
        return mixin;
      },
      DOM: ReactDOMFactories,
      version: ReactVersion,
      __spread: assign
    };
    module.exports = React;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/fn/object/get-own-property-descriptor", ["npm:core-js@0.9.18/library/modules/$", "npm:core-js@0.9.18/library/modules/es6.object.statics-accept-primitives"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$");
  require("npm:core-js@0.9.18/library/modules/es6.object.statics-accept-primitives");
  module.exports = function getOwnPropertyDescriptor(it, key) {
    return $.getDesc(it, key);
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/es6.object.set-prototype-of", ["npm:core-js@0.9.18/library/modules/$.def", "npm:core-js@0.9.18/library/modules/$.set-proto"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $def = require("npm:core-js@0.9.18/library/modules/$.def");
  $def($def.S, 'Object', {setPrototypeOf: require("npm:core-js@0.9.18/library/modules/$.set-proto").set});
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/helpers/create-class", ["npm:babel-runtime@5.8.25/core-js/object/define-property"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("npm:babel-runtime@5.8.25/core-js/object/define-property")["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/lang/isNative", ["npm:lodash@3.10.1/lang/isFunction", "npm:lodash@3.10.1/internal/isObjectLike"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isFunction = require("npm:lodash@3.10.1/lang/isFunction"),
      isObjectLike = require("npm:lodash@3.10.1/internal/isObjectLike");
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var objectProto = Object.prototype;
  var fnToString = Function.prototype.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp('^' + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
  function isNative(value) {
    if (value == null) {
      return false;
    }
    if (isFunction(value)) {
      return reIsNative.test(fnToString.call(value));
    }
    return isObjectLike(value) && reIsHostCtor.test(value);
  }
  module.exports = isNative;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/createCache", ["npm:lodash@3.10.1/internal/SetCache", "npm:lodash@3.10.1/internal/getNative"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var SetCache = require("npm:lodash@3.10.1/internal/SetCache"),
      getNative = require("npm:lodash@3.10.1/internal/getNative");
  var Set = getNative(global, 'Set');
  var nativeCreate = getNative(Object, 'create');
  function createCache(values) {
    return (nativeCreate && Set) ? new SetCache(values) : null;
  }
  module.exports = createCache;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/isArrayLike", ["npm:lodash@3.10.1/internal/getLength", "npm:lodash@3.10.1/internal/isLength"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var getLength = require("npm:lodash@3.10.1/internal/getLength"),
      isLength = require("npm:lodash@3.10.1/internal/isLength");
  function isArrayLike(value) {
    return value != null && isLength(getLength(value));
  }
  module.exports = isArrayLike;
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/reducers/dirtyHandlerIds", ["npm:lodash@3.10.1/array/xor", "npm:lodash@3.10.1/array/intersection", "npm:dnd-core@1.2.1/lib/actions/dragDrop", "npm:dnd-core@1.2.1/lib/actions/registry"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = dirtyHandlerIds;
  exports.areDirty = areDirty;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _lodashArrayXor = require("npm:lodash@3.10.1/array/xor");
  var _lodashArrayXor2 = _interopRequireDefault(_lodashArrayXor);
  var _lodashArrayIntersection = require("npm:lodash@3.10.1/array/intersection");
  var _lodashArrayIntersection2 = _interopRequireDefault(_lodashArrayIntersection);
  var _actionsDragDrop = require("npm:dnd-core@1.2.1/lib/actions/dragDrop");
  var _actionsRegistry = require("npm:dnd-core@1.2.1/lib/actions/registry");
  var NONE = [];
  var ALL = [];
  function dirtyHandlerIds(state, action, dragOperation) {
    if (state === undefined)
      state = NONE;
    switch (action.type) {
      case _actionsDragDrop.HOVER:
        break;
      case _actionsRegistry.ADD_SOURCE:
      case _actionsRegistry.ADD_TARGET:
      case _actionsRegistry.REMOVE_TARGET:
      case _actionsRegistry.REMOVE_SOURCE:
        return NONE;
      case _actionsDragDrop.BEGIN_DRAG:
      case _actionsDragDrop.PUBLISH_DRAG_SOURCE:
      case _actionsDragDrop.END_DRAG:
      case _actionsDragDrop.DROP:
      default:
        return ALL;
    }
    var targetIds = action.targetIds;
    var prevTargetIds = dragOperation.targetIds;
    var dirtyHandlerIds = _lodashArrayXor2['default'](targetIds, prevTargetIds);
    var didChange = false;
    if (dirtyHandlerIds.length === 0) {
      for (var i = 0; i < targetIds.length; i++) {
        if (targetIds[i] !== prevTargetIds[i]) {
          didChange = true;
          break;
        }
      }
    } else {
      didChange = true;
    }
    if (!didChange) {
      return NONE;
    }
    var prevInnermostTargetId = prevTargetIds[prevTargetIds.length - 1];
    var innermostTargetId = targetIds[targetIds.length - 1];
    if (prevInnermostTargetId !== innermostTargetId) {
      if (prevInnermostTargetId) {
        dirtyHandlerIds.push(prevInnermostTargetId);
      }
      if (innermostTargetId) {
        dirtyHandlerIds.push(innermostTargetId);
      }
    }
    return dirtyHandlerIds;
  }
  function areDirty(state, handlerIds) {
    if (state === NONE) {
      return false;
    }
    if (state === ALL || typeof handlerIds === 'undefined') {
      return true;
    }
    return _lodashArrayIntersection2['default'](handlerIds, state).length > 0;
  }
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/HandlerRegistry", ["npm:invariant@2.1.1", "npm:keymirror@0.1.1", "npm:lodash@3.10.1/lang/isArray", "npm:dnd-core@1.2.1/lib/utils/getNextUniqueId", "npm:dnd-core@1.2.1/lib/actions/registry"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  function _typeof(obj) {
    return obj && obj.constructor === Symbol ? 'symbol' : typeof obj;
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _keymirror = require("npm:keymirror@0.1.1");
  var _keymirror2 = _interopRequireDefault(_keymirror);
  var _lodashLangIsArray = require("npm:lodash@3.10.1/lang/isArray");
  var _lodashLangIsArray2 = _interopRequireDefault(_lodashLangIsArray);
  var _utilsGetNextUniqueId = require("npm:dnd-core@1.2.1/lib/utils/getNextUniqueId");
  var _utilsGetNextUniqueId2 = _interopRequireDefault(_utilsGetNextUniqueId);
  var _actionsRegistry = require("npm:dnd-core@1.2.1/lib/actions/registry");
  var HandlerRoles = _keymirror2['default']({
    SOURCE: null,
    TARGET: null
  });
  function validateSourceContract(source) {
    _invariant2['default'](typeof source.canDrag === 'function', 'Expected canDrag to be a function.');
    _invariant2['default'](typeof source.beginDrag === 'function', 'Expected beginDrag to be a function.');
    _invariant2['default'](typeof source.endDrag === 'function', 'Expected endDrag to be a function.');
  }
  function validateTargetContract(target) {
    _invariant2['default'](typeof target.canDrop === 'function', 'Expected canDrop to be a function.');
    _invariant2['default'](typeof target.hover === 'function', 'Expected hover to be a function.');
    _invariant2['default'](typeof target.drop === 'function', 'Expected beginDrag to be a function.');
  }
  function validateType(type, allowArray) {
    if (allowArray && _lodashLangIsArray2['default'](type)) {
      type.forEach(function(t) {
        return validateType(t, false);
      });
      return ;
    }
    _invariant2['default'](typeof type === 'string' || (typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'symbol', allowArray ? 'Type can only be a string, a symbol, or an array of either.' : 'Type can only be a string or a symbol.');
  }
  function getNextHandlerId(role) {
    var id = _utilsGetNextUniqueId2['default']().toString();
    switch (role) {
      case HandlerRoles.SOURCE:
        return 'S' + id;
      case HandlerRoles.TARGET:
        return 'T' + id;
      default:
        _invariant2['default'](false, 'Unknown role: ' + role);
    }
  }
  function parseRoleFromHandlerId(handlerId) {
    switch (handlerId[0]) {
      case 'S':
        return HandlerRoles.SOURCE;
      case 'T':
        return HandlerRoles.TARGET;
      default:
        _invariant2['default'](false, 'Cannot parse handler ID: ' + handlerId);
    }
  }
  var HandlerRegistry = (function() {
    function HandlerRegistry(store) {
      _classCallCheck(this, HandlerRegistry);
      this.store = store;
      this.types = {};
      this.handlers = {};
      this.pinnedSourceId = null;
      this.pinnedSource = null;
    }
    HandlerRegistry.prototype.addSource = function addSource(type, source) {
      validateType(type);
      validateSourceContract(source);
      var sourceId = this.addHandler(HandlerRoles.SOURCE, type, source);
      this.store.dispatch(_actionsRegistry.addSource(sourceId));
      return sourceId;
    };
    HandlerRegistry.prototype.addTarget = function addTarget(type, target) {
      validateType(type, true);
      validateTargetContract(target);
      var targetId = this.addHandler(HandlerRoles.TARGET, type, target);
      this.store.dispatch(_actionsRegistry.addTarget(targetId));
      return targetId;
    };
    HandlerRegistry.prototype.addHandler = function addHandler(role, type, handler) {
      var id = getNextHandlerId(role);
      this.types[id] = type;
      this.handlers[id] = handler;
      return id;
    };
    HandlerRegistry.prototype.containsHandler = function containsHandler(handler) {
      var _this = this;
      return Object.keys(this.handlers).some(function(key) {
        return _this.handlers[key] === handler;
      });
    };
    HandlerRegistry.prototype.getSource = function getSource(sourceId, includePinned) {
      _invariant2['default'](this.isSourceId(sourceId), 'Expected a valid source ID.');
      var isPinned = includePinned && sourceId === this.pinnedSourceId;
      var source = isPinned ? this.pinnedSource : this.handlers[sourceId];
      return source;
    };
    HandlerRegistry.prototype.getTarget = function getTarget(targetId) {
      _invariant2['default'](this.isTargetId(targetId), 'Expected a valid target ID.');
      return this.handlers[targetId];
    };
    HandlerRegistry.prototype.getSourceType = function getSourceType(sourceId) {
      _invariant2['default'](this.isSourceId(sourceId), 'Expected a valid source ID.');
      return this.types[sourceId];
    };
    HandlerRegistry.prototype.getTargetType = function getTargetType(targetId) {
      _invariant2['default'](this.isTargetId(targetId), 'Expected a valid target ID.');
      return this.types[targetId];
    };
    HandlerRegistry.prototype.isSourceId = function isSourceId(handlerId) {
      var role = parseRoleFromHandlerId(handlerId);
      return role === HandlerRoles.SOURCE;
    };
    HandlerRegistry.prototype.isTargetId = function isTargetId(handlerId) {
      var role = parseRoleFromHandlerId(handlerId);
      return role === HandlerRoles.TARGET;
    };
    HandlerRegistry.prototype.removeSource = function removeSource(sourceId) {
      _invariant2['default'](this.getSource(sourceId), 'Expected an existing source.');
      this.store.dispatch(_actionsRegistry.removeSource(sourceId));
      delete this.handlers[sourceId];
      delete this.types[sourceId];
    };
    HandlerRegistry.prototype.removeTarget = function removeTarget(targetId) {
      _invariant2['default'](this.getTarget(targetId), 'Expected an existing target.');
      this.store.dispatch(_actionsRegistry.removeTarget(targetId));
      delete this.handlers[targetId];
      delete this.types[targetId];
    };
    HandlerRegistry.prototype.pinSource = function pinSource(sourceId) {
      var source = this.getSource(sourceId);
      _invariant2['default'](source, 'Expected an existing source.');
      this.pinnedSourceId = sourceId;
      this.pinnedSource = source;
    };
    HandlerRegistry.prototype.unpinSource = function unpinSource() {
      _invariant2['default'](this.pinnedSource, 'No source is pinned at the time.');
      this.pinnedSourceId = null;
      this.pinnedSource = null;
    };
    return HandlerRegistry;
  })();
  exports['default'] = HandlerRegistry;
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseFor", ["npm:lodash@3.10.1/internal/createBaseFor"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var createBaseFor = require("npm:lodash@3.10.1/internal/createBaseFor");
  var baseFor = createBaseFor();
  module.exports = baseFor;
  global.define = __define;
  return module.exports;
});

System.register("npm:disposables@1.0.1", ["npm:disposables@1.0.1/modules/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:disposables@1.0.1/modules/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/bindConnector", ["npm:react-dnd@1.1.8/modules/bindConnectorMethod", "npm:disposables@1.0.1"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = bindConnector;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _bindConnectorMethod2 = require("npm:react-dnd@1.1.8/modules/bindConnectorMethod");
  var _bindConnectorMethod3 = _interopRequireDefault(_bindConnectorMethod2);
  var _disposables = require("npm:disposables@1.0.1");
  function bindConnector(connector, handlerId) {
    var compositeDisposable = new _disposables.CompositeDisposable();
    var handlerConnector = {};
    Object.keys(connector).forEach(function(key) {
      var _bindConnectorMethod = _bindConnectorMethod3['default'](handlerId, connector[key]);
      var disposable = _bindConnectorMethod.disposable;
      var ref = _bindConnectorMethod.ref;
      compositeDisposable.add(disposable);
      handlerConnector[key] = function() {
        return ref;
      };
    });
    return {
      disposable: compositeDisposable,
      handlerConnector: handlerConnector
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/$.cof", ["npm:core-js@0.9.18/library/modules/$", "npm:core-js@0.9.18/library/modules/$.wks"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      TAG = require("npm:core-js@0.9.18/library/modules/$.wks")('toStringTag'),
      toString = {}.toString;
  function cof(it) {
    return toString.call(it).slice(8, -1);
  }
  cof.classof = function(it) {
    var O,
        T;
    return it == undefined ? it === undefined ? 'Undefined' : 'Null' : typeof(T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
  };
  cof.set = function(it, tag, stat) {
    if (it && !$.has(it = stat ? it : it.prototype, TAG))
      $.hide(it, TAG, tag);
  };
  module.exports = cof;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/EnterLeaveCounter", ["npm:lodash@3.10.1/array/union", "npm:lodash@3.10.1/array/without"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var _lodashArrayUnion = require("npm:lodash@3.10.1/array/union");
  var _lodashArrayUnion2 = _interopRequireDefault(_lodashArrayUnion);
  var _lodashArrayWithout = require("npm:lodash@3.10.1/array/without");
  var _lodashArrayWithout2 = _interopRequireDefault(_lodashArrayWithout);
  var EnterLeaveCounter = (function() {
    function EnterLeaveCounter() {
      _classCallCheck(this, EnterLeaveCounter);
      this.entered = [];
    }
    EnterLeaveCounter.prototype.enter = function enter(enteringNode) {
      var previousLength = this.entered.length;
      this.entered = _lodashArrayUnion2['default'](this.entered.filter(function(node) {
        return document.documentElement.contains(node) && (!node.contains || node.contains(enteringNode));
      }), [enteringNode]);
      return previousLength === 0 && this.entered.length > 0;
    };
    EnterLeaveCounter.prototype.leave = function leave(leavingNode) {
      var previousLength = this.entered.length;
      this.entered = _lodashArrayWithout2['default'](this.entered.filter(function(node) {
        return document.documentElement.contains(node);
      }), leavingNode);
      return previousLength > 0 && this.entered.length === 0;
    };
    EnterLeaveCounter.prototype.reset = function reset() {
      this.entered = [];
    };
    return EnterLeaveCounter;
  })();
  exports['default'] = EnterLeaveCounter;
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/function/memoize", ["npm:lodash@3.10.1/internal/MapCache"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var MapCache = require("npm:lodash@3.10.1/internal/MapCache");
  var FUNC_ERROR_TEXT = 'Expected a function';
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new memoize.Cache;
    return memoized;
  }
  memoize.Cache = MapCache;
  module.exports = memoize;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/assignWith", ["npm:lodash@3.10.1/object/keys"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var keys = require("npm:lodash@3.10.1/object/keys");
  function assignWith(object, source, customizer) {
    var index = -1,
        props = keys(source),
        length = props.length;
    while (++index < length) {
      var key = props[index],
          value = object[key],
          result = customizer(value, source[key], key, object, source);
      if ((result === result ? (result !== value) : (value === value)) || (value === undefined && !(key in object))) {
        object[key] = result;
      }
    }
    return object;
  }
  module.exports = assignWith;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/createAssigner", ["npm:lodash@3.10.1/internal/bindCallback", "npm:lodash@3.10.1/internal/isIterateeCall", "npm:lodash@3.10.1/function/restParam"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var bindCallback = require("npm:lodash@3.10.1/internal/bindCallback"),
      isIterateeCall = require("npm:lodash@3.10.1/internal/isIterateeCall"),
      restParam = require("npm:lodash@3.10.1/function/restParam");
  function createAssigner(assigner) {
    return restParam(function(object, sources) {
      var index = -1,
          length = object == null ? 0 : sources.length,
          customizer = length > 2 ? sources[length - 2] : undefined,
          guard = length > 2 ? sources[2] : undefined,
          thisArg = length > 1 ? sources[length - 1] : undefined;
      if (typeof customizer == 'function') {
        customizer = bindCallback(customizer, thisArg, 5);
        length -= 2;
      } else {
        customizer = typeof thisArg == 'function' ? thisArg : undefined;
        length -= (customizer ? 1 : 0);
      }
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, customizer);
        }
      }
      return object;
    });
  }
  module.exports = createAssigner;
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2/lib/index", ["npm:redux@3.0.2/lib/createStore", "npm:redux@3.0.2/lib/utils/combineReducers", "npm:redux@3.0.2/lib/utils/bindActionCreators", "npm:redux@3.0.2/lib/utils/applyMiddleware", "npm:redux@3.0.2/lib/utils/compose"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _createStore = require("npm:redux@3.0.2/lib/createStore");
  var _createStore2 = _interopRequireDefault(_createStore);
  var _utilsCombineReducers = require("npm:redux@3.0.2/lib/utils/combineReducers");
  var _utilsCombineReducers2 = _interopRequireDefault(_utilsCombineReducers);
  var _utilsBindActionCreators = require("npm:redux@3.0.2/lib/utils/bindActionCreators");
  var _utilsBindActionCreators2 = _interopRequireDefault(_utilsBindActionCreators);
  var _utilsApplyMiddleware = require("npm:redux@3.0.2/lib/utils/applyMiddleware");
  var _utilsApplyMiddleware2 = _interopRequireDefault(_utilsApplyMiddleware);
  var _utilsCompose = require("npm:redux@3.0.2/lib/utils/compose");
  var _utilsCompose2 = _interopRequireDefault(_utilsCompose);
  exports.createStore = _createStore2['default'];
  exports.combineReducers = _utilsCombineReducers2['default'];
  exports.bindActionCreators = _utilsBindActionCreators2['default'];
  exports.applyMiddleware = _utilsApplyMiddleware2['default'];
  exports.compose = _utilsCompose2['default'];
  global.define = __define;
  return module.exports;
});

System.register("github:jspm/nodelibs-process@0.1.2", ["github:jspm/nodelibs-process@0.1.2/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("github:jspm/nodelibs-process@0.1.2/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactBrowserEventEmitter", ["npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/EventPluginHub", "npm:react@0.14.0/lib/EventPluginRegistry", "npm:react@0.14.0/lib/ReactEventEmitterMixin", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ViewportMetrics", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/isEventSupported", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
    var EventPluginHub = require("npm:react@0.14.0/lib/EventPluginHub");
    var EventPluginRegistry = require("npm:react@0.14.0/lib/EventPluginRegistry");
    var ReactEventEmitterMixin = require("npm:react@0.14.0/lib/ReactEventEmitterMixin");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var ViewportMetrics = require("npm:react@0.14.0/lib/ViewportMetrics");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var isEventSupported = require("npm:react@0.14.0/lib/isEventSupported");
    var alreadyListeningTo = {};
    var isMonitoringScrollValue = false;
    var reactTopListenersCounter = 0;
    var topEventMapping = {
      topAbort: 'abort',
      topBlur: 'blur',
      topCanPlay: 'canplay',
      topCanPlayThrough: 'canplaythrough',
      topChange: 'change',
      topClick: 'click',
      topCompositionEnd: 'compositionend',
      topCompositionStart: 'compositionstart',
      topCompositionUpdate: 'compositionupdate',
      topContextMenu: 'contextmenu',
      topCopy: 'copy',
      topCut: 'cut',
      topDoubleClick: 'dblclick',
      topDrag: 'drag',
      topDragEnd: 'dragend',
      topDragEnter: 'dragenter',
      topDragExit: 'dragexit',
      topDragLeave: 'dragleave',
      topDragOver: 'dragover',
      topDragStart: 'dragstart',
      topDrop: 'drop',
      topDurationChange: 'durationchange',
      topEmptied: 'emptied',
      topEncrypted: 'encrypted',
      topEnded: 'ended',
      topError: 'error',
      topFocus: 'focus',
      topInput: 'input',
      topKeyDown: 'keydown',
      topKeyPress: 'keypress',
      topKeyUp: 'keyup',
      topLoadedData: 'loadeddata',
      topLoadedMetadata: 'loadedmetadata',
      topLoadStart: 'loadstart',
      topMouseDown: 'mousedown',
      topMouseMove: 'mousemove',
      topMouseOut: 'mouseout',
      topMouseOver: 'mouseover',
      topMouseUp: 'mouseup',
      topPaste: 'paste',
      topPause: 'pause',
      topPlay: 'play',
      topPlaying: 'playing',
      topProgress: 'progress',
      topRateChange: 'ratechange',
      topScroll: 'scroll',
      topSeeked: 'seeked',
      topSeeking: 'seeking',
      topSelectionChange: 'selectionchange',
      topStalled: 'stalled',
      topSuspend: 'suspend',
      topTextInput: 'textInput',
      topTimeUpdate: 'timeupdate',
      topTouchCancel: 'touchcancel',
      topTouchEnd: 'touchend',
      topTouchMove: 'touchmove',
      topTouchStart: 'touchstart',
      topVolumeChange: 'volumechange',
      topWaiting: 'waiting',
      topWheel: 'wheel'
    };
    var topListenersIDKey = '_reactListenersID' + String(Math.random()).slice(2);
    function getListeningForDocument(mountAt) {
      if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
        mountAt[topListenersIDKey] = reactTopListenersCounter++;
        alreadyListeningTo[mountAt[topListenersIDKey]] = {};
      }
      return alreadyListeningTo[mountAt[topListenersIDKey]];
    }
    var ReactBrowserEventEmitter = assign({}, ReactEventEmitterMixin, {
      ReactEventListener: null,
      injection: {injectReactEventListener: function(ReactEventListener) {
          ReactEventListener.setHandleTopLevel(ReactBrowserEventEmitter.handleTopLevel);
          ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
        }},
      setEnabled: function(enabled) {
        if (ReactBrowserEventEmitter.ReactEventListener) {
          ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
        }
      },
      isEnabled: function() {
        return !!(ReactBrowserEventEmitter.ReactEventListener && ReactBrowserEventEmitter.ReactEventListener.isEnabled());
      },
      listenTo: function(registrationName, contentDocumentHandle) {
        var mountAt = contentDocumentHandle;
        var isListening = getListeningForDocument(mountAt);
        var dependencies = EventPluginRegistry.registrationNameDependencies[registrationName];
        var topLevelTypes = EventConstants.topLevelTypes;
        for (var i = 0; i < dependencies.length; i++) {
          var dependency = dependencies[i];
          if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
            if (dependency === topLevelTypes.topWheel) {
              if (isEventSupported('wheel')) {
                ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'wheel', mountAt);
              } else if (isEventSupported('mousewheel')) {
                ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'mousewheel', mountAt);
              } else {
                ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'DOMMouseScroll', mountAt);
              }
            } else if (dependency === topLevelTypes.topScroll) {
              if (isEventSupported('scroll', true)) {
                ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topScroll, 'scroll', mountAt);
              } else {
                ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topScroll, 'scroll', ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE);
              }
            } else if (dependency === topLevelTypes.topFocus || dependency === topLevelTypes.topBlur) {
              if (isEventSupported('focus', true)) {
                ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topFocus, 'focus', mountAt);
                ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topBlur, 'blur', mountAt);
              } else if (isEventSupported('focusin')) {
                ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topFocus, 'focusin', mountAt);
                ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topBlur, 'focusout', mountAt);
              }
              isListening[topLevelTypes.topBlur] = true;
              isListening[topLevelTypes.topFocus] = true;
            } else if (topEventMapping.hasOwnProperty(dependency)) {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(dependency, topEventMapping[dependency], mountAt);
            }
            isListening[dependency] = true;
          }
        }
      },
      trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
        return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelType, handlerBaseName, handle);
      },
      trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
        return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelType, handlerBaseName, handle);
      },
      ensureScrollValueMonitoring: function() {
        if (!isMonitoringScrollValue) {
          var refresh = ViewportMetrics.refreshScrollValues;
          ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
          isMonitoringScrollValue = true;
        }
      },
      eventNameDispatchConfigs: EventPluginHub.eventNameDispatchConfigs,
      registrationNameModules: EventPluginHub.registrationNameModules,
      putListener: EventPluginHub.putListener,
      getListener: EventPluginHub.getListener,
      deleteListener: EventPluginHub.deleteListener,
      deleteAllListeners: EventPluginHub.deleteAllListeners
    });
    ReactPerf.measureMethods(ReactBrowserEventEmitter, 'ReactBrowserEventEmitter', {
      putListener: 'putListener',
      deleteListener: 'deleteListener'
    });
    module.exports = ReactBrowserEventEmitter;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactUpdateQueue", ["npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactInstanceMap", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactInstanceMap = require("npm:react@0.14.0/lib/ReactInstanceMap");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    function enqueueUpdate(internalInstance) {
      ReactUpdates.enqueueUpdate(internalInstance);
    }
    function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
      var internalInstance = ReactInstanceMap.get(publicInstance);
      if (!internalInstance) {
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(!callerName, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, publicInstance.constructor.displayName) : undefined;
        }
        return null;
      }
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, '%s(...): Cannot update during an existing state transition ' + '(such as within `render`). Render methods should be a pure function ' + 'of props and state.', callerName) : undefined;
      }
      return internalInstance;
    }
    var ReactUpdateQueue = {
      isMounted: function(publicInstance) {
        if (process.env.NODE_ENV !== 'production') {
          var owner = ReactCurrentOwner.current;
          if (owner !== null) {
            process.env.NODE_ENV !== 'production' ? warning(owner._warnedAboutRefsInRender, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component') : undefined;
            owner._warnedAboutRefsInRender = true;
          }
        }
        var internalInstance = ReactInstanceMap.get(publicInstance);
        if (internalInstance) {
          return !!internalInstance._renderedComponent;
        } else {
          return false;
        }
      },
      enqueueCallback: function(publicInstance, callback) {
        !(typeof callback === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + '`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 'isn\'t callable.') : invariant(false) : undefined;
        var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);
        if (!internalInstance) {
          return null;
        }
        if (internalInstance._pendingCallbacks) {
          internalInstance._pendingCallbacks.push(callback);
        } else {
          internalInstance._pendingCallbacks = [callback];
        }
        enqueueUpdate(internalInstance);
      },
      enqueueCallbackInternal: function(internalInstance, callback) {
        !(typeof callback === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + '`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 'isn\'t callable.') : invariant(false) : undefined;
        if (internalInstance._pendingCallbacks) {
          internalInstance._pendingCallbacks.push(callback);
        } else {
          internalInstance._pendingCallbacks = [callback];
        }
        enqueueUpdate(internalInstance);
      },
      enqueueForceUpdate: function(publicInstance) {
        var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'forceUpdate');
        if (!internalInstance) {
          return ;
        }
        internalInstance._pendingForceUpdate = true;
        enqueueUpdate(internalInstance);
      },
      enqueueReplaceState: function(publicInstance, completeState) {
        var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'replaceState');
        if (!internalInstance) {
          return ;
        }
        internalInstance._pendingStateQueue = [completeState];
        internalInstance._pendingReplaceState = true;
        enqueueUpdate(internalInstance);
      },
      enqueueSetState: function(publicInstance, partialState) {
        var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setState');
        if (!internalInstance) {
          return ;
        }
        var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
        queue.push(partialState);
        enqueueUpdate(internalInstance);
      },
      enqueueSetProps: function(publicInstance, partialProps) {
        var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setProps');
        if (!internalInstance) {
          return ;
        }
        ReactUpdateQueue.enqueueSetPropsInternal(internalInstance, partialProps);
      },
      enqueueSetPropsInternal: function(internalInstance, partialProps) {
        var topLevelWrapper = internalInstance._topLevelWrapper;
        !topLevelWrapper ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setProps(...): You called `setProps` on a ' + 'component with a parent. This is an anti-pattern since props will ' + 'get reactively updated when rendered. Instead, change the owner\'s ' + '`render` method to pass the correct value as props to the component ' + 'where it is created.') : invariant(false) : undefined;
        var wrapElement = topLevelWrapper._pendingElement || topLevelWrapper._currentElement;
        var element = wrapElement.props;
        var props = assign({}, element.props, partialProps);
        topLevelWrapper._pendingElement = ReactElement.cloneAndReplaceProps(wrapElement, ReactElement.cloneAndReplaceProps(element, props));
        enqueueUpdate(topLevelWrapper);
      },
      enqueueReplaceProps: function(publicInstance, props) {
        var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'replaceProps');
        if (!internalInstance) {
          return ;
        }
        ReactUpdateQueue.enqueueReplacePropsInternal(internalInstance, props);
      },
      enqueueReplacePropsInternal: function(internalInstance, props) {
        var topLevelWrapper = internalInstance._topLevelWrapper;
        !topLevelWrapper ? process.env.NODE_ENV !== 'production' ? invariant(false, 'replaceProps(...): You called `replaceProps` on a ' + 'component with a parent. This is an anti-pattern since props will ' + 'get reactively updated when rendered. Instead, change the owner\'s ' + '`render` method to pass the correct value as props to the component ' + 'where it is created.') : invariant(false) : undefined;
        var wrapElement = topLevelWrapper._pendingElement || topLevelWrapper._currentElement;
        var element = wrapElement.props;
        topLevelWrapper._pendingElement = ReactElement.cloneAndReplaceProps(wrapElement, ReactElement.cloneAndReplaceProps(element, props));
        enqueueUpdate(topLevelWrapper);
      },
      enqueueElementInternal: function(internalInstance, newElement) {
        internalInstance._pendingElement = newElement;
        enqueueUpdate(internalInstance);
      }
    };
    module.exports = ReactUpdateQueue;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMInput", ["npm:react@0.14.0/lib/ReactDOMIDOperations", "npm:react@0.14.0/lib/LinkedValueUtils", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactDOMIDOperations = require("npm:react@0.14.0/lib/ReactDOMIDOperations");
    var LinkedValueUtils = require("npm:react@0.14.0/lib/LinkedValueUtils");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var instancesByReactID = {};
    function forceUpdateIfMounted() {
      if (this._rootNodeID) {
        ReactDOMInput.updateWrapper(this);
      }
    }
    var ReactDOMInput = {
      getNativeProps: function(inst, props, context) {
        var value = LinkedValueUtils.getValue(props);
        var checked = LinkedValueUtils.getChecked(props);
        var nativeProps = assign({}, props, {
          defaultChecked: undefined,
          defaultValue: undefined,
          value: value != null ? value : inst._wrapperState.initialValue,
          checked: checked != null ? checked : inst._wrapperState.initialChecked,
          onChange: inst._wrapperState.onChange
        });
        return nativeProps;
      },
      mountWrapper: function(inst, props) {
        if (process.env.NODE_ENV !== 'production') {
          LinkedValueUtils.checkPropTypes('input', props, inst._currentElement._owner);
        }
        var defaultValue = props.defaultValue;
        inst._wrapperState = {
          initialChecked: props.defaultChecked || false,
          initialValue: defaultValue != null ? defaultValue : null,
          onChange: _handleChange.bind(inst)
        };
      },
      mountReadyWrapper: function(inst) {
        instancesByReactID[inst._rootNodeID] = inst;
      },
      unmountWrapper: function(inst) {
        delete instancesByReactID[inst._rootNodeID];
      },
      updateWrapper: function(inst) {
        var props = inst._currentElement.props;
        var checked = props.checked;
        if (checked != null) {
          ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'checked', checked || false);
        }
        var value = LinkedValueUtils.getValue(props);
        if (value != null) {
          ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'value', '' + value);
        }
      }
    };
    function _handleChange(event) {
      var props = this._currentElement.props;
      var returnValue = LinkedValueUtils.executeOnChange(props, event);
      ReactUpdates.asap(forceUpdateIfMounted, this);
      var name = props.name;
      if (props.type === 'radio' && name != null) {
        var rootNode = ReactMount.getNode(this._rootNodeID);
        var queryRoot = rootNode;
        while (queryRoot.parentNode) {
          queryRoot = queryRoot.parentNode;
        }
        var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');
        for (var i = 0; i < group.length; i++) {
          var otherNode = group[i];
          if (otherNode === rootNode || otherNode.form !== rootNode.form) {
            continue;
          }
          var otherID = ReactMount.getID(otherNode);
          !otherID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOMInput: Mixing React and non-React radio inputs with the ' + 'same `name` is not supported.') : invariant(false) : undefined;
          var otherInstance = instancesByReactID[otherID];
          !otherInstance ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOMInput: Unknown radio button ID %s.', otherID) : invariant(false) : undefined;
          ReactUpdates.asap(forceUpdateIfMounted, otherInstance);
        }
      }
      return returnValue;
    }
    module.exports = ReactDOMInput;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactInjection", ["npm:react@0.14.0/lib/DOMProperty", "npm:react@0.14.0/lib/EventPluginHub", "npm:react@0.14.0/lib/ReactComponentEnvironment", "npm:react@0.14.0/lib/ReactClass", "npm:react@0.14.0/lib/ReactEmptyComponent", "npm:react@0.14.0/lib/ReactBrowserEventEmitter", "npm:react@0.14.0/lib/ReactNativeComponent", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ReactRootIndex", "npm:react@0.14.0/lib/ReactUpdates"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
  var EventPluginHub = require("npm:react@0.14.0/lib/EventPluginHub");
  var ReactComponentEnvironment = require("npm:react@0.14.0/lib/ReactComponentEnvironment");
  var ReactClass = require("npm:react@0.14.0/lib/ReactClass");
  var ReactEmptyComponent = require("npm:react@0.14.0/lib/ReactEmptyComponent");
  var ReactBrowserEventEmitter = require("npm:react@0.14.0/lib/ReactBrowserEventEmitter");
  var ReactNativeComponent = require("npm:react@0.14.0/lib/ReactNativeComponent");
  var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
  var ReactRootIndex = require("npm:react@0.14.0/lib/ReactRootIndex");
  var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
  var ReactInjection = {
    Component: ReactComponentEnvironment.injection,
    Class: ReactClass.injection,
    DOMProperty: DOMProperty.injection,
    EmptyComponent: ReactEmptyComponent.injection,
    EventPluginHub: EventPluginHub.injection,
    EventEmitter: ReactBrowserEventEmitter.injection,
    NativeComponent: ReactNativeComponent.injection,
    Perf: ReactPerf.injection,
    RootIndex: ReactRootIndex.injection,
    Updates: ReactUpdates.injection
  };
  module.exports = ReactInjection;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactReconcileTransaction", ["npm:react@0.14.0/lib/CallbackQueue", "npm:react@0.14.0/lib/PooledClass", "npm:react@0.14.0/lib/ReactBrowserEventEmitter", "npm:react@0.14.0/lib/ReactDOMFeatureFlags", "npm:react@0.14.0/lib/ReactInputSelection", "npm:react@0.14.0/lib/Transaction", "npm:react@0.14.0/lib/Object.assign"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var CallbackQueue = require("npm:react@0.14.0/lib/CallbackQueue");
  var PooledClass = require("npm:react@0.14.0/lib/PooledClass");
  var ReactBrowserEventEmitter = require("npm:react@0.14.0/lib/ReactBrowserEventEmitter");
  var ReactDOMFeatureFlags = require("npm:react@0.14.0/lib/ReactDOMFeatureFlags");
  var ReactInputSelection = require("npm:react@0.14.0/lib/ReactInputSelection");
  var Transaction = require("npm:react@0.14.0/lib/Transaction");
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var SELECTION_RESTORATION = {
    initialize: ReactInputSelection.getSelectionInformation,
    close: ReactInputSelection.restoreSelection
  };
  var EVENT_SUPPRESSION = {
    initialize: function() {
      var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
      ReactBrowserEventEmitter.setEnabled(false);
      return currentlyEnabled;
    },
    close: function(previouslyEnabled) {
      ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
    }
  };
  var ON_DOM_READY_QUEUEING = {
    initialize: function() {
      this.reactMountReady.reset();
    },
    close: function() {
      this.reactMountReady.notifyAll();
    }
  };
  var TRANSACTION_WRAPPERS = [SELECTION_RESTORATION, EVENT_SUPPRESSION, ON_DOM_READY_QUEUEING];
  function ReactReconcileTransaction(forceHTML) {
    this.reinitializeTransaction();
    this.renderToStaticMarkup = false;
    this.reactMountReady = CallbackQueue.getPooled(null);
    this.useCreateElement = !forceHTML && ReactDOMFeatureFlags.useCreateElement;
  }
  var Mixin = {
    getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS;
    },
    getReactMountReady: function() {
      return this.reactMountReady;
    },
    destructor: function() {
      CallbackQueue.release(this.reactMountReady);
      this.reactMountReady = null;
    }
  };
  assign(ReactReconcileTransaction.prototype, Transaction.Mixin, Mixin);
  PooledClass.addPoolingTo(ReactReconcileTransaction);
  module.exports = ReactReconcileTransaction;
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/core-js/object/get-own-property-descriptor", ["npm:core-js@0.9.18/library/fn/object/get-own-property-descriptor"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/get-own-property-descriptor"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/fn/object/set-prototype-of", ["npm:core-js@0.9.18/library/modules/es6.object.set-prototype-of", "npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  require("npm:core-js@0.9.18/library/modules/es6.object.set-prototype-of");
  module.exports = require("npm:core-js@0.9.18/library/modules/$").core.Object.setPrototypeOf;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/getNative", ["npm:lodash@3.10.1/lang/isNative"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var isNative = require("npm:lodash@3.10.1/lang/isNative");
  function getNative(object, key) {
    var value = object == null ? undefined : object[key];
    return isNative(value) ? value : undefined;
  }
  module.exports = getNative;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseDifference", ["npm:lodash@3.10.1/internal/baseIndexOf", "npm:lodash@3.10.1/internal/cacheIndexOf", "npm:lodash@3.10.1/internal/createCache"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseIndexOf = require("npm:lodash@3.10.1/internal/baseIndexOf"),
      cacheIndexOf = require("npm:lodash@3.10.1/internal/cacheIndexOf"),
      createCache = require("npm:lodash@3.10.1/internal/createCache");
  var LARGE_ARRAY_SIZE = 200;
  function baseDifference(array, values) {
    var length = array ? array.length : 0,
        result = [];
    if (!length) {
      return result;
    }
    var index = -1,
        indexOf = baseIndexOf,
        isCommon = true,
        cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
        valuesLength = values.length;
    if (cache) {
      indexOf = cacheIndexOf;
      isCommon = false;
      values = cache;
    }
    outer: while (++index < length) {
      var value = array[index];
      if (isCommon && value === value) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === value) {
            continue outer;
          }
        }
        result.push(value);
      } else if (indexOf(values, value, 0) < 0) {
        result.push(value);
      }
    }
    return result;
  }
  module.exports = baseDifference;
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/DragDropMonitor", ["npm:invariant@2.1.1", "npm:dnd-core@1.2.1/lib/utils/matchesType", "npm:lodash@3.10.1/lang/isArray", "npm:dnd-core@1.2.1/lib/HandlerRegistry", "npm:dnd-core@1.2.1/lib/reducers/dragOffset", "npm:dnd-core@1.2.1/lib/reducers/dirtyHandlerIds"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _utilsMatchesType = require("npm:dnd-core@1.2.1/lib/utils/matchesType");
  var _utilsMatchesType2 = _interopRequireDefault(_utilsMatchesType);
  var _lodashLangIsArray = require("npm:lodash@3.10.1/lang/isArray");
  var _lodashLangIsArray2 = _interopRequireDefault(_lodashLangIsArray);
  var _HandlerRegistry = require("npm:dnd-core@1.2.1/lib/HandlerRegistry");
  var _HandlerRegistry2 = _interopRequireDefault(_HandlerRegistry);
  var _reducersDragOffset = require("npm:dnd-core@1.2.1/lib/reducers/dragOffset");
  var _reducersDirtyHandlerIds = require("npm:dnd-core@1.2.1/lib/reducers/dirtyHandlerIds");
  var DragDropMonitor = (function() {
    function DragDropMonitor(store) {
      _classCallCheck(this, DragDropMonitor);
      this.store = store;
      this.registry = new _HandlerRegistry2['default'](store);
    }
    DragDropMonitor.prototype.subscribeToStateChange = function subscribeToStateChange(listener) {
      var _this = this;
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var handlerIds = _ref.handlerIds;
      _invariant2['default'](typeof listener === 'function', 'listener must be a function.');
      _invariant2['default'](typeof handlerIds === 'undefined' || _lodashLangIsArray2['default'](handlerIds), 'handlerIds, when specified, must be an array of strings.');
      var handleChange = function handleChange() {
        if (_reducersDirtyHandlerIds.areDirty(_this.store.getState().dirtyHandlerIds, handlerIds)) {
          listener();
        }
      };
      return this.store.subscribe(handleChange);
    };
    DragDropMonitor.prototype.subscribeToOffsetChange = function subscribeToOffsetChange(listener) {
      var _this2 = this;
      _invariant2['default'](typeof listener === 'function', 'listener must be a function.');
      var previousState = this.store.getState().dragOffset;
      var handleChange = function handleChange() {
        var nextState = _this2.store.getState().dragOffset;
        if (nextState === previousState) {
          return ;
        }
        previousState = nextState;
        listener();
      };
      return this.store.subscribe(handleChange);
    };
    DragDropMonitor.prototype.canDragSource = function canDragSource(sourceId) {
      var source = this.registry.getSource(sourceId);
      _invariant2['default'](source, 'Expected to find a valid source.');
      if (this.isDragging()) {
        return false;
      }
      return source.canDrag(this, sourceId);
    };
    DragDropMonitor.prototype.canDropOnTarget = function canDropOnTarget(targetId) {
      var target = this.registry.getTarget(targetId);
      _invariant2['default'](target, 'Expected to find a valid target.');
      if (!this.isDragging() || this.didDrop()) {
        return false;
      }
      var targetType = this.registry.getTargetType(targetId);
      var draggedItemType = this.getItemType();
      return _utilsMatchesType2['default'](targetType, draggedItemType) && target.canDrop(this, targetId);
    };
    DragDropMonitor.prototype.isDragging = function isDragging() {
      return Boolean(this.getItemType());
    };
    DragDropMonitor.prototype.isDraggingSource = function isDraggingSource(sourceId) {
      var source = this.registry.getSource(sourceId, true);
      _invariant2['default'](source, 'Expected to find a valid source.');
      if (!this.isDragging() || !this.isSourcePublic()) {
        return false;
      }
      var sourceType = this.registry.getSourceType(sourceId);
      var draggedItemType = this.getItemType();
      if (sourceType !== draggedItemType) {
        return false;
      }
      return source.isDragging(this, sourceId);
    };
    DragDropMonitor.prototype.isOverTarget = function isOverTarget(targetId) {
      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var _ref2$shallow = _ref2.shallow;
      var shallow = _ref2$shallow === undefined ? false : _ref2$shallow;
      if (!this.isDragging()) {
        return false;
      }
      var targetType = this.registry.getTargetType(targetId);
      var draggedItemType = this.getItemType();
      if (!_utilsMatchesType2['default'](targetType, draggedItemType)) {
        return false;
      }
      var targetIds = this.getTargetIds();
      if (!targetIds.length) {
        return false;
      }
      var index = targetIds.indexOf(targetId);
      if (shallow) {
        return index === targetIds.length - 1;
      } else {
        return index > -1;
      }
    };
    DragDropMonitor.prototype.getItemType = function getItemType() {
      return this.store.getState().dragOperation.itemType;
    };
    DragDropMonitor.prototype.getItem = function getItem() {
      return this.store.getState().dragOperation.item;
    };
    DragDropMonitor.prototype.getSourceId = function getSourceId() {
      return this.store.getState().dragOperation.sourceId;
    };
    DragDropMonitor.prototype.getTargetIds = function getTargetIds() {
      return this.store.getState().dragOperation.targetIds;
    };
    DragDropMonitor.prototype.getDropResult = function getDropResult() {
      return this.store.getState().dragOperation.dropResult;
    };
    DragDropMonitor.prototype.didDrop = function didDrop() {
      return this.store.getState().dragOperation.didDrop;
    };
    DragDropMonitor.prototype.isSourcePublic = function isSourcePublic() {
      return this.store.getState().dragOperation.isSourcePublic;
    };
    DragDropMonitor.prototype.getInitialClientOffset = function getInitialClientOffset() {
      return this.store.getState().dragOffset.initialClientOffset;
    };
    DragDropMonitor.prototype.getInitialSourceClientOffset = function getInitialSourceClientOffset() {
      return this.store.getState().dragOffset.initialSourceClientOffset;
    };
    DragDropMonitor.prototype.getClientOffset = function getClientOffset() {
      return this.store.getState().dragOffset.clientOffset;
    };
    DragDropMonitor.prototype.getSourceClientOffset = function getSourceClientOffset() {
      return _reducersDragOffset.getSourceClientOffset(this.store.getState().dragOffset);
    };
    DragDropMonitor.prototype.getDifferenceFromInitialOffset = function getDifferenceFromInitialOffset() {
      return _reducersDragOffset.getDifferenceFromInitialOffset(this.store.getState().dragOffset);
    };
    return DragDropMonitor;
  })();
  exports['default'] = DragDropMonitor;
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/internal/baseForIn", ["npm:lodash@3.10.1/internal/baseFor", "npm:lodash@3.10.1/object/keysIn"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseFor = require("npm:lodash@3.10.1/internal/baseFor"),
      keysIn = require("npm:lodash@3.10.1/object/keysIn");
  function baseForIn(object, iteratee) {
    return baseFor(object, iteratee, keysIn);
  }
  module.exports = baseForIn;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/decorateHandler", ["npm:react@0.14.0", "npm:disposables@1.0.1", "npm:react-dnd@1.1.8/modules/utils/shallowEqual", "npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar", "npm:lodash@3.10.1/lang/isPlainObject", "npm:invariant@2.1.1", "npm:react-dnd@1.1.8/modules/bindConnector", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _createClass = (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ('value' in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    exports['default'] = decorateHandler;
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
    var _react = require("npm:react@0.14.0");
    var _react2 = _interopRequireDefault(_react);
    var _disposables = require("npm:disposables@1.0.1");
    var _utilsShallowEqual = require("npm:react-dnd@1.1.8/modules/utils/shallowEqual");
    var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
    var _utilsShallowEqualScalar = require("npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar");
    var _utilsShallowEqualScalar2 = _interopRequireDefault(_utilsShallowEqualScalar);
    var _lodashLangIsPlainObject = require("npm:lodash@3.10.1/lang/isPlainObject");
    var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);
    var _invariant = require("npm:invariant@2.1.1");
    var _invariant2 = _interopRequireDefault(_invariant);
    var _bindConnector2 = require("npm:react-dnd@1.1.8/modules/bindConnector");
    var _bindConnector3 = _interopRequireDefault(_bindConnector2);
    function decorateHandler(_ref) {
      var DecoratedComponent = _ref.DecoratedComponent;
      var createHandler = _ref.createHandler;
      var createMonitor = _ref.createMonitor;
      var createConnector = _ref.createConnector;
      var registerHandler = _ref.registerHandler;
      var containerDisplayName = _ref.containerDisplayName;
      var getType = _ref.getType;
      var collect = _ref.collect;
      var options = _ref.options;
      var _options$arePropsEqual = options.arePropsEqual;
      var arePropsEqual = _options$arePropsEqual === undefined ? _utilsShallowEqualScalar2['default'] : _options$arePropsEqual;
      var displayName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';
      return (function(_Component) {
        _inherits(DragDropContainer, _Component);
        DragDropContainer.prototype.getHandlerId = function getHandlerId() {
          return this.handlerId;
        };
        DragDropContainer.prototype.getDecoratedComponentInstance = function getDecoratedComponentInstance() {
          return this.decoratedComponentInstance;
        };
        DragDropContainer.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
          return !arePropsEqual(nextProps, this.props) || !_utilsShallowEqual2['default'](nextState, this.state);
        };
        _createClass(DragDropContainer, null, [{
          key: 'DecoratedComponent',
          value: DecoratedComponent,
          enumerable: true
        }, {
          key: 'displayName',
          value: containerDisplayName + '(' + displayName + ')',
          enumerable: true
        }, {
          key: 'contextTypes',
          value: {dragDropManager: _react.PropTypes.object.isRequired},
          enumerable: true
        }]);
        function DragDropContainer(props, context) {
          _classCallCheck(this, DragDropContainer);
          _Component.call(this, props, context);
          this.handleChange = this.handleChange.bind(this);
          this.handleChildRef = this.handleChildRef.bind(this);
          _invariant2['default'](typeof this.context.dragDropManager === 'object', 'Could not find the drag and drop manager in the context of %s. ' + 'Make sure to wrap the top-level component of your app with DragDropContext. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-troubleshooting.html#could-not-find-the-drag-and-drop-manager-in-the-context', displayName, displayName);
          this.manager = this.context.dragDropManager;
          this.handlerMonitor = createMonitor(this.manager);
          this.handler = createHandler(this.handlerMonitor);
          this.disposable = new _disposables.SerialDisposable();
          this.receiveProps(props);
          this.state = this.getCurrentState();
        }
        DragDropContainer.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
          if (!arePropsEqual(nextProps, this.props)) {
            this.receiveProps(nextProps);
            this.handleChange();
          }
        };
        DragDropContainer.prototype.componentWillUnmount = function componentWillUnmount() {
          this.disposable.dispose();
        };
        DragDropContainer.prototype.receiveProps = function receiveProps(props) {
          this.handler.receiveProps(props);
          this.receiveType(getType(props));
        };
        DragDropContainer.prototype.receiveType = function receiveType(type) {
          if (type === this.currentType) {
            return ;
          }
          this.currentType = type;
          var _registerHandler = registerHandler(type, this.handler, this.manager);
          var handlerId = _registerHandler.handlerId;
          var unregister = _registerHandler.unregister;
          var connector = createConnector(this.manager.getBackend());
          var _bindConnector = _bindConnector3['default'](connector, handlerId);
          var handlerConnector = _bindConnector.handlerConnector;
          var connectorDisposable = _bindConnector.disposable;
          this.handlerId = handlerId;
          this.handlerConnector = handlerConnector;
          this.handlerMonitor.receiveHandlerId(handlerId);
          var globalMonitor = this.manager.getMonitor();
          var unsubscribe = globalMonitor.subscribeToStateChange(this.handleChange, {handlerIds: [handlerId]});
          this.disposable.setDisposable(new _disposables.CompositeDisposable(new _disposables.Disposable(unsubscribe), new _disposables.Disposable(unregister), connectorDisposable));
        };
        DragDropContainer.prototype.handleChange = function handleChange() {
          var nextState = this.getCurrentState();
          if (!_utilsShallowEqual2['default'](nextState, this.state)) {
            this.setState(nextState);
          }
        };
        DragDropContainer.prototype.handleChildRef = function handleChildRef(component) {
          this.decoratedComponentInstance = component;
          this.handler.receiveComponent(component);
        };
        DragDropContainer.prototype.getCurrentState = function getCurrentState() {
          var nextState = collect(this.handlerConnector, this.handlerMonitor);
          if (process.env.NODE_ENV !== 'production') {
            _invariant2['default'](_lodashLangIsPlainObject2['default'](nextState), 'Expected `collect` specified as the second argument to ' + '%s for %s to return a plain object of props to inject. ' + 'Instead, received %s.', containerDisplayName, displayName, nextState);
          }
          return nextState;
        };
        DragDropContainer.prototype.render = function render() {
          return _react2['default'].createElement(DecoratedComponent, _extends({}, this.props, this.state, {ref: this.handleChildRef}));
        };
        return DragDropContainer;
      })(_react.Component);
    }
    module.exports = exports['default'];
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/modules/es6.symbol", ["npm:core-js@0.9.18/library/modules/$", "npm:core-js@0.9.18/library/modules/$.cof", "npm:core-js@0.9.18/library/modules/$.uid", "npm:core-js@0.9.18/library/modules/$.shared", "npm:core-js@0.9.18/library/modules/$.def", "npm:core-js@0.9.18/library/modules/$.redef", "npm:core-js@0.9.18/library/modules/$.keyof", "npm:core-js@0.9.18/library/modules/$.enum-keys", "npm:core-js@0.9.18/library/modules/$.assert", "npm:core-js@0.9.18/library/modules/$.get-names", "npm:core-js@0.9.18/library/modules/$.wks"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("npm:core-js@0.9.18/library/modules/$"),
      setTag = require("npm:core-js@0.9.18/library/modules/$.cof").set,
      uid = require("npm:core-js@0.9.18/library/modules/$.uid"),
      shared = require("npm:core-js@0.9.18/library/modules/$.shared"),
      $def = require("npm:core-js@0.9.18/library/modules/$.def"),
      $redef = require("npm:core-js@0.9.18/library/modules/$.redef"),
      keyOf = require("npm:core-js@0.9.18/library/modules/$.keyof"),
      enumKeys = require("npm:core-js@0.9.18/library/modules/$.enum-keys"),
      assertObject = require("npm:core-js@0.9.18/library/modules/$.assert").obj,
      ObjectProto = Object.prototype,
      DESC = $.DESC,
      has = $.has,
      $create = $.create,
      getDesc = $.getDesc,
      setDesc = $.setDesc,
      desc = $.desc,
      $names = require("npm:core-js@0.9.18/library/modules/$.get-names"),
      getNames = $names.get,
      toObject = $.toObject,
      $Symbol = $.g.Symbol,
      setter = false,
      TAG = uid('tag'),
      HIDDEN = uid('hidden'),
      _propertyIsEnumerable = {}.propertyIsEnumerable,
      SymbolRegistry = shared('symbol-registry'),
      AllSymbols = shared('symbols'),
      useNative = $.isFunction($Symbol);
  var setSymbolDesc = DESC ? function() {
    try {
      return $create(setDesc({}, HIDDEN, {get: function() {
          return setDesc(this, HIDDEN, {value: false})[HIDDEN];
        }}))[HIDDEN] || setDesc;
    } catch (e) {
      return function(it, key, D) {
        var protoDesc = getDesc(ObjectProto, key);
        if (protoDesc)
          delete ObjectProto[key];
        setDesc(it, key, D);
        if (protoDesc && it !== ObjectProto)
          setDesc(ObjectProto, key, protoDesc);
      };
    }
  }() : setDesc;
  function wrap(tag) {
    var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
    DESC && setter && setSymbolDesc(ObjectProto, tag, {
      configurable: true,
      set: function(value) {
        if (has(this, HIDDEN) && has(this[HIDDEN], tag))
          this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, desc(1, value));
      }
    });
    return sym;
  }
  function defineProperty(it, key, D) {
    if (D && has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!has(it, HIDDEN))
          setDesc(it, HIDDEN, desc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (has(it, HIDDEN) && it[HIDDEN][key])
          it[HIDDEN][key] = false;
        D = $create(D, {enumerable: desc(0, false)});
      }
      return setSymbolDesc(it, key, D);
    }
    return setDesc(it, key, D);
  }
  function defineProperties(it, P) {
    assertObject(it);
    var keys = enumKeys(P = toObject(P)),
        i = 0,
        l = keys.length,
        key;
    while (l > i)
      defineProperty(it, key = keys[i++], P[key]);
    return it;
  }
  function create(it, P) {
    return P === undefined ? $create(it) : defineProperties($create(it), P);
  }
  function propertyIsEnumerable(key) {
    var E = _propertyIsEnumerable.call(this, key);
    return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  }
  function getOwnPropertyDescriptor(it, key) {
    var D = getDesc(it = toObject(it), key);
    if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))
      D.enumerable = true;
    return D;
  }
  function getOwnPropertyNames(it) {
    var names = getNames(toObject(it)),
        result = [],
        i = 0,
        key;
    while (names.length > i)
      if (!has(AllSymbols, key = names[i++]) && key != HIDDEN)
        result.push(key);
    return result;
  }
  function getOwnPropertySymbols(it) {
    var names = getNames(toObject(it)),
        result = [],
        i = 0,
        key;
    while (names.length > i)
      if (has(AllSymbols, key = names[i++]))
        result.push(AllSymbols[key]);
    return result;
  }
  if (!useNative) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol)
        throw TypeError('Symbol is not a constructor');
      return wrap(uid(arguments[0]));
    };
    $redef($Symbol.prototype, 'toString', function() {
      return this[TAG];
    });
    $.create = create;
    $.setDesc = defineProperty;
    $.getDesc = getOwnPropertyDescriptor;
    $.setDescs = defineProperties;
    $.getNames = $names.get = getOwnPropertyNames;
    $.getSymbols = getOwnPropertySymbols;
    if ($.DESC && $.FW)
      $redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
  }
  var symbolStatics = {
    'for': function(key) {
      return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
    },
    keyFor: function keyFor(key) {
      return keyOf(SymbolRegistry, key);
    },
    useSetter: function() {
      setter = true;
    },
    useSimple: function() {
      setter = false;
    }
  };
  $.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function(it) {
    var sym = require("npm:core-js@0.9.18/library/modules/$.wks")(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  });
  setter = true;
  $def($def.G + $def.W, {Symbol: $Symbol});
  $def($def.S, 'Symbol', symbolStatics);
  $def($def.S + $def.F * !useNative, 'Object', {
    create: create,
    defineProperty: defineProperty,
    defineProperties: defineProperties,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    getOwnPropertyNames: getOwnPropertyNames,
    getOwnPropertySymbols: getOwnPropertySymbols
  });
  setTag($Symbol, 'Symbol');
  setTag(Math, 'Math', true);
  setTag($.g.JSON, 'JSON', true);
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/utils/BrowserDetector", ["npm:lodash@3.10.1/function/memoize"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _lodashFunctionMemoize = require("npm:lodash@3.10.1/function/memoize");
  var _lodashFunctionMemoize2 = _interopRequireDefault(_lodashFunctionMemoize);
  var isFirefox = _lodashFunctionMemoize2['default'](function() {
    return (/firefox/i.test(navigator.userAgent));
  });
  exports.isFirefox = isFirefox;
  var isSafari = _lodashFunctionMemoize2['default'](function() {
    return Boolean(window.safari);
  });
  exports.isSafari = isSafari;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/object/assign", ["npm:lodash@3.10.1/internal/assignWith", "npm:lodash@3.10.1/internal/baseAssign", "npm:lodash@3.10.1/internal/createAssigner"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var assignWith = require("npm:lodash@3.10.1/internal/assignWith"),
      baseAssign = require("npm:lodash@3.10.1/internal/baseAssign"),
      createAssigner = require("npm:lodash@3.10.1/internal/createAssigner");
  var assign = createAssigner(function(object, source, customizer) {
    return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
  });
  module.exports = assign;
  global.define = __define;
  return module.exports;
});

System.register("npm:redux@3.0.2", ["npm:redux@3.0.2/lib/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:redux@3.0.2/lib/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/invariant", ["github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = function(condition, format, a, b, c, d, e, f) {
      if (process.env.NODE_ENV !== 'production') {
        if (format === undefined) {
          throw new Error('invariant requires an error message argument');
        }
      }
      if (!condition) {
        var error;
        if (format === undefined) {
          error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error('Invariant Violation: ' + format.replace(/%s/g, function() {
            return args[argIndex++];
          }));
        }
        error.framesToPop = 1;
        throw error;
      }
    };
    module.exports = invariant;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactMount", ["npm:react@0.14.0/lib/DOMProperty", "npm:react@0.14.0/lib/ReactBrowserEventEmitter", "npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactDOMFeatureFlags", "npm:react@0.14.0/lib/ReactElement", "npm:react@0.14.0/lib/ReactEmptyComponentRegistry", "npm:react@0.14.0/lib/ReactInstanceHandles", "npm:react@0.14.0/lib/ReactInstanceMap", "npm:react@0.14.0/lib/ReactMarkupChecksum", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/ReactUpdateQueue", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/Object.assign", "npm:fbjs@0.3.1/lib/emptyObject", "npm:fbjs@0.3.1/lib/containsNode", "npm:react@0.14.0/lib/instantiateReactComponent", "npm:fbjs@0.3.1/lib/invariant", "npm:react@0.14.0/lib/setInnerHTML", "npm:react@0.14.0/lib/shouldUpdateReactComponent", "npm:react@0.14.0/lib/validateDOMNesting", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
    var ReactBrowserEventEmitter = require("npm:react@0.14.0/lib/ReactBrowserEventEmitter");
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactDOMFeatureFlags = require("npm:react@0.14.0/lib/ReactDOMFeatureFlags");
    var ReactElement = require("npm:react@0.14.0/lib/ReactElement");
    var ReactEmptyComponentRegistry = require("npm:react@0.14.0/lib/ReactEmptyComponentRegistry");
    var ReactInstanceHandles = require("npm:react@0.14.0/lib/ReactInstanceHandles");
    var ReactInstanceMap = require("npm:react@0.14.0/lib/ReactInstanceMap");
    var ReactMarkupChecksum = require("npm:react@0.14.0/lib/ReactMarkupChecksum");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
    var ReactUpdateQueue = require("npm:react@0.14.0/lib/ReactUpdateQueue");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var emptyObject = require("npm:fbjs@0.3.1/lib/emptyObject");
    var containsNode = require("npm:fbjs@0.3.1/lib/containsNode");
    var instantiateReactComponent = require("npm:react@0.14.0/lib/instantiateReactComponent");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var setInnerHTML = require("npm:react@0.14.0/lib/setInnerHTML");
    var shouldUpdateReactComponent = require("npm:react@0.14.0/lib/shouldUpdateReactComponent");
    var validateDOMNesting = require("npm:react@0.14.0/lib/validateDOMNesting");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
    var nodeCache = {};
    var ELEMENT_NODE_TYPE = 1;
    var DOC_NODE_TYPE = 9;
    var DOCUMENT_FRAGMENT_NODE_TYPE = 11;
    var ownerDocumentContextKey = '__ReactMount_ownerDocument$' + Math.random().toString(36).slice(2);
    var instancesByReactRootID = {};
    var containersByReactRootID = {};
    if (process.env.NODE_ENV !== 'production') {
      var rootElementsByReactRootID = {};
    }
    var findComponentRootReusableArray = [];
    function firstDifferenceIndex(string1, string2) {
      var minLen = Math.min(string1.length, string2.length);
      for (var i = 0; i < minLen; i++) {
        if (string1.charAt(i) !== string2.charAt(i)) {
          return i;
        }
      }
      return string1.length === string2.length ? -1 : minLen;
    }
    function getReactRootElementInContainer(container) {
      if (!container) {
        return null;
      }
      if (container.nodeType === DOC_NODE_TYPE) {
        return container.documentElement;
      } else {
        return container.firstChild;
      }
    }
    function getReactRootID(container) {
      var rootElement = getReactRootElementInContainer(container);
      return rootElement && ReactMount.getID(rootElement);
    }
    function getID(node) {
      var id = internalGetID(node);
      if (id) {
        if (nodeCache.hasOwnProperty(id)) {
          var cached = nodeCache[id];
          if (cached !== node) {
            !!isValid(cached, id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Two valid but unequal nodes with the same `%s`: %s', ATTR_NAME, id) : invariant(false) : undefined;
            nodeCache[id] = node;
          }
        } else {
          nodeCache[id] = node;
        }
      }
      return id;
    }
    function internalGetID(node) {
      return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
    }
    function setID(node, id) {
      var oldID = internalGetID(node);
      if (oldID !== id) {
        delete nodeCache[oldID];
      }
      node.setAttribute(ATTR_NAME, id);
      nodeCache[id] = node;
    }
    function getNode(id) {
      if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
        nodeCache[id] = ReactMount.findReactNodeByID(id);
      }
      return nodeCache[id];
    }
    function getNodeFromInstance(instance) {
      var id = ReactInstanceMap.get(instance)._rootNodeID;
      if (ReactEmptyComponentRegistry.isNullComponentID(id)) {
        return null;
      }
      if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
        nodeCache[id] = ReactMount.findReactNodeByID(id);
      }
      return nodeCache[id];
    }
    function isValid(node, id) {
      if (node) {
        !(internalGetID(node) === id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Unexpected modification of `%s`', ATTR_NAME) : invariant(false) : undefined;
        var container = ReactMount.findReactContainerForID(id);
        if (container && containsNode(container, node)) {
          return true;
        }
      }
      return false;
    }
    function purgeID(id) {
      delete nodeCache[id];
    }
    var deepestNodeSoFar = null;
    function findDeepestCachedAncestorImpl(ancestorID) {
      var ancestor = nodeCache[ancestorID];
      if (ancestor && isValid(ancestor, ancestorID)) {
        deepestNodeSoFar = ancestor;
      } else {
        return false;
      }
    }
    function findDeepestCachedAncestor(targetID) {
      deepestNodeSoFar = null;
      ReactInstanceHandles.traverseAncestors(targetID, findDeepestCachedAncestorImpl);
      var foundNode = deepestNodeSoFar;
      deepestNodeSoFar = null;
      return foundNode;
    }
    function mountComponentIntoNode(componentInstance, rootID, container, transaction, shouldReuseMarkup, context) {
      if (ReactDOMFeatureFlags.useCreateElement) {
        context = assign({}, context);
        if (container.nodeType === DOC_NODE_TYPE) {
          context[ownerDocumentContextKey] = container;
        } else {
          context[ownerDocumentContextKey] = container.ownerDocument;
        }
      }
      if (process.env.NODE_ENV !== 'production') {
        if (context === emptyObject) {
          context = {};
        }
        var tag = container.nodeName.toLowerCase();
        context[validateDOMNesting.ancestorInfoContextKey] = validateDOMNesting.updatedAncestorInfo(null, tag, null);
      }
      var markup = ReactReconciler.mountComponent(componentInstance, rootID, transaction, context);
      componentInstance._renderedComponent._topLevelWrapper = componentInstance;
      ReactMount._mountImageIntoNode(markup, container, shouldReuseMarkup, transaction);
    }
    function batchedMountComponentIntoNode(componentInstance, rootID, container, shouldReuseMarkup, context) {
      var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(shouldReuseMarkup);
      transaction.perform(mountComponentIntoNode, null, componentInstance, rootID, container, transaction, shouldReuseMarkup, context);
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    }
    function unmountComponentFromNode(instance, container) {
      ReactReconciler.unmountComponent(instance);
      if (container.nodeType === DOC_NODE_TYPE) {
        container = container.documentElement;
      }
      while (container.lastChild) {
        container.removeChild(container.lastChild);
      }
    }
    function hasNonRootReactChild(node) {
      var reactRootID = getReactRootID(node);
      return reactRootID ? reactRootID !== ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID) : false;
    }
    function findFirstReactDOMImpl(node) {
      for (; node && node.parentNode !== node; node = node.parentNode) {
        if (node.nodeType !== 1) {
          continue;
        }
        var nodeID = internalGetID(node);
        if (!nodeID) {
          continue;
        }
        var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
        var current = node;
        var lastID;
        do {
          lastID = internalGetID(current);
          current = current.parentNode;
          if (current == null) {
            return null;
          }
        } while (lastID !== reactRootID);
        if (current === containersByReactRootID[reactRootID]) {
          return node;
        }
      }
      return null;
    }
    var TopLevelWrapper = function() {};
    TopLevelWrapper.prototype.isReactComponent = {};
    if (process.env.NODE_ENV !== 'production') {
      TopLevelWrapper.displayName = 'TopLevelWrapper';
    }
    TopLevelWrapper.prototype.render = function() {
      return this.props;
    };
    var ReactMount = {
      TopLevelWrapper: TopLevelWrapper,
      _instancesByReactRootID: instancesByReactRootID,
      scrollMonitor: function(container, renderCallback) {
        renderCallback();
      },
      _updateRootComponent: function(prevComponent, nextElement, container, callback) {
        ReactMount.scrollMonitor(container, function() {
          ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
          if (callback) {
            ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
          }
        });
        if (process.env.NODE_ENV !== 'production') {
          rootElementsByReactRootID[getReactRootID(container)] = getReactRootElementInContainer(container);
        }
        return prevComponent;
      },
      _registerComponent: function(nextComponent, container) {
        !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '_registerComponent(...): Target container is not a DOM element.') : invariant(false) : undefined;
        ReactBrowserEventEmitter.ensureScrollValueMonitoring();
        var reactRootID = ReactMount.registerContainer(container);
        instancesByReactRootID[reactRootID] = nextComponent;
        return reactRootID;
      },
      _renderNewRootComponent: function(nextElement, container, shouldReuseMarkup, context) {
        process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, '_renderNewRootComponent(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from ' + 'render is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate. Check the render method of %s.', ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || 'ReactCompositeComponent') : undefined;
        var componentInstance = instantiateReactComponent(nextElement, null);
        var reactRootID = ReactMount._registerComponent(componentInstance, container);
        ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, reactRootID, container, shouldReuseMarkup, context);
        if (process.env.NODE_ENV !== 'production') {
          rootElementsByReactRootID[reactRootID] = getReactRootElementInContainer(container);
        }
        return componentInstance;
      },
      renderSubtreeIntoContainer: function(parentComponent, nextElement, container, callback) {
        !(parentComponent != null && parentComponent._reactInternalInstance != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'parentComponent must be a valid React Component') : invariant(false) : undefined;
        return ReactMount._renderSubtreeIntoContainer(parentComponent, nextElement, container, callback);
      },
      _renderSubtreeIntoContainer: function(parentComponent, nextElement, container, callback) {
        !ReactElement.isValidElement(nextElement) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOM.render(): Invalid component element.%s', typeof nextElement === 'string' ? ' Instead of passing an element string, make sure to instantiate ' + 'it by passing it to React.createElement.' : typeof nextElement === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' : nextElement != null && nextElement.props !== undefined ? ' This may be caused by unintentionally loading two independent ' + 'copies of React.' : '') : invariant(false) : undefined;
        process.env.NODE_ENV !== 'production' ? warning(!container || !container.tagName || container.tagName.toUpperCase() !== 'BODY', 'render(): Rendering components directly into document.body is ' + 'discouraged, since its children are often manipulated by third-party ' + 'scripts and browser extensions. This may lead to subtle ' + 'reconciliation issues. Try rendering into a container element created ' + 'for your app.') : undefined;
        var nextWrappedElement = new ReactElement(TopLevelWrapper, null, null, null, null, null, nextElement);
        var prevComponent = instancesByReactRootID[getReactRootID(container)];
        if (prevComponent) {
          var prevWrappedElement = prevComponent._currentElement;
          var prevElement = prevWrappedElement.props;
          if (shouldUpdateReactComponent(prevElement, nextElement)) {
            return ReactMount._updateRootComponent(prevComponent, nextWrappedElement, container, callback)._renderedComponent.getPublicInstance();
          } else {
            ReactMount.unmountComponentAtNode(container);
          }
        }
        var reactRootElement = getReactRootElementInContainer(container);
        var containerHasReactMarkup = reactRootElement && !!internalGetID(reactRootElement);
        var containerHasNonRootReactChild = hasNonRootReactChild(container);
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'render(...): Replacing React-rendered children with a new root ' + 'component. If you intended to update the children of this node, ' + 'you should instead have the existing children update their state ' + 'and render the new components instead of calling ReactDOM.render.') : undefined;
          if (!containerHasReactMarkup || reactRootElement.nextSibling) {
            var rootElementSibling = reactRootElement;
            while (rootElementSibling) {
              if (internalGetID(rootElementSibling)) {
                process.env.NODE_ENV !== 'production' ? warning(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.') : undefined;
                break;
              }
              rootElementSibling = rootElementSibling.nextSibling;
            }
          }
        }
        var shouldReuseMarkup = containerHasReactMarkup && !prevComponent && !containerHasNonRootReactChild;
        var component = ReactMount._renderNewRootComponent(nextWrappedElement, container, shouldReuseMarkup, parentComponent != null ? parentComponent._reactInternalInstance._processChildContext(parentComponent._reactInternalInstance._context) : emptyObject)._renderedComponent.getPublicInstance();
        if (callback) {
          callback.call(component);
        }
        return component;
      },
      render: function(nextElement, container, callback) {
        return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
      },
      registerContainer: function(container) {
        var reactRootID = getReactRootID(container);
        if (reactRootID) {
          reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
        }
        if (!reactRootID) {
          reactRootID = ReactInstanceHandles.createReactRootID();
        }
        containersByReactRootID[reactRootID] = container;
        return reactRootID;
      },
      unmountComponentAtNode: function(container) {
        process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, 'unmountComponentAtNode(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from render ' + 'is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate. Check the render method of %s.', ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || 'ReactCompositeComponent') : undefined;
        !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'unmountComponentAtNode(...): Target container is not a DOM element.') : invariant(false) : undefined;
        var reactRootID = getReactRootID(container);
        var component = instancesByReactRootID[reactRootID];
        if (!component) {
          var containerHasNonRootReactChild = hasNonRootReactChild(container);
          var containerID = internalGetID(container);
          var isContainerReactRoot = containerID && containerID === ReactInstanceHandles.getReactRootIDFromNodeID(containerID);
          if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'unmountComponentAtNode(): The node you\'re attempting to unmount ' + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.') : undefined;
          }
          return false;
        }
        ReactUpdates.batchedUpdates(unmountComponentFromNode, component, container);
        delete instancesByReactRootID[reactRootID];
        delete containersByReactRootID[reactRootID];
        if (process.env.NODE_ENV !== 'production') {
          delete rootElementsByReactRootID[reactRootID];
        }
        return true;
      },
      findReactContainerForID: function(id) {
        var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
        var container = containersByReactRootID[reactRootID];
        if (process.env.NODE_ENV !== 'production') {
          var rootElement = rootElementsByReactRootID[reactRootID];
          if (rootElement && rootElement.parentNode !== container) {
            process.env.NODE_ENV !== 'production' ? warning(internalGetID(rootElement) === reactRootID, 'ReactMount: Root element ID differed from reactRootID.') : undefined;
            var containerChild = container.firstChild;
            if (containerChild && reactRootID === internalGetID(containerChild)) {
              rootElementsByReactRootID[reactRootID] = containerChild;
            } else {
              process.env.NODE_ENV !== 'production' ? warning(false, 'ReactMount: Root element has been removed from its original ' + 'container. New container: %s', rootElement.parentNode) : undefined;
            }
          }
        }
        return container;
      },
      findReactNodeByID: function(id) {
        var reactRoot = ReactMount.findReactContainerForID(id);
        return ReactMount.findComponentRoot(reactRoot, id);
      },
      getFirstReactDOM: function(node) {
        return findFirstReactDOMImpl(node);
      },
      findComponentRoot: function(ancestorNode, targetID) {
        var firstChildren = findComponentRootReusableArray;
        var childIndex = 0;
        var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(deepestAncestor != null, 'React can\'t find the root component node for data-reactid value ' + '`%s`. If you\'re seeing this message, it probably means that ' + 'you\'ve loaded two copies of React on the page. At this time, only ' + 'a single copy of React can be loaded at a time.', targetID) : undefined;
        }
        firstChildren[0] = deepestAncestor.firstChild;
        firstChildren.length = 1;
        while (childIndex < firstChildren.length) {
          var child = firstChildren[childIndex++];
          var targetChild;
          while (child) {
            var childID = ReactMount.getID(child);
            if (childID) {
              if (targetID === childID) {
                targetChild = child;
              } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
                firstChildren.length = childIndex = 0;
                firstChildren.push(child.firstChild);
              }
            } else {
              firstChildren.push(child.firstChild);
            }
            child = child.nextSibling;
          }
          if (targetChild) {
            firstChildren.length = 0;
            return targetChild;
          }
        }
        firstChildren.length = 0;
        !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findComponentRoot(..., %s): Unable to find element. This probably ' + 'means the DOM was unexpectedly mutated (e.g., by the browser), ' + 'usually due to forgetting a <tbody> when using tables, nesting tags ' + 'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' + 'parent. ' + 'Try inspecting the child nodes of the element with React ID `%s`.', targetID, ReactMount.getID(ancestorNode)) : invariant(false) : undefined;
      },
      _mountImageIntoNode: function(markup, container, shouldReuseMarkup, transaction) {
        !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mountComponentIntoNode(...): Target container is not valid.') : invariant(false) : undefined;
        if (shouldReuseMarkup) {
          var rootElement = getReactRootElementInContainer(container);
          if (ReactMarkupChecksum.canReuseMarkup(markup, rootElement)) {
            return ;
          } else {
            var checksum = rootElement.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
            rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
            var rootMarkup = rootElement.outerHTML;
            rootElement.setAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME, checksum);
            var normalizedMarkup = markup;
            if (process.env.NODE_ENV !== 'production') {
              var normalizer;
              if (container.nodeType === ELEMENT_NODE_TYPE) {
                normalizer = document.createElement('div');
                normalizer.innerHTML = markup;
                normalizedMarkup = normalizer.innerHTML;
              } else {
                normalizer = document.createElement('iframe');
                document.body.appendChild(normalizer);
                normalizer.contentDocument.write(markup);
                normalizedMarkup = normalizer.contentDocument.documentElement.outerHTML;
                document.body.removeChild(normalizer);
              }
            }
            var diffIndex = firstDifferenceIndex(normalizedMarkup, rootMarkup);
            var difference = ' (client) ' + normalizedMarkup.substring(diffIndex - 20, diffIndex + 20) + '\n (server) ' + rootMarkup.substring(diffIndex - 20, diffIndex + 20);
            !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You\'re trying to render a component to the document using ' + 'server rendering but the checksum was invalid. This usually ' + 'means you rendered a different component type or props on ' + 'the client from the one on the server, or your render() ' + 'methods are impure. React cannot handle this case due to ' + 'cross-browser quirks by rendering at the document root. You ' + 'should look for environment dependent code in your components ' + 'and ensure the props are the same client and server side:\n%s', difference) : invariant(false) : undefined;
            if (process.env.NODE_ENV !== 'production') {
              process.env.NODE_ENV !== 'production' ? warning(false, 'React attempted to reuse markup in a container but the ' + 'checksum was invalid. This generally means that you are ' + 'using server rendering and the markup generated on the ' + 'server was not what the client was expecting. React injected ' + 'new markup to compensate which works but you have lost many ' + 'of the benefits of server rendering. Instead, figure out ' + 'why the markup being generated is different on the client ' + 'or server:\n%s', difference) : undefined;
            }
          }
        }
        !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You\'re trying to render a component to the document but ' + 'you didn\'t use server rendering. We can\'t do this ' + 'without using server rendering due to cross-browser quirks. ' + 'See ReactDOMServer.renderToString() for server rendering.') : invariant(false) : undefined;
        if (transaction.useCreateElement) {
          while (container.lastChild) {
            container.removeChild(container.lastChild);
          }
          container.appendChild(markup);
        } else {
          setInnerHTML(container, markup);
        }
      },
      ownerDocumentContextKey: ownerDocumentContextKey,
      getReactRootID: getReactRootID,
      getID: getID,
      setID: setID,
      getNode: getNode,
      getNodeFromInstance: getNodeFromInstance,
      isValid: isValid,
      purgeID: purgeID
    };
    ReactPerf.measureMethods(ReactMount, 'ReactMount', {
      _renderNewRootComponent: '_renderNewRootComponent',
      _mountImageIntoNode: '_mountImageIntoNode'
    });
    module.exports = ReactMount;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMComponent", ["npm:react@0.14.0/lib/AutoFocusUtils", "npm:react@0.14.0/lib/CSSPropertyOperations", "npm:react@0.14.0/lib/DOMProperty", "npm:react@0.14.0/lib/DOMPropertyOperations", "npm:react@0.14.0/lib/EventConstants", "npm:react@0.14.0/lib/ReactBrowserEventEmitter", "npm:react@0.14.0/lib/ReactComponentBrowserEnvironment", "npm:react@0.14.0/lib/ReactDOMButton", "npm:react@0.14.0/lib/ReactDOMInput", "npm:react@0.14.0/lib/ReactDOMOption", "npm:react@0.14.0/lib/ReactDOMSelect", "npm:react@0.14.0/lib/ReactDOMTextarea", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactMultiChild", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ReactUpdateQueue", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/escapeTextContentForBrowser", "npm:fbjs@0.3.1/lib/invariant", "npm:react@0.14.0/lib/isEventSupported", "npm:fbjs@0.3.1/lib/keyOf", "npm:react@0.14.0/lib/setInnerHTML", "npm:react@0.14.0/lib/setTextContent", "npm:fbjs@0.3.1/lib/shallowEqual", "npm:react@0.14.0/lib/validateDOMNesting", "npm:fbjs@0.3.1/lib/warning", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var AutoFocusUtils = require("npm:react@0.14.0/lib/AutoFocusUtils");
    var CSSPropertyOperations = require("npm:react@0.14.0/lib/CSSPropertyOperations");
    var DOMProperty = require("npm:react@0.14.0/lib/DOMProperty");
    var DOMPropertyOperations = require("npm:react@0.14.0/lib/DOMPropertyOperations");
    var EventConstants = require("npm:react@0.14.0/lib/EventConstants");
    var ReactBrowserEventEmitter = require("npm:react@0.14.0/lib/ReactBrowserEventEmitter");
    var ReactComponentBrowserEnvironment = require("npm:react@0.14.0/lib/ReactComponentBrowserEnvironment");
    var ReactDOMButton = require("npm:react@0.14.0/lib/ReactDOMButton");
    var ReactDOMInput = require("npm:react@0.14.0/lib/ReactDOMInput");
    var ReactDOMOption = require("npm:react@0.14.0/lib/ReactDOMOption");
    var ReactDOMSelect = require("npm:react@0.14.0/lib/ReactDOMSelect");
    var ReactDOMTextarea = require("npm:react@0.14.0/lib/ReactDOMTextarea");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactMultiChild = require("npm:react@0.14.0/lib/ReactMultiChild");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var ReactUpdateQueue = require("npm:react@0.14.0/lib/ReactUpdateQueue");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var escapeTextContentForBrowser = require("npm:react@0.14.0/lib/escapeTextContentForBrowser");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var isEventSupported = require("npm:react@0.14.0/lib/isEventSupported");
    var keyOf = require("npm:fbjs@0.3.1/lib/keyOf");
    var setInnerHTML = require("npm:react@0.14.0/lib/setInnerHTML");
    var setTextContent = require("npm:react@0.14.0/lib/setTextContent");
    var shallowEqual = require("npm:fbjs@0.3.1/lib/shallowEqual");
    var validateDOMNesting = require("npm:react@0.14.0/lib/validateDOMNesting");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    var deleteListener = ReactBrowserEventEmitter.deleteListener;
    var listenTo = ReactBrowserEventEmitter.listenTo;
    var registrationNameModules = ReactBrowserEventEmitter.registrationNameModules;
    var CONTENT_TYPES = {
      'string': true,
      'number': true
    };
    var STYLE = keyOf({style: null});
    var ELEMENT_NODE_TYPE = 1;
    var canDefineProperty = false;
    try {
      Object.defineProperty({}, 'test', {get: function() {}});
      canDefineProperty = true;
    } catch (e) {}
    function getDeclarationErrorAddendum(internalInstance) {
      if (internalInstance) {
        var owner = internalInstance._currentElement._owner || null;
        if (owner) {
          var name = owner.getName();
          if (name) {
            return ' This DOM node was rendered by `' + name + '`.';
          }
        }
      }
      return '';
    }
    var legacyPropsDescriptor;
    if (process.env.NODE_ENV !== 'production') {
      legacyPropsDescriptor = {props: {
          enumerable: false,
          get: function() {
            var component = this._reactInternalComponent;
            process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .props of a DOM node; instead, ' + 'recreate the props as `render` did originally or read the DOM ' + 'properties/attributes directly from this node (e.g., ' + 'this.refs.box.className).%s', getDeclarationErrorAddendum(component)) : undefined;
            return component._currentElement.props;
          }
        }};
    }
    function legacyGetDOMNode() {
      if (process.env.NODE_ENV !== 'production') {
        var component = this._reactInternalComponent;
        process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .getDOMNode() of a DOM node; ' + 'instead, use the node directly.%s', getDeclarationErrorAddendum(component)) : undefined;
      }
      return this;
    }
    function legacyIsMounted() {
      var component = this._reactInternalComponent;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .isMounted() of a DOM node.%s', getDeclarationErrorAddendum(component)) : undefined;
      }
      return !!component;
    }
    function legacySetStateEtc() {
      if (process.env.NODE_ENV !== 'production') {
        var component = this._reactInternalComponent;
        process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .setState(), .replaceState(), or ' + '.forceUpdate() of a DOM node. This is a no-op.%s', getDeclarationErrorAddendum(component)) : undefined;
      }
    }
    function legacySetProps(partialProps, callback) {
      var component = this._reactInternalComponent;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .setProps() of a DOM node. ' + 'Instead, call ReactDOM.render again at the top level.%s', getDeclarationErrorAddendum(component)) : undefined;
      }
      if (!component) {
        return ;
      }
      ReactUpdateQueue.enqueueSetPropsInternal(component, partialProps);
      if (callback) {
        ReactUpdateQueue.enqueueCallbackInternal(component, callback);
      }
    }
    function legacyReplaceProps(partialProps, callback) {
      var component = this._reactInternalComponent;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .replaceProps() of a DOM node. ' + 'Instead, call ReactDOM.render again at the top level.%s', getDeclarationErrorAddendum(component)) : undefined;
      }
      if (!component) {
        return ;
      }
      ReactUpdateQueue.enqueueReplacePropsInternal(component, partialProps);
      if (callback) {
        ReactUpdateQueue.enqueueCallbackInternal(component, callback);
      }
    }
    function friendlyStringify(obj) {
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return '[' + obj.map(friendlyStringify).join(', ') + ']';
        } else {
          var pairs = [];
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              var keyEscaped = /^[a-z$_][\w$_]*$/i.test(key) ? key : JSON.stringify(key);
              pairs.push(keyEscaped + ': ' + friendlyStringify(obj[key]));
            }
          }
          return '{' + pairs.join(', ') + '}';
        }
      } else if (typeof obj === 'string') {
        return JSON.stringify(obj);
      } else if (typeof obj === 'function') {
        return '[function object]';
      }
      return String(obj);
    }
    var styleMutationWarning = {};
    function checkAndWarnForMutatedStyle(style1, style2, component) {
      if (style1 == null || style2 == null) {
        return ;
      }
      if (shallowEqual(style1, style2)) {
        return ;
      }
      var componentName = component._tag;
      var owner = component._currentElement._owner;
      var ownerName;
      if (owner) {
        ownerName = owner.getName();
      }
      var hash = ownerName + '|' + componentName;
      if (styleMutationWarning.hasOwnProperty(hash)) {
        return ;
      }
      styleMutationWarning[hash] = true;
      process.env.NODE_ENV !== 'production' ? warning(false, '`%s` was passed a style object that has previously been mutated. ' + 'Mutating `style` is deprecated. Consider cloning it beforehand. Check ' + 'the `render` %s. Previous style: %s. Mutated style: %s.', componentName, owner ? 'of `' + ownerName + '`' : 'using <' + componentName + '>', friendlyStringify(style1), friendlyStringify(style2)) : undefined;
    }
    function assertValidProps(component, props) {
      if (!props) {
        return ;
      }
      if (process.env.NODE_ENV !== 'production') {
        if (voidElementTags[component._tag]) {
          process.env.NODE_ENV !== 'production' ? warning(props.children == null && props.dangerouslySetInnerHTML == null, '%s is a void element tag and must not have `children` or ' + 'use `props.dangerouslySetInnerHTML`.%s', component._tag, component._currentElement._owner ? ' Check the render method of ' + component._currentElement._owner.getName() + '.' : '') : undefined;
        }
      }
      if (props.dangerouslySetInnerHTML != null) {
        !(props.children == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.') : invariant(false) : undefined;
        !(typeof props.dangerouslySetInnerHTML === 'object' && '__html' in props.dangerouslySetInnerHTML) ? process.env.NODE_ENV !== 'production' ? invariant(false, '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://fb.me/react-invariant-dangerously-set-inner-html ' + 'for more information.') : invariant(false) : undefined;
      }
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(props.innerHTML == null, 'Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.') : undefined;
        process.env.NODE_ENV !== 'production' ? warning(!props.contentEditable || props.children == null, 'A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.') : undefined;
      }
      !(props.style == null || typeof props.style === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'The `style` prop expects a mapping from style properties to values, ' + 'not a string. For example, style={{marginRight: spacing + \'em\'}} when ' + 'using JSX.%s', getDeclarationErrorAddendum(component)) : invariant(false) : undefined;
    }
    function enqueuePutListener(id, registrationName, listener, transaction) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(registrationName !== 'onScroll' || isEventSupported('scroll', true), 'This browser doesn\'t support the `onScroll` event') : undefined;
      }
      var container = ReactMount.findReactContainerForID(id);
      if (container) {
        var doc = container.nodeType === ELEMENT_NODE_TYPE ? container.ownerDocument : container;
        listenTo(registrationName, doc);
      }
      transaction.getReactMountReady().enqueue(putListener, {
        id: id,
        registrationName: registrationName,
        listener: listener
      });
    }
    function putListener() {
      var listenerToPut = this;
      ReactBrowserEventEmitter.putListener(listenerToPut.id, listenerToPut.registrationName, listenerToPut.listener);
    }
    var mediaEvents = {
      topAbort: 'abort',
      topCanPlay: 'canplay',
      topCanPlayThrough: 'canplaythrough',
      topDurationChange: 'durationchange',
      topEmptied: 'emptied',
      topEncrypted: 'encrypted',
      topEnded: 'ended',
      topError: 'error',
      topLoadedData: 'loadeddata',
      topLoadedMetadata: 'loadedmetadata',
      topLoadStart: 'loadstart',
      topPause: 'pause',
      topPlay: 'play',
      topPlaying: 'playing',
      topProgress: 'progress',
      topRateChange: 'ratechange',
      topSeeked: 'seeked',
      topSeeking: 'seeking',
      topStalled: 'stalled',
      topSuspend: 'suspend',
      topTimeUpdate: 'timeupdate',
      topVolumeChange: 'volumechange',
      topWaiting: 'waiting'
    };
    function trapBubbledEventsLocal() {
      var inst = this;
      !inst._rootNodeID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Must be mounted to trap events') : invariant(false) : undefined;
      var node = ReactMount.getNode(inst._rootNodeID);
      !node ? process.env.NODE_ENV !== 'production' ? invariant(false, 'trapBubbledEvent(...): Requires node to be rendered.') : invariant(false) : undefined;
      switch (inst._tag) {
        case 'iframe':
          inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load', node)];
          break;
        case 'video':
        case 'audio':
          inst._wrapperState.listeners = [];
          for (var event in mediaEvents) {
            if (mediaEvents.hasOwnProperty(event)) {
              inst._wrapperState.listeners.push(ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes[event], mediaEvents[event], node));
            }
          }
          break;
        case 'img':
          inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topError, 'error', node), ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load', node)];
          break;
        case 'form':
          inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topReset, 'reset', node), ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topSubmit, 'submit', node)];
          break;
      }
    }
    function mountReadyInputWrapper() {
      ReactDOMInput.mountReadyWrapper(this);
    }
    function postUpdateSelectWrapper() {
      ReactDOMSelect.postUpdateWrapper(this);
    }
    var omittedCloseTags = {
      'area': true,
      'base': true,
      'br': true,
      'col': true,
      'embed': true,
      'hr': true,
      'img': true,
      'input': true,
      'keygen': true,
      'link': true,
      'meta': true,
      'param': true,
      'source': true,
      'track': true,
      'wbr': true
    };
    var newlineEatingTags = {
      'listing': true,
      'pre': true,
      'textarea': true
    };
    var voidElementTags = assign({'menuitem': true}, omittedCloseTags);
    var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
    var validatedTagCache = {};
    var hasOwnProperty = ({}).hasOwnProperty;
    function validateDangerousTag(tag) {
      if (!hasOwnProperty.call(validatedTagCache, tag)) {
        !VALID_TAG_REGEX.test(tag) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Invalid tag: %s', tag) : invariant(false) : undefined;
        validatedTagCache[tag] = true;
      }
    }
    function processChildContextDev(context, inst) {
      context = assign({}, context);
      var info = context[validateDOMNesting.ancestorInfoContextKey];
      context[validateDOMNesting.ancestorInfoContextKey] = validateDOMNesting.updatedAncestorInfo(info, inst._tag, inst);
      return context;
    }
    function isCustomComponent(tagName, props) {
      return tagName.indexOf('-') >= 0 || props.is != null;
    }
    function ReactDOMComponent(tag) {
      validateDangerousTag(tag);
      this._tag = tag.toLowerCase();
      this._renderedChildren = null;
      this._previousStyle = null;
      this._previousStyleCopy = null;
      this._rootNodeID = null;
      this._wrapperState = null;
      this._topLevelWrapper = null;
      this._nodeWithLegacyProperties = null;
      if (process.env.NODE_ENV !== 'production') {
        this._unprocessedContextDev = null;
        this._processedContextDev = null;
      }
    }
    ReactDOMComponent.displayName = 'ReactDOMComponent';
    ReactDOMComponent.Mixin = {
      construct: function(element) {
        this._currentElement = element;
      },
      mountComponent: function(rootID, transaction, context) {
        this._rootNodeID = rootID;
        var props = this._currentElement.props;
        switch (this._tag) {
          case 'iframe':
          case 'img':
          case 'form':
          case 'video':
          case 'audio':
            this._wrapperState = {listeners: null};
            transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
            break;
          case 'button':
            props = ReactDOMButton.getNativeProps(this, props, context);
            break;
          case 'input':
            ReactDOMInput.mountWrapper(this, props, context);
            props = ReactDOMInput.getNativeProps(this, props, context);
            break;
          case 'option':
            ReactDOMOption.mountWrapper(this, props, context);
            props = ReactDOMOption.getNativeProps(this, props, context);
            break;
          case 'select':
            ReactDOMSelect.mountWrapper(this, props, context);
            props = ReactDOMSelect.getNativeProps(this, props, context);
            context = ReactDOMSelect.processChildContext(this, props, context);
            break;
          case 'textarea':
            ReactDOMTextarea.mountWrapper(this, props, context);
            props = ReactDOMTextarea.getNativeProps(this, props, context);
            break;
        }
        assertValidProps(this, props);
        if (process.env.NODE_ENV !== 'production') {
          if (context[validateDOMNesting.ancestorInfoContextKey]) {
            validateDOMNesting(this._tag, this, context[validateDOMNesting.ancestorInfoContextKey]);
          }
        }
        if (process.env.NODE_ENV !== 'production') {
          this._unprocessedContextDev = context;
          this._processedContextDev = processChildContextDev(context, this);
          context = this._processedContextDev;
        }
        var mountImage;
        if (transaction.useCreateElement) {
          var ownerDocument = context[ReactMount.ownerDocumentContextKey];
          var el = ownerDocument.createElement(this._currentElement.type);
          DOMPropertyOperations.setAttributeForID(el, this._rootNodeID);
          ReactMount.getID(el);
          this._updateDOMProperties({}, props, transaction, el);
          this._createInitialChildren(transaction, props, context, el);
          mountImage = el;
        } else {
          var tagOpen = this._createOpenTagMarkupAndPutListeners(transaction, props);
          var tagContent = this._createContentMarkup(transaction, props, context);
          if (!tagContent && omittedCloseTags[this._tag]) {
            mountImage = tagOpen + '/>';
          } else {
            mountImage = tagOpen + '>' + tagContent + '</' + this._currentElement.type + '>';
          }
        }
        switch (this._tag) {
          case 'input':
            transaction.getReactMountReady().enqueue(mountReadyInputWrapper, this);
          case 'button':
          case 'select':
          case 'textarea':
            if (props.autoFocus) {
              transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
            }
            break;
        }
        return mountImage;
      },
      _createOpenTagMarkupAndPutListeners: function(transaction, props) {
        var ret = '<' + this._currentElement.type;
        for (var propKey in props) {
          if (!props.hasOwnProperty(propKey)) {
            continue;
          }
          var propValue = props[propKey];
          if (propValue == null) {
            continue;
          }
          if (registrationNameModules.hasOwnProperty(propKey)) {
            if (propValue) {
              enqueuePutListener(this._rootNodeID, propKey, propValue, transaction);
            }
          } else {
            if (propKey === STYLE) {
              if (propValue) {
                if (process.env.NODE_ENV !== 'production') {
                  this._previousStyle = propValue;
                }
                propValue = this._previousStyleCopy = assign({}, props.style);
              }
              propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
            }
            var markup = null;
            if (this._tag != null && isCustomComponent(this._tag, props)) {
              markup = DOMPropertyOperations.createMarkupForCustomAttribute(propKey, propValue);
            } else {
              markup = DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
            }
            if (markup) {
              ret += ' ' + markup;
            }
          }
        }
        if (transaction.renderToStaticMarkup) {
          return ret;
        }
        var markupForID = DOMPropertyOperations.createMarkupForID(this._rootNodeID);
        return ret + ' ' + markupForID;
      },
      _createContentMarkup: function(transaction, props, context) {
        var ret = '';
        var innerHTML = props.dangerouslySetInnerHTML;
        if (innerHTML != null) {
          if (innerHTML.__html != null) {
            ret = innerHTML.__html;
          }
        } else {
          var contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
          var childrenToUse = contentToUse != null ? null : props.children;
          if (contentToUse != null) {
            ret = escapeTextContentForBrowser(contentToUse);
          } else if (childrenToUse != null) {
            var mountImages = this.mountChildren(childrenToUse, transaction, context);
            ret = mountImages.join('');
          }
        }
        if (newlineEatingTags[this._tag] && ret.charAt(0) === '\n') {
          return '\n' + ret;
        } else {
          return ret;
        }
      },
      _createInitialChildren: function(transaction, props, context, el) {
        var innerHTML = props.dangerouslySetInnerHTML;
        if (innerHTML != null) {
          if (innerHTML.__html != null) {
            setInnerHTML(el, innerHTML.__html);
          }
        } else {
          var contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
          var childrenToUse = contentToUse != null ? null : props.children;
          if (contentToUse != null) {
            setTextContent(el, contentToUse);
          } else if (childrenToUse != null) {
            var mountImages = this.mountChildren(childrenToUse, transaction, context);
            for (var i = 0; i < mountImages.length; i++) {
              el.appendChild(mountImages[i]);
            }
          }
        }
      },
      receiveComponent: function(nextElement, transaction, context) {
        var prevElement = this._currentElement;
        this._currentElement = nextElement;
        this.updateComponent(transaction, prevElement, nextElement, context);
      },
      updateComponent: function(transaction, prevElement, nextElement, context) {
        var lastProps = prevElement.props;
        var nextProps = this._currentElement.props;
        switch (this._tag) {
          case 'button':
            lastProps = ReactDOMButton.getNativeProps(this, lastProps);
            nextProps = ReactDOMButton.getNativeProps(this, nextProps);
            break;
          case 'input':
            ReactDOMInput.updateWrapper(this);
            lastProps = ReactDOMInput.getNativeProps(this, lastProps);
            nextProps = ReactDOMInput.getNativeProps(this, nextProps);
            break;
          case 'option':
            lastProps = ReactDOMOption.getNativeProps(this, lastProps);
            nextProps = ReactDOMOption.getNativeProps(this, nextProps);
            break;
          case 'select':
            lastProps = ReactDOMSelect.getNativeProps(this, lastProps);
            nextProps = ReactDOMSelect.getNativeProps(this, nextProps);
            break;
          case 'textarea':
            ReactDOMTextarea.updateWrapper(this);
            lastProps = ReactDOMTextarea.getNativeProps(this, lastProps);
            nextProps = ReactDOMTextarea.getNativeProps(this, nextProps);
            break;
        }
        if (process.env.NODE_ENV !== 'production') {
          if (this._unprocessedContextDev !== context) {
            this._unprocessedContextDev = context;
            this._processedContextDev = processChildContextDev(context, this);
          }
          context = this._processedContextDev;
        }
        assertValidProps(this, nextProps);
        this._updateDOMProperties(lastProps, nextProps, transaction, null);
        this._updateDOMChildren(lastProps, nextProps, transaction, context);
        if (!canDefineProperty && this._nodeWithLegacyProperties) {
          this._nodeWithLegacyProperties.props = nextProps;
        }
        if (this._tag === 'select') {
          transaction.getReactMountReady().enqueue(postUpdateSelectWrapper, this);
        }
      },
      _updateDOMProperties: function(lastProps, nextProps, transaction, node) {
        var propKey;
        var styleName;
        var styleUpdates;
        for (propKey in lastProps) {
          if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey)) {
            continue;
          }
          if (propKey === STYLE) {
            var lastStyle = this._previousStyleCopy;
            for (styleName in lastStyle) {
              if (lastStyle.hasOwnProperty(styleName)) {
                styleUpdates = styleUpdates || {};
                styleUpdates[styleName] = '';
              }
            }
            this._previousStyleCopy = null;
          } else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (lastProps[propKey]) {
              deleteListener(this._rootNodeID, propKey);
            }
          } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
            if (!node) {
              node = ReactMount.getNode(this._rootNodeID);
            }
            DOMPropertyOperations.deleteValueForProperty(node, propKey);
          }
        }
        for (propKey in nextProps) {
          var nextProp = nextProps[propKey];
          var lastProp = propKey === STYLE ? this._previousStyleCopy : lastProps[propKey];
          if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
            continue;
          }
          if (propKey === STYLE) {
            if (nextProp) {
              if (process.env.NODE_ENV !== 'production') {
                checkAndWarnForMutatedStyle(this._previousStyleCopy, this._previousStyle, this);
                this._previousStyle = nextProp;
              }
              nextProp = this._previousStyleCopy = assign({}, nextProp);
            } else {
              this._previousStyleCopy = null;
            }
            if (lastProp) {
              for (styleName in lastProp) {
                if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                  styleUpdates = styleUpdates || {};
                  styleUpdates[styleName] = '';
                }
              }
              for (styleName in nextProp) {
                if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
                  styleUpdates = styleUpdates || {};
                  styleUpdates[styleName] = nextProp[styleName];
                }
              }
            } else {
              styleUpdates = nextProp;
            }
          } else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (nextProp) {
              enqueuePutListener(this._rootNodeID, propKey, nextProp, transaction);
            } else if (lastProp) {
              deleteListener(this._rootNodeID, propKey);
            }
          } else if (isCustomComponent(this._tag, nextProps)) {
            if (!node) {
              node = ReactMount.getNode(this._rootNodeID);
            }
            DOMPropertyOperations.setValueForAttribute(node, propKey, nextProp);
          } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
            if (!node) {
              node = ReactMount.getNode(this._rootNodeID);
            }
            if (nextProp != null) {
              DOMPropertyOperations.setValueForProperty(node, propKey, nextProp);
            } else {
              DOMPropertyOperations.deleteValueForProperty(node, propKey);
            }
          }
        }
        if (styleUpdates) {
          if (!node) {
            node = ReactMount.getNode(this._rootNodeID);
          }
          CSSPropertyOperations.setValueForStyles(node, styleUpdates);
        }
      },
      _updateDOMChildren: function(lastProps, nextProps, transaction, context) {
        var lastContent = CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
        var nextContent = CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;
        var lastHtml = lastProps.dangerouslySetInnerHTML && lastProps.dangerouslySetInnerHTML.__html;
        var nextHtml = nextProps.dangerouslySetInnerHTML && nextProps.dangerouslySetInnerHTML.__html;
        var lastChildren = lastContent != null ? null : lastProps.children;
        var nextChildren = nextContent != null ? null : nextProps.children;
        var lastHasContentOrHtml = lastContent != null || lastHtml != null;
        var nextHasContentOrHtml = nextContent != null || nextHtml != null;
        if (lastChildren != null && nextChildren == null) {
          this.updateChildren(null, transaction, context);
        } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
          this.updateTextContent('');
        }
        if (nextContent != null) {
          if (lastContent !== nextContent) {
            this.updateTextContent('' + nextContent);
          }
        } else if (nextHtml != null) {
          if (lastHtml !== nextHtml) {
            this.updateMarkup('' + nextHtml);
          }
        } else if (nextChildren != null) {
          this.updateChildren(nextChildren, transaction, context);
        }
      },
      unmountComponent: function() {
        switch (this._tag) {
          case 'iframe':
          case 'img':
          case 'form':
          case 'video':
          case 'audio':
            var listeners = this._wrapperState.listeners;
            if (listeners) {
              for (var i = 0; i < listeners.length; i++) {
                listeners[i].remove();
              }
            }
            break;
          case 'input':
            ReactDOMInput.unmountWrapper(this);
            break;
          case 'html':
          case 'head':
          case 'body':
            !false ? process.env.NODE_ENV !== 'production' ? invariant(false, '<%s> tried to unmount. Because of cross-browser quirks it is ' + 'impossible to unmount some top-level components (eg <html>, ' + '<head>, and <body>) reliably and efficiently. To fix this, have a ' + 'single top-level component that never unmounts render these ' + 'elements.', this._tag) : invariant(false) : undefined;
            break;
        }
        this.unmountChildren();
        ReactBrowserEventEmitter.deleteAllListeners(this._rootNodeID);
        ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
        this._rootNodeID = null;
        this._wrapperState = null;
        if (this._nodeWithLegacyProperties) {
          var node = this._nodeWithLegacyProperties;
          node._reactInternalComponent = null;
          this._nodeWithLegacyProperties = null;
        }
      },
      getPublicInstance: function() {
        if (!this._nodeWithLegacyProperties) {
          var node = ReactMount.getNode(this._rootNodeID);
          node._reactInternalComponent = this;
          node.getDOMNode = legacyGetDOMNode;
          node.isMounted = legacyIsMounted;
          node.setState = legacySetStateEtc;
          node.replaceState = legacySetStateEtc;
          node.forceUpdate = legacySetStateEtc;
          node.setProps = legacySetProps;
          node.replaceProps = legacyReplaceProps;
          if (process.env.NODE_ENV !== 'production') {
            if (canDefineProperty) {
              Object.defineProperties(node, legacyPropsDescriptor);
            } else {
              node.props = this._currentElement.props;
            }
          } else {
            node.props = this._currentElement.props;
          }
          this._nodeWithLegacyProperties = node;
        }
        return this._nodeWithLegacyProperties;
      }
    };
    ReactPerf.measureMethods(ReactDOMComponent, 'ReactDOMComponent', {
      mountComponent: 'mountComponent',
      updateComponent: 'updateComponent'
    });
    assign(ReactDOMComponent.prototype, ReactDOMComponent.Mixin, ReactMultiChild.Mixin);
    module.exports = ReactDOMComponent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/helpers/get", ["npm:babel-runtime@5.8.25/core-js/object/get-own-property-descriptor"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$getOwnPropertyDescriptor = require("npm:babel-runtime@5.8.25/core-js/object/get-own-property-descriptor")["default"];
  exports["default"] = function get(_x, _x2, _x3) {
    var _again = true;
    _function: while (_again) {
      var object = _x,
          property = _x2,
          receiver = _x3;
      desc = parent = getter = undefined;
      _again = false;
      if (object === null)
        object = Function.prototype;
      var desc = _Object$getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          continue _function;
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === undefined) {
          return undefined;
        }
        return getter.call(receiver);
      }
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/core-js/object/set-prototype-of", ["npm:core-js@0.9.18/library/fn/object/set-prototype-of"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/set-prototype-of"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/lang/isArray", ["npm:lodash@3.10.1/internal/getNative", "npm:lodash@3.10.1/internal/isLength", "npm:lodash@3.10.1/internal/isObjectLike"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var getNative = require("npm:lodash@3.10.1/internal/getNative"),
      isLength = require("npm:lodash@3.10.1/internal/isLength"),
      isObjectLike = require("npm:lodash@3.10.1/internal/isObjectLike");
  var arrayTag = '[object Array]';
  var objectProto = Object.prototype;
  var objToString = objectProto.toString;
  var nativeIsArray = getNative(Array, 'isArray');
  var isArray = nativeIsArray || function(value) {
    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
  };
  module.exports = isArray;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/array/without", ["npm:lodash@3.10.1/internal/baseDifference", "npm:lodash@3.10.1/internal/isArrayLike", "npm:lodash@3.10.1/function/restParam"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseDifference = require("npm:lodash@3.10.1/internal/baseDifference"),
      isArrayLike = require("npm:lodash@3.10.1/internal/isArrayLike"),
      restParam = require("npm:lodash@3.10.1/function/restParam");
  var without = restParam(function(array, values) {
    return isArrayLike(array) ? baseDifference(array, values) : [];
  });
  module.exports = without;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/lang/isPlainObject", ["npm:lodash@3.10.1/internal/baseForIn", "npm:lodash@3.10.1/lang/isArguments", "npm:lodash@3.10.1/internal/isObjectLike"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var baseForIn = require("npm:lodash@3.10.1/internal/baseForIn"),
      isArguments = require("npm:lodash@3.10.1/lang/isArguments"),
      isObjectLike = require("npm:lodash@3.10.1/internal/isObjectLike");
  var objectTag = '[object Object]';
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objToString = objectProto.toString;
  function isPlainObject(value) {
    var Ctor;
    if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) || (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
      return false;
    }
    var result;
    baseForIn(value, function(subValue, key) {
      result = key;
    });
    return result === undefined || hasOwnProperty.call(value, result);
  }
  module.exports = isPlainObject;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/DragSource", ["npm:react@0.14.0", "npm:react-dnd@1.1.8/modules/utils/shallowEqual", "npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar", "npm:invariant@2.1.1", "npm:lodash@3.10.1/lang/isPlainObject", "npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments", "npm:react-dnd@1.1.8/modules/decorateHandler", "npm:react-dnd@1.1.8/modules/registerSource", "npm:react-dnd@1.1.8/modules/createSourceFactory", "npm:react-dnd@1.1.8/modules/createSourceMonitor", "npm:react-dnd@1.1.8/modules/createSourceConnector", "npm:react-dnd@1.1.8/modules/utils/isValidType"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _slice = Array.prototype.slice;
  exports['default'] = DragSource;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _react = require("npm:react@0.14.0");
  var _react2 = _interopRequireDefault(_react);
  var _utilsShallowEqual = require("npm:react-dnd@1.1.8/modules/utils/shallowEqual");
  var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
  var _utilsShallowEqualScalar = require("npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar");
  var _utilsShallowEqualScalar2 = _interopRequireDefault(_utilsShallowEqualScalar);
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _lodashLangIsPlainObject = require("npm:lodash@3.10.1/lang/isPlainObject");
  var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);
  var _utilsCheckDecoratorArguments = require("npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments");
  var _utilsCheckDecoratorArguments2 = _interopRequireDefault(_utilsCheckDecoratorArguments);
  var _decorateHandler = require("npm:react-dnd@1.1.8/modules/decorateHandler");
  var _decorateHandler2 = _interopRequireDefault(_decorateHandler);
  var _registerSource = require("npm:react-dnd@1.1.8/modules/registerSource");
  var _registerSource2 = _interopRequireDefault(_registerSource);
  var _createSourceFactory = require("npm:react-dnd@1.1.8/modules/createSourceFactory");
  var _createSourceFactory2 = _interopRequireDefault(_createSourceFactory);
  var _createSourceMonitor = require("npm:react-dnd@1.1.8/modules/createSourceMonitor");
  var _createSourceMonitor2 = _interopRequireDefault(_createSourceMonitor);
  var _createSourceConnector = require("npm:react-dnd@1.1.8/modules/createSourceConnector");
  var _createSourceConnector2 = _interopRequireDefault(_createSourceConnector);
  var _utilsIsValidType = require("npm:react-dnd@1.1.8/modules/utils/isValidType");
  var _utilsIsValidType2 = _interopRequireDefault(_utilsIsValidType);
  function DragSource(type, spec, collect) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    _utilsCheckDecoratorArguments2['default'].apply(undefined, ['DragSource', 'type, spec, collect[, options]'].concat(_slice.call(arguments)));
    var getType = type;
    if (typeof type !== 'function') {
      _invariant2['default'](_utilsIsValidType2['default'](type), 'Expected "type" provided as the first argument to DragSource to be ' + 'a string, or a function that returns a string given the current props. ' + 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', type);
      getType = function() {
        return type;
      };
    }
    _invariant2['default'](_lodashLangIsPlainObject2['default'](spec), 'Expected "spec" provided as the second argument to DragSource to be ' + 'a plain object. Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', spec);
    var createSource = _createSourceFactory2['default'](spec);
    _invariant2['default'](typeof collect === 'function', 'Expected "collect" provided as the third argument to DragSource to be ' + 'a function that returns a plain object of props to inject. ' + 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', collect);
    _invariant2['default'](_lodashLangIsPlainObject2['default'](options), 'Expected "options" provided as the fourth argument to DragSource to be ' + 'a plain object when specified. ' + 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-source.html', collect);
    return function decorateSource(DecoratedComponent) {
      return _decorateHandler2['default']({
        connectBackend: function connectBackend(backend, sourceId) {
          return backend.connectDragSource(sourceId);
        },
        containerDisplayName: 'DragSource',
        createHandler: createSource,
        registerHandler: _registerSource2['default'],
        createMonitor: _createSourceMonitor2['default'],
        createConnector: _createSourceConnector2['default'],
        DecoratedComponent: DecoratedComponent,
        getType: getType,
        collect: collect,
        options: options
      });
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/fn/symbol/index", ["npm:core-js@0.9.18/library/modules/es6.symbol", "npm:core-js@0.9.18/library/modules/$"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  require("npm:core-js@0.9.18/library/modules/es6.symbol");
  module.exports = require("npm:core-js@0.9.18/library/modules/$").core.Symbol;
  global.define = __define;
  return module.exports;
});

System.register("npm:lodash@3.10.1/object/defaults", ["npm:lodash@3.10.1/object/assign", "npm:lodash@3.10.1/internal/assignDefaults", "npm:lodash@3.10.1/internal/createDefaults"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var assign = require("npm:lodash@3.10.1/object/assign"),
      assignDefaults = require("npm:lodash@3.10.1/internal/assignDefaults"),
      createDefaults = require("npm:lodash@3.10.1/internal/createDefaults");
  var defaults = createDefaults(assign, assignDefaults);
  module.exports = defaults;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/utils/wrapActionCreators", ["npm:redux@3.0.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = wrapActionCreators;
  var _redux = require("npm:redux@3.0.2");
  function wrapActionCreators(actionCreators) {
    return function(dispatch) {
      return _redux.bindActionCreators(actionCreators, dispatch);
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/toArray", ["npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function toArray(obj) {
      var length = obj.length;
      !(!Array.isArray(obj) && (typeof obj === 'object' || typeof obj === 'function')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toArray: Array-like object expected') : invariant(false) : undefined;
      !(typeof length === 'number') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toArray: Object needs a length property') : invariant(false) : undefined;
      !(length === 0 || length - 1 in obj) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toArray: Object should have keys for indices') : invariant(false) : undefined;
      if (obj.hasOwnProperty) {
        try {
          return Array.prototype.slice.call(obj);
        } catch (e) {}
      }
      var ret = Array(length);
      for (var ii = 0; ii < length; ii++) {
        ret[ii] = obj[ii];
      }
      return ret;
    }
    module.exports = toArray;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMIDOperations", ["npm:react@0.14.0/lib/DOMChildrenOperations", "npm:react@0.14.0/lib/DOMPropertyOperations", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactPerf", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var DOMChildrenOperations = require("npm:react@0.14.0/lib/DOMChildrenOperations");
    var DOMPropertyOperations = require("npm:react@0.14.0/lib/DOMPropertyOperations");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var INVALID_PROPERTY_ERRORS = {
      dangerouslySetInnerHTML: '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
      style: '`style` must be set using `updateStylesByID()`.'
    };
    var ReactDOMIDOperations = {
      updatePropertyByID: function(id, name, value) {
        var node = ReactMount.getNode(id);
        !!INVALID_PROPERTY_ERRORS.hasOwnProperty(name) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'updatePropertyByID(...): %s', INVALID_PROPERTY_ERRORS[name]) : invariant(false) : undefined;
        if (value != null) {
          DOMPropertyOperations.setValueForProperty(node, name, value);
        } else {
          DOMPropertyOperations.deleteValueForProperty(node, name);
        }
      },
      dangerouslyReplaceNodeWithMarkupByID: function(id, markup) {
        var node = ReactMount.getNode(id);
        DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
      },
      dangerouslyProcessChildrenUpdates: function(updates, markup) {
        for (var i = 0; i < updates.length; i++) {
          updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
        }
        DOMChildrenOperations.processUpdates(updates, markup);
      }
    };
    ReactPerf.measureMethods(ReactDOMIDOperations, 'ReactDOMIDOperations', {
      dangerouslyReplaceNodeWithMarkupByID: 'dangerouslyReplaceNodeWithMarkupByID',
      dangerouslyProcessChildrenUpdates: 'dangerouslyProcessChildrenUpdates'
    });
    module.exports = ReactDOMIDOperations;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDefaultInjection", ["npm:react@0.14.0/lib/BeforeInputEventPlugin", "npm:react@0.14.0/lib/ChangeEventPlugin", "npm:react@0.14.0/lib/ClientReactRootIndex", "npm:react@0.14.0/lib/DefaultEventPluginOrder", "npm:react@0.14.0/lib/EnterLeaveEventPlugin", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:react@0.14.0/lib/HTMLDOMPropertyConfig", "npm:react@0.14.0/lib/ReactBrowserComponentMixin", "npm:react@0.14.0/lib/ReactComponentBrowserEnvironment", "npm:react@0.14.0/lib/ReactDefaultBatchingStrategy", "npm:react@0.14.0/lib/ReactDOMComponent", "npm:react@0.14.0/lib/ReactDOMTextComponent", "npm:react@0.14.0/lib/ReactEventListener", "npm:react@0.14.0/lib/ReactInjection", "npm:react@0.14.0/lib/ReactInstanceHandles", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactReconcileTransaction", "npm:react@0.14.0/lib/SelectEventPlugin", "npm:react@0.14.0/lib/ServerReactRootIndex", "npm:react@0.14.0/lib/SimpleEventPlugin", "npm:react@0.14.0/lib/SVGDOMPropertyConfig", "npm:react@0.14.0/lib/ReactDefaultPerf", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var BeforeInputEventPlugin = require("npm:react@0.14.0/lib/BeforeInputEventPlugin");
    var ChangeEventPlugin = require("npm:react@0.14.0/lib/ChangeEventPlugin");
    var ClientReactRootIndex = require("npm:react@0.14.0/lib/ClientReactRootIndex");
    var DefaultEventPluginOrder = require("npm:react@0.14.0/lib/DefaultEventPluginOrder");
    var EnterLeaveEventPlugin = require("npm:react@0.14.0/lib/EnterLeaveEventPlugin");
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var HTMLDOMPropertyConfig = require("npm:react@0.14.0/lib/HTMLDOMPropertyConfig");
    var ReactBrowserComponentMixin = require("npm:react@0.14.0/lib/ReactBrowserComponentMixin");
    var ReactComponentBrowserEnvironment = require("npm:react@0.14.0/lib/ReactComponentBrowserEnvironment");
    var ReactDefaultBatchingStrategy = require("npm:react@0.14.0/lib/ReactDefaultBatchingStrategy");
    var ReactDOMComponent = require("npm:react@0.14.0/lib/ReactDOMComponent");
    var ReactDOMTextComponent = require("npm:react@0.14.0/lib/ReactDOMTextComponent");
    var ReactEventListener = require("npm:react@0.14.0/lib/ReactEventListener");
    var ReactInjection = require("npm:react@0.14.0/lib/ReactInjection");
    var ReactInstanceHandles = require("npm:react@0.14.0/lib/ReactInstanceHandles");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactReconcileTransaction = require("npm:react@0.14.0/lib/ReactReconcileTransaction");
    var SelectEventPlugin = require("npm:react@0.14.0/lib/SelectEventPlugin");
    var ServerReactRootIndex = require("npm:react@0.14.0/lib/ServerReactRootIndex");
    var SimpleEventPlugin = require("npm:react@0.14.0/lib/SimpleEventPlugin");
    var SVGDOMPropertyConfig = require("npm:react@0.14.0/lib/SVGDOMPropertyConfig");
    var alreadyInjected = false;
    function inject() {
      if (alreadyInjected) {
        return ;
      }
      alreadyInjected = true;
      ReactInjection.EventEmitter.injectReactEventListener(ReactEventListener);
      ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
      ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
      ReactInjection.EventPluginHub.injectMount(ReactMount);
      ReactInjection.EventPluginHub.injectEventPluginsByName({
        SimpleEventPlugin: SimpleEventPlugin,
        EnterLeaveEventPlugin: EnterLeaveEventPlugin,
        ChangeEventPlugin: ChangeEventPlugin,
        SelectEventPlugin: SelectEventPlugin,
        BeforeInputEventPlugin: BeforeInputEventPlugin
      });
      ReactInjection.NativeComponent.injectGenericComponentClass(ReactDOMComponent);
      ReactInjection.NativeComponent.injectTextComponentClass(ReactDOMTextComponent);
      ReactInjection.Class.injectMixin(ReactBrowserComponentMixin);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);
      ReactInjection.EmptyComponent.injectEmptyComponent('noscript');
      ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
      ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);
      ReactInjection.RootIndex.injectCreateReactRootIndex(ExecutionEnvironment.canUseDOM ? ClientReactRootIndex.createReactRootIndex : ServerReactRootIndex.createReactRootIndex);
      ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);
      if (process.env.NODE_ENV !== 'production') {
        var url = ExecutionEnvironment.canUseDOM && window.location.href || '';
        if (/[?&]react_perf\b/.test(url)) {
          var ReactDefaultPerf = require("npm:react@0.14.0/lib/ReactDefaultPerf");
          ReactDefaultPerf.start();
        }
      }
    }
    module.exports = {inject: inject};
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/helpers/inherits", ["npm:babel-runtime@5.8.25/core-js/object/create", "npm:babel-runtime@5.8.25/core-js/object/set-prototype-of"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$create = require("npm:babel-runtime@5.8.25/core-js/object/create")["default"];
  var _Object$setPrototypeOf = require("npm:babel-runtime@5.8.25/core-js/object/set-prototype-of")["default"];
  exports["default"] = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = _Object$create(superClass && superClass.prototype, {constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }});
    if (superClass)
      _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/utils/matchesType", ["npm:lodash@3.10.1/lang/isArray"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = matchesType;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _lodashLangIsArray = require("npm:lodash@3.10.1/lang/isArray");
  var _lodashLangIsArray2 = _interopRequireDefault(_lodashLangIsArray);
  function matchesType(targetType, draggedItemType) {
    if (_lodashLangIsArray2['default'](targetType)) {
      return targetType.some(function(t) {
        return t === draggedItemType;
      });
    } else {
      return targetType === draggedItemType;
    }
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/reducers/dragOperation", ["npm:dnd-core@1.2.1/lib/actions/dragDrop", "npm:dnd-core@1.2.1/lib/actions/registry", "npm:lodash@3.10.1/array/without"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  exports['default'] = dragOperation;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _actionsDragDrop = require("npm:dnd-core@1.2.1/lib/actions/dragDrop");
  var _actionsRegistry = require("npm:dnd-core@1.2.1/lib/actions/registry");
  var _lodashArrayWithout = require("npm:lodash@3.10.1/array/without");
  var _lodashArrayWithout2 = _interopRequireDefault(_lodashArrayWithout);
  var initialState = {
    itemType: null,
    item: null,
    sourceId: null,
    targetIds: [],
    dropResult: null,
    didDrop: false,
    isSourcePublic: null
  };
  function dragOperation(state, action) {
    if (state === undefined)
      state = initialState;
    switch (action.type) {
      case _actionsDragDrop.BEGIN_DRAG:
        return _extends({}, state, {
          itemType: action.itemType,
          item: action.item,
          sourceId: action.sourceId,
          isSourcePublic: action.isSourcePublic,
          dropResult: null,
          didDrop: false
        });
      case _actionsDragDrop.PUBLISH_DRAG_SOURCE:
        return _extends({}, state, {isSourcePublic: true});
      case _actionsDragDrop.HOVER:
        return _extends({}, state, {targetIds: action.targetIds});
      case _actionsDragDrop.PUBLISH_DRAG_SOURCE:
        return _extends({}, state, {isSourcePublic: true});
      case _actionsRegistry.REMOVE_TARGET:
        if (state.targetIds.indexOf(action.targetId) === -1) {
          return state;
        }
        return _extends({}, state, {targetIds: _lodashArrayWithout2['default'](state.targetIds, action.targetId)});
      case _actionsDragDrop.DROP:
        return _extends({}, state, {
          dropResult: action.dropResult,
          didDrop: true,
          targetIds: []
        });
      case _actionsDragDrop.END_DRAG:
        return _extends({}, state, {
          itemType: null,
          item: null,
          sourceId: null,
          dropResult: null,
          didDrop: false,
          isSourcePublic: null,
          targetIds: []
        });
      default:
        return state;
    }
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/DragLayer", ["npm:react@0.14.0", "npm:dnd-core@1.2.1", "npm:react-dnd@1.1.8/modules/utils/shallowEqual", "npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar", "npm:lodash@3.10.1/lang/isPlainObject", "npm:invariant@2.1.1", "npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  var _slice = Array.prototype.slice;
  var _createClass = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ('value' in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports['default'] = DragLayer;
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
  var _react = require("npm:react@0.14.0");
  var _react2 = _interopRequireDefault(_react);
  var _dndCore = require("npm:dnd-core@1.2.1");
  var _utilsShallowEqual = require("npm:react-dnd@1.1.8/modules/utils/shallowEqual");
  var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
  var _utilsShallowEqualScalar = require("npm:react-dnd@1.1.8/modules/utils/shallowEqualScalar");
  var _utilsShallowEqualScalar2 = _interopRequireDefault(_utilsShallowEqualScalar);
  var _lodashLangIsPlainObject = require("npm:lodash@3.10.1/lang/isPlainObject");
  var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _utilsCheckDecoratorArguments = require("npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments");
  var _utilsCheckDecoratorArguments2 = _interopRequireDefault(_utilsCheckDecoratorArguments);
  function DragLayer(collect) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    _utilsCheckDecoratorArguments2['default'].apply(undefined, ['DragLayer', 'collect[, options]'].concat(_slice.call(arguments)));
    _invariant2['default'](typeof collect === 'function', 'Expected "collect" provided as the first argument to DragLayer ' + 'to be a function that collects props to inject into the component. ', 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-layer.html', collect);
    _invariant2['default'](_lodashLangIsPlainObject2['default'](options), 'Expected "options" provided as the second argument to DragLayer to be ' + 'a plain object when specified. ' + 'Instead, received %s. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-layer.html', options);
    return function decorateLayer(DecoratedComponent) {
      var _options$arePropsEqual = options.arePropsEqual;
      var arePropsEqual = _options$arePropsEqual === undefined ? _utilsShallowEqualScalar2['default'] : _options$arePropsEqual;
      var displayName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';
      return (function(_Component) {
        _inherits(DragLayerContainer, _Component);
        DragLayerContainer.prototype.getDecoratedComponentInstance = function getDecoratedComponentInstance() {
          return this.refs.child;
        };
        DragLayerContainer.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
          return !arePropsEqual(nextProps, this.props) || !_utilsShallowEqual2['default'](nextState, this.state);
        };
        _createClass(DragLayerContainer, null, [{
          key: 'DecoratedComponent',
          value: DecoratedComponent,
          enumerable: true
        }, {
          key: 'displayName',
          value: 'DragLayer(' + displayName + ')',
          enumerable: true
        }, {
          key: 'contextTypes',
          value: {dragDropManager: _react.PropTypes.object.isRequired},
          enumerable: true
        }]);
        function DragLayerContainer(props, context) {
          _classCallCheck(this, DragLayerContainer);
          _Component.call(this, props);
          this.handleChange = this.handleChange.bind(this);
          this.manager = context.dragDropManager;
          _invariant2['default'](typeof this.manager === 'object', 'Could not find the drag and drop manager in the context of %s. ' + 'Make sure to wrap the top-level component of your app with DragDropContext. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-troubleshooting.html#could-not-find-the-drag-and-drop-manager-in-the-context', displayName, displayName);
          this.state = this.getCurrentState();
        }
        DragLayerContainer.prototype.componentDidMount = function componentDidMount() {
          var monitor = this.manager.getMonitor();
          this.unsubscribe = monitor.subscribeToOffsetChange(this.handleChange);
        };
        DragLayerContainer.prototype.componentWillUnmount = function componentWillUnmount() {
          this.unsubscribe();
        };
        DragLayerContainer.prototype.handleChange = function handleChange() {
          var nextState = this.getCurrentState();
          if (!_utilsShallowEqual2['default'](nextState, this.state)) {
            this.setState(nextState);
          }
        };
        DragLayerContainer.prototype.getCurrentState = function getCurrentState() {
          var monitor = this.manager.getMonitor();
          return collect(monitor);
        };
        DragLayerContainer.prototype.render = function render() {
          return _react2['default'].createElement(DecoratedComponent, _extends({}, this.props, this.state, {ref: 'child'}));
        };
        return DragLayerContainer;
      })(_react.Component);
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:core-js@0.9.18/library/fn/symbol", ["npm:core-js@0.9.18/library/fn/symbol/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:core-js@0.9.18/library/fn/symbol/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/backends/HTML5", ["npm:dnd-core@1.2.1", "npm:react-dnd@1.1.8/modules/utils/EnterLeaveCounter", "npm:react-dnd@1.1.8/modules/utils/BrowserDetector", "npm:react-dnd@1.1.8/modules/utils/OffsetHelpers", "npm:react-dnd@1.1.8/modules/utils/shallowEqual", "npm:lodash@3.10.1/object/defaults", "npm:invariant@2.1.1"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var _dndCore = require("npm:dnd-core@1.2.1");
  var _utilsEnterLeaveCounter = require("npm:react-dnd@1.1.8/modules/utils/EnterLeaveCounter");
  var _utilsEnterLeaveCounter2 = _interopRequireDefault(_utilsEnterLeaveCounter);
  var _utilsBrowserDetector = require("npm:react-dnd@1.1.8/modules/utils/BrowserDetector");
  var _utilsOffsetHelpers = require("npm:react-dnd@1.1.8/modules/utils/OffsetHelpers");
  var _utilsShallowEqual = require("npm:react-dnd@1.1.8/modules/utils/shallowEqual");
  var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
  var _lodashObjectDefaults = require("npm:lodash@3.10.1/object/defaults");
  var _lodashObjectDefaults2 = _interopRequireDefault(_lodashObjectDefaults);
  var _invariant = require("npm:invariant@2.1.1");
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
        return ;
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
        return ;
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
        return ;
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
        return ;
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
        return ;
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
        return ;
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
        return ;
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
        return ;
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
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/components/createConnect", ["npm:react-redux@3.1.0/lib/utils/createStoreShape", "npm:react-redux@3.1.0/lib/utils/shallowEqual", "npm:react-redux@3.1.0/lib/utils/isPlainObject", "npm:react-redux@3.1.0/lib/utils/wrapActionCreators", "npm:hoist-non-react-statics@1.0.3", "npm:invariant@2.1.1", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    exports['default'] = createConnect;
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
    var _utilsCreateStoreShape = require("npm:react-redux@3.1.0/lib/utils/createStoreShape");
    var _utilsCreateStoreShape2 = _interopRequireDefault(_utilsCreateStoreShape);
    var _utilsShallowEqual = require("npm:react-redux@3.1.0/lib/utils/shallowEqual");
    var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
    var _utilsIsPlainObject = require("npm:react-redux@3.1.0/lib/utils/isPlainObject");
    var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);
    var _utilsWrapActionCreators = require("npm:react-redux@3.1.0/lib/utils/wrapActionCreators");
    var _utilsWrapActionCreators2 = _interopRequireDefault(_utilsWrapActionCreators);
    var _hoistNonReactStatics = require("npm:hoist-non-react-statics@1.0.3");
    var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);
    var _invariant = require("npm:invariant@2.1.1");
    var _invariant2 = _interopRequireDefault(_invariant);
    var defaultMapStateToProps = function defaultMapStateToProps() {
      return {};
    };
    var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
      return {dispatch: dispatch};
    };
    var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
      return _extends({}, parentProps, stateProps, dispatchProps);
    };
    function getDisplayName(Component) {
      return Component.displayName || Component.name || 'Component';
    }
    var nextVersion = 0;
    function createConnect(React) {
      var Component = React.Component;
      var PropTypes = React.PropTypes;
      var storeShape = _utilsCreateStoreShape2['default'](PropTypes);
      return function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
        var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
        var shouldSubscribe = Boolean(mapStateToProps);
        var finalMapStateToProps = mapStateToProps || defaultMapStateToProps;
        var finalMapDispatchToProps = _utilsIsPlainObject2['default'](mapDispatchToProps) ? _utilsWrapActionCreators2['default'](mapDispatchToProps) : mapDispatchToProps || defaultMapDispatchToProps;
        var finalMergeProps = mergeProps || defaultMergeProps;
        var shouldUpdateStateProps = finalMapStateToProps.length > 1;
        var shouldUpdateDispatchProps = finalMapDispatchToProps.length > 1;
        var _options$pure = options.pure;
        var pure = _options$pure === undefined ? true : _options$pure;
        var version = nextVersion++;
        function computeStateProps(store, props) {
          var state = store.getState();
          var stateProps = shouldUpdateStateProps ? finalMapStateToProps(state, props) : finalMapStateToProps(state);
          _invariant2['default'](_utilsIsPlainObject2['default'](stateProps), '`mapStateToProps` must return an object. Instead received %s.', stateProps);
          return stateProps;
        }
        function computeDispatchProps(store, props) {
          var dispatch = store.dispatch;
          var dispatchProps = shouldUpdateDispatchProps ? finalMapDispatchToProps(dispatch, props) : finalMapDispatchToProps(dispatch);
          _invariant2['default'](_utilsIsPlainObject2['default'](dispatchProps), '`mapDispatchToProps` must return an object. Instead received %s.', dispatchProps);
          return dispatchProps;
        }
        function _computeNextState(stateProps, dispatchProps, parentProps) {
          var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
          _invariant2['default'](_utilsIsPlainObject2['default'](mergedProps), '`mergeProps` must return an object. Instead received %s.', mergedProps);
          return mergedProps;
        }
        return function wrapWithConnect(WrappedComponent) {
          var Connect = (function(_Component) {
            _inherits(Connect, _Component);
            Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
              if (!pure) {
                this.updateStateProps(nextProps);
                this.updateDispatchProps(nextProps);
                this.updateState(nextProps);
                return true;
              }
              var storeChanged = nextState.storeState !== this.state.storeState;
              var propsChanged = !_utilsShallowEqual2['default'](nextProps, this.props);
              var mapStateProducedChange = false;
              var dispatchPropsChanged = false;
              if (storeChanged || propsChanged && shouldUpdateStateProps) {
                mapStateProducedChange = this.updateStateProps(nextProps);
              }
              if (propsChanged && shouldUpdateDispatchProps) {
                dispatchPropsChanged = this.updateDispatchProps(nextProps);
              }
              if (propsChanged || mapStateProducedChange || dispatchPropsChanged) {
                this.updateState(nextProps);
                return true;
              }
              return false;
            };
            function Connect(props, context) {
              _classCallCheck(this, Connect);
              _Component.call(this, props, context);
              this.version = version;
              this.store = props.store || context.store;
              _invariant2['default'](this.store, 'Could not find "store" in either the context or ' + ('props of "' + this.constructor.displayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + this.constructor.displayName + '".'));
              this.stateProps = computeStateProps(this.store, props);
              this.dispatchProps = computeDispatchProps(this.store, props);
              this.state = {storeState: null};
              this.updateState();
            }
            Connect.prototype.computeNextState = function computeNextState() {
              var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
              return _computeNextState(this.stateProps, this.dispatchProps, props);
            };
            Connect.prototype.updateStateProps = function updateStateProps() {
              var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
              var nextStateProps = computeStateProps(this.store, props);
              if (_utilsShallowEqual2['default'](nextStateProps, this.stateProps)) {
                return false;
              }
              this.stateProps = nextStateProps;
              return true;
            };
            Connect.prototype.updateDispatchProps = function updateDispatchProps() {
              var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
              var nextDispatchProps = computeDispatchProps(this.store, props);
              if (_utilsShallowEqual2['default'](nextDispatchProps, this.dispatchProps)) {
                return false;
              }
              this.dispatchProps = nextDispatchProps;
              return true;
            };
            Connect.prototype.updateState = function updateState() {
              var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
              this.nextState = this.computeNextState(props);
            };
            Connect.prototype.isSubscribed = function isSubscribed() {
              return typeof this.unsubscribe === 'function';
            };
            Connect.prototype.trySubscribe = function trySubscribe() {
              if (shouldSubscribe && !this.unsubscribe) {
                this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
                this.handleChange();
              }
            };
            Connect.prototype.tryUnsubscribe = function tryUnsubscribe() {
              if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
              }
            };
            Connect.prototype.componentDidMount = function componentDidMount() {
              this.trySubscribe();
            };
            Connect.prototype.componentWillUnmount = function componentWillUnmount() {
              this.tryUnsubscribe();
            };
            Connect.prototype.handleChange = function handleChange() {
              if (!this.unsubscribe) {
                return ;
              }
              this.setState({storeState: this.store.getState()});
            };
            Connect.prototype.getWrappedInstance = function getWrappedInstance() {
              return this.refs.wrappedInstance;
            };
            Connect.prototype.render = function render() {
              return React.createElement(WrappedComponent, _extends({ref: 'wrappedInstance'}, this.nextState));
            };
            return Connect;
          })(Component);
          Connect.displayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';
          Connect.WrappedComponent = WrappedComponent;
          Connect.contextTypes = {store: storeShape};
          Connect.propTypes = {store: storeShape};
          if (process.env.NODE_ENV !== 'production') {
            Connect.prototype.componentWillUpdate = function componentWillUpdate() {
              if (this.version === version) {
                return ;
              }
              this.version = version;
              this.trySubscribe();
              this.updateStateProps();
              this.updateDispatchProps();
              this.updateState();
            };
          }
          return _hoistNonReactStatics2['default'](Connect, WrappedComponent);
        };
      };
    }
    module.exports = exports['default'];
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/createArrayFromMixed", ["npm:fbjs@0.3.1/lib/toArray"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var toArray = require("npm:fbjs@0.3.1/lib/toArray");
  function hasArrayNature(obj) {
    return (!!obj && (typeof obj == 'object' || typeof obj == 'function') && 'length' in obj && !('setInterval' in obj) && typeof obj.nodeType != 'number' && (Array.isArray(obj) || 'callee' in obj || 'item' in obj));
  }
  function createArrayFromMixed(obj) {
    if (!hasArrayNature(obj)) {
      return [obj];
    } else if (Array.isArray(obj)) {
      return obj.slice();
    } else {
      return toArray(obj);
    }
  }
  module.exports = createArrayFromMixed;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactComponentBrowserEnvironment", ["npm:react@0.14.0/lib/ReactDOMIDOperations", "npm:react@0.14.0/lib/ReactMount", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactDOMIDOperations = require("npm:react@0.14.0/lib/ReactDOMIDOperations");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactComponentBrowserEnvironment = {
      processChildrenUpdates: ReactDOMIDOperations.dangerouslyProcessChildrenUpdates,
      replaceNodeWithMarkupByID: ReactDOMIDOperations.dangerouslyReplaceNodeWithMarkupByID,
      unmountIDFromEnvironment: function(rootNodeID) {
        ReactMount.purgeID(rootNodeID);
      }
    };
    module.exports = ReactComponentBrowserEnvironment;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/actions/dragDrop", ["npm:dnd-core@1.2.1/lib/utils/matchesType", "npm:invariant@2.1.1", "npm:lodash@3.10.1/lang/isArray", "npm:lodash@3.10.1/lang/isObject"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports.beginDrag = beginDrag;
  exports.publishDragSource = publishDragSource;
  exports.hover = hover;
  exports.drop = drop;
  exports.endDrag = endDrag;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _utilsMatchesType = require("npm:dnd-core@1.2.1/lib/utils/matchesType");
  var _utilsMatchesType2 = _interopRequireDefault(_utilsMatchesType);
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _lodashLangIsArray = require("npm:lodash@3.10.1/lang/isArray");
  var _lodashLangIsArray2 = _interopRequireDefault(_lodashLangIsArray);
  var _lodashLangIsObject = require("npm:lodash@3.10.1/lang/isObject");
  var _lodashLangIsObject2 = _interopRequireDefault(_lodashLangIsObject);
  var BEGIN_DRAG = 'dnd-core/BEGIN_DRAG';
  exports.BEGIN_DRAG = BEGIN_DRAG;
  var PUBLISH_DRAG_SOURCE = 'dnd-core/PUBLISH_DRAG_SOURCE';
  exports.PUBLISH_DRAG_SOURCE = PUBLISH_DRAG_SOURCE;
  var HOVER = 'dnd-core/HOVER';
  exports.HOVER = HOVER;
  var DROP = 'dnd-core/DROP';
  exports.DROP = DROP;
  var END_DRAG = 'dnd-core/END_DRAG';
  exports.END_DRAG = END_DRAG;
  function beginDrag(sourceIds) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var _ref$publishSource = _ref.publishSource;
    var publishSource = _ref$publishSource === undefined ? true : _ref$publishSource;
    var _ref$clientOffset = _ref.clientOffset;
    var clientOffset = _ref$clientOffset === undefined ? null : _ref$clientOffset;
    var getSourceClientOffset = _ref.getSourceClientOffset;
    _invariant2['default'](_lodashLangIsArray2['default'](sourceIds), 'Expected sourceIds to be an array.');
    var monitor = this.getMonitor();
    var registry = this.getRegistry();
    _invariant2['default'](!monitor.isDragging(), 'Cannot call beginDrag while dragging.');
    for (var i = 0; i < sourceIds.length; i++) {
      _invariant2['default'](registry.getSource(sourceIds[i]), 'Expected sourceIds to be registered.');
    }
    var sourceId = null;
    for (var i = sourceIds.length - 1; i >= 0; i--) {
      if (monitor.canDragSource(sourceIds[i])) {
        sourceId = sourceIds[i];
        break;
      }
    }
    if (sourceId === null) {
      return ;
    }
    var sourceClientOffset = null;
    if (clientOffset) {
      _invariant2['default'](typeof getSourceClientOffset === 'function', 'When clientOffset is provided, getSourceClientOffset must be a function.');
      sourceClientOffset = getSourceClientOffset(sourceId);
    }
    var source = registry.getSource(sourceId);
    var item = source.beginDrag(monitor, sourceId);
    _invariant2['default'](_lodashLangIsObject2['default'](item), 'Item must be an object.');
    registry.pinSource(sourceId);
    var itemType = registry.getSourceType(sourceId);
    return {
      type: BEGIN_DRAG,
      itemType: itemType,
      item: item,
      sourceId: sourceId,
      clientOffset: clientOffset,
      sourceClientOffset: sourceClientOffset,
      isSourcePublic: publishSource
    };
  }
  function publishDragSource(manager) {
    var monitor = this.getMonitor();
    if (!monitor.isDragging()) {
      return ;
    }
    return {type: PUBLISH_DRAG_SOURCE};
  }
  function hover(targetIds) {
    var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var _ref2$clientOffset = _ref2.clientOffset;
    var clientOffset = _ref2$clientOffset === undefined ? null : _ref2$clientOffset;
    _invariant2['default'](_lodashLangIsArray2['default'](targetIds), 'Expected targetIds to be an array.');
    targetIds = targetIds.slice(0);
    var monitor = this.getMonitor();
    var registry = this.getRegistry();
    _invariant2['default'](monitor.isDragging(), 'Cannot call hover while not dragging.');
    _invariant2['default'](!monitor.didDrop(), 'Cannot call hover after drop.');
    var draggedItemType = monitor.getItemType();
    for (var i = 0; i < targetIds.length; i++) {
      var targetId = targetIds[i];
      _invariant2['default'](targetIds.lastIndexOf(targetId) === i, 'Expected targetIds to be unique in the passed array.');
      var target = registry.getTarget(targetId);
      _invariant2['default'](target, 'Expected targetIds to be registered.');
      var targetType = registry.getTargetType(targetId);
      if (_utilsMatchesType2['default'](targetType, draggedItemType)) {
        target.hover(monitor, targetId);
      }
    }
    return {
      type: HOVER,
      targetIds: targetIds,
      clientOffset: clientOffset
    };
  }
  function drop() {
    var _this = this;
    var monitor = this.getMonitor();
    var registry = this.getRegistry();
    _invariant2['default'](monitor.isDragging(), 'Cannot call drop while not dragging.');
    _invariant2['default'](!monitor.didDrop(), 'Cannot call drop twice during one drag operation.');
    var targetIds = monitor.getTargetIds().filter(monitor.canDropOnTarget, monitor);
    targetIds.reverse();
    targetIds.forEach(function(targetId, index) {
      var target = registry.getTarget(targetId);
      var dropResult = target.drop(monitor, targetId);
      _invariant2['default'](typeof dropResult === 'undefined' || _lodashLangIsObject2['default'](dropResult), 'Drop result must either be an object or undefined.');
      if (typeof dropResult === 'undefined') {
        dropResult = index === 0 ? {} : monitor.getDropResult();
      }
      _this.store.dispatch({
        type: DROP,
        dropResult: dropResult
      });
    });
  }
  function endDrag() {
    var monitor = this.getMonitor();
    var registry = this.getRegistry();
    _invariant2['default'](monitor.isDragging(), 'Cannot call endDrag while not dragging.');
    var sourceId = monitor.getSourceId();
    var source = registry.getSource(sourceId, true);
    source.endDrag(monitor, sourceId);
    registry.unpinSource();
    return {type: END_DRAG};
  }
  global.define = __define;
  return module.exports;
});

System.register("npm:babel-runtime@5.8.25/core-js/symbol", ["npm:core-js@0.9.18/library/fn/symbol"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/symbol"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/components/createAll", ["npm:react-redux@3.1.0/lib/components/createProvider", "npm:react-redux@3.1.0/lib/components/createConnect"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  exports['default'] = createAll;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _createProvider = require("npm:react-redux@3.1.0/lib/components/createProvider");
  var _createProvider2 = _interopRequireDefault(_createProvider);
  var _createConnect = require("npm:react-redux@3.1.0/lib/components/createConnect");
  var _createConnect2 = _interopRequireDefault(_createConnect);
  function createAll(React) {
    var Provider = _createProvider2['default'](React);
    var connect = _createConnect2['default'](React);
    return {
      Provider: Provider,
      connect: connect
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:fbjs@0.3.1/lib/createNodesFromMarkup", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:fbjs@0.3.1/lib/createArrayFromMixed", "npm:fbjs@0.3.1/lib/getMarkupWrap", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var createArrayFromMixed = require("npm:fbjs@0.3.1/lib/createArrayFromMixed");
    var getMarkupWrap = require("npm:fbjs@0.3.1/lib/getMarkupWrap");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;
    var nodeNamePattern = /^\s*<(\w+)/;
    function getNodeName(markup) {
      var nodeNameMatch = markup.match(nodeNamePattern);
      return nodeNameMatch && nodeNameMatch[1].toLowerCase();
    }
    function createNodesFromMarkup(markup, handleScript) {
      var node = dummyNode;
      !!!dummyNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createNodesFromMarkup dummy not initialized') : invariant(false) : undefined;
      var nodeName = getNodeName(markup);
      var wrap = nodeName && getMarkupWrap(nodeName);
      if (wrap) {
        node.innerHTML = wrap[1] + markup + wrap[2];
        var wrapDepth = wrap[0];
        while (wrapDepth--) {
          node = node.lastChild;
        }
      } else {
        node.innerHTML = markup;
      }
      var scripts = node.getElementsByTagName('script');
      if (scripts.length) {
        !handleScript ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createNodesFromMarkup(...): Unexpected <script> element rendered.') : invariant(false) : undefined;
        createArrayFromMixed(scripts).forEach(handleScript);
      }
      var nodes = createArrayFromMixed(node.childNodes);
      while (node.lastChild) {
        node.removeChild(node.lastChild);
      }
      return nodes;
    }
    module.exports = createNodesFromMarkup;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/reducers/dragOffset", ["npm:dnd-core@1.2.1/lib/actions/dragDrop"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  exports['default'] = dragOffset;
  exports.getSourceClientOffset = getSourceClientOffset;
  exports.getDifferenceFromInitialOffset = getDifferenceFromInitialOffset;
  var _actionsDragDrop = require("npm:dnd-core@1.2.1/lib/actions/dragDrop");
  var initialState = {
    initialSourceClientOffset: null,
    initialClientOffset: null,
    clientOffset: null
  };
  function areOffsetsEqual(offsetA, offsetB) {
    if (offsetA === offsetB) {
      return true;
    }
    return offsetA && offsetB && offsetA.x === offsetB.x && offsetA.y === offsetB.y;
  }
  function dragOffset(state, action) {
    if (state === undefined)
      state = initialState;
    switch (action.type) {
      case _actionsDragDrop.BEGIN_DRAG:
        return {
          initialSourceClientOffset: action.sourceClientOffset,
          initialClientOffset: action.clientOffset,
          clientOffset: action.clientOffset
        };
      case _actionsDragDrop.HOVER:
        if (areOffsetsEqual(state.clientOffset, action.clientOffset)) {
          return state;
        }
        return _extends({}, state, {clientOffset: action.clientOffset});
      case _actionsDragDrop.END_DRAG:
      case _actionsDragDrop.DROP:
        return initialState;
      default:
        return state;
    }
  }
  function getSourceClientOffset(state) {
    var clientOffset = state.clientOffset;
    var initialClientOffset = state.initialClientOffset;
    var initialSourceClientOffset = state.initialSourceClientOffset;
    if (!clientOffset || !initialClientOffset || !initialSourceClientOffset) {
      return null;
    }
    return {
      x: clientOffset.x + initialSourceClientOffset.x - initialClientOffset.x,
      y: clientOffset.y + initialSourceClientOffset.y - initialClientOffset.y
    };
  }
  function getDifferenceFromInitialOffset(state) {
    var clientOffset = state.clientOffset;
    var initialClientOffset = state.initialClientOffset;
    if (!clientOffset || !initialClientOffset) {
      return null;
    }
    return {
      x: clientOffset.x - initialClientOffset.x,
      y: clientOffset.y - initialClientOffset.y
    };
  }
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0/lib/index", ["npm:react@0.14.0", "npm:react-redux@3.1.0/lib/components/createAll"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _react = require("npm:react@0.14.0");
  var _react2 = _interopRequireDefault(_react);
  var _componentsCreateAll = require("npm:react-redux@3.1.0/lib/components/createAll");
  var _componentsCreateAll2 = _interopRequireDefault(_componentsCreateAll);
  var _createAll = _componentsCreateAll2['default'](_react2['default']);
  var Provider = _createAll.Provider;
  var connect = _createAll.connect;
  exports.Provider = Provider;
  exports.connect = connect;
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/Danger", ["npm:fbjs@0.3.1/lib/ExecutionEnvironment", "npm:fbjs@0.3.1/lib/createNodesFromMarkup", "npm:fbjs@0.3.1/lib/emptyFunction", "npm:fbjs@0.3.1/lib/getMarkupWrap", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
    var createNodesFromMarkup = require("npm:fbjs@0.3.1/lib/createNodesFromMarkup");
    var emptyFunction = require("npm:fbjs@0.3.1/lib/emptyFunction");
    var getMarkupWrap = require("npm:fbjs@0.3.1/lib/getMarkupWrap");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
    var RESULT_INDEX_ATTR = 'data-danger-index';
    function getNodeName(markup) {
      return markup.substring(1, markup.indexOf(' '));
    }
    var Danger = {
      dangerouslyRenderMarkup: function(markupList) {
        !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyRenderMarkup(...): Cannot render markup in a worker ' + 'thread. Make sure `window` and `document` are available globally ' + 'before requiring React when unit testing or use ' + 'ReactDOMServer.renderToString for server rendering.') : invariant(false) : undefined;
        var nodeName;
        var markupByNodeName = {};
        for (var i = 0; i < markupList.length; i++) {
          !markupList[i] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyRenderMarkup(...): Missing markup.') : invariant(false) : undefined;
          nodeName = getNodeName(markupList[i]);
          nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
          markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
          markupByNodeName[nodeName][i] = markupList[i];
        }
        var resultList = [];
        var resultListAssignmentCount = 0;
        for (nodeName in markupByNodeName) {
          if (!markupByNodeName.hasOwnProperty(nodeName)) {
            continue;
          }
          var markupListByNodeName = markupByNodeName[nodeName];
          var resultIndex;
          for (resultIndex in markupListByNodeName) {
            if (markupListByNodeName.hasOwnProperty(resultIndex)) {
              var markup = markupListByNodeName[resultIndex];
              markupListByNodeName[resultIndex] = markup.replace(OPEN_TAG_NAME_EXP, '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" ');
            }
          }
          var renderNodes = createNodesFromMarkup(markupListByNodeName.join(''), emptyFunction);
          for (var j = 0; j < renderNodes.length; ++j) {
            var renderNode = renderNodes[j];
            if (renderNode.hasAttribute && renderNode.hasAttribute(RESULT_INDEX_ATTR)) {
              resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
              renderNode.removeAttribute(RESULT_INDEX_ATTR);
              !!resultList.hasOwnProperty(resultIndex) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Assigning to an already-occupied result index.') : invariant(false) : undefined;
              resultList[resultIndex] = renderNode;
              resultListAssignmentCount += 1;
            } else if (process.env.NODE_ENV !== 'production') {
              console.error('Danger: Discarding unexpected node:', renderNode);
            }
          }
        }
        !(resultListAssignmentCount === resultList.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Did not assign to every index of resultList.') : invariant(false) : undefined;
        !(resultList.length === markupList.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Expected markup to render %s nodes, but rendered %s.', markupList.length, resultList.length) : invariant(false) : undefined;
        return resultList;
      },
      dangerouslyReplaceNodeWithMarkup: function(oldChild, markup) {
        !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' + 'worker thread. Make sure `window` and `document` are available ' + 'globally before requiring React when unit testing or use ' + 'ReactDOMServer.renderToString() for server rendering.') : invariant(false) : undefined;
        !markup ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(false) : undefined;
        !(oldChild.tagName.toLowerCase() !== 'html') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the ' + '<html> node. This is because browser quirks make this unreliable ' + 'and/or slow. If you want to render to the root you must use ' + 'server rendering. See ReactDOMServer.renderToString().') : invariant(false) : undefined;
        var newChild;
        if (typeof markup === 'string') {
          newChild = createNodesFromMarkup(markup, emptyFunction)[0];
        } else {
          newChild = markup;
        }
        oldChild.parentNode.replaceChild(newChild, oldChild);
      }
    };
    module.exports = Danger;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/reducers/index", ["npm:dnd-core@1.2.1/lib/reducers/dragOffset", "npm:dnd-core@1.2.1/lib/reducers/dragOperation", "npm:dnd-core@1.2.1/lib/reducers/refCount", "npm:dnd-core@1.2.1/lib/reducers/dirtyHandlerIds"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _dragOffset = require("npm:dnd-core@1.2.1/lib/reducers/dragOffset");
  var _dragOffset2 = _interopRequireDefault(_dragOffset);
  var _dragOperation = require("npm:dnd-core@1.2.1/lib/reducers/dragOperation");
  var _dragOperation2 = _interopRequireDefault(_dragOperation);
  var _refCount = require("npm:dnd-core@1.2.1/lib/reducers/refCount");
  var _refCount2 = _interopRequireDefault(_refCount);
  var _dirtyHandlerIds = require("npm:dnd-core@1.2.1/lib/reducers/dirtyHandlerIds");
  var _dirtyHandlerIds2 = _interopRequireDefault(_dirtyHandlerIds);
  exports['default'] = function(state, action) {
    if (state === undefined)
      state = {};
    return {
      dirtyHandlerIds: _dirtyHandlerIds2['default'](state.dirtyHandlerIds, action, state.dragOperation),
      dragOffset: _dragOffset2['default'](state.dragOffset, action),
      refCount: _refCount2['default'](state.refCount, action),
      dragOperation: _dragOperation2['default'](state.dragOperation, action)
    };
  };
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react-redux@3.1.0", ["npm:react-redux@3.1.0/lib/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:react-redux@3.1.0/lib/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/DOMChildrenOperations", ["npm:react@0.14.0/lib/Danger", "npm:react@0.14.0/lib/ReactMultiChildUpdateTypes", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/setInnerHTML", "npm:react@0.14.0/lib/setTextContent", "npm:fbjs@0.3.1/lib/invariant", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var Danger = require("npm:react@0.14.0/lib/Danger");
    var ReactMultiChildUpdateTypes = require("npm:react@0.14.0/lib/ReactMultiChildUpdateTypes");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var setInnerHTML = require("npm:react@0.14.0/lib/setInnerHTML");
    var setTextContent = require("npm:react@0.14.0/lib/setTextContent");
    var invariant = require("npm:fbjs@0.3.1/lib/invariant");
    function insertChildAt(parentNode, childNode, index) {
      var beforeChild = index >= parentNode.childNodes.length ? null : parentNode.childNodes.item(index);
      parentNode.insertBefore(childNode, beforeChild);
    }
    var DOMChildrenOperations = {
      dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,
      updateTextContent: setTextContent,
      processUpdates: function(updates, markupList) {
        var update;
        var initialChildren = null;
        var updatedChildren = null;
        for (var i = 0; i < updates.length; i++) {
          update = updates[i];
          if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING || update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
            var updatedIndex = update.fromIndex;
            var updatedChild = update.parentNode.childNodes[updatedIndex];
            var parentID = update.parentID;
            !updatedChild ? process.env.NODE_ENV !== 'production' ? invariant(false, 'processUpdates(): Unable to find child %s of element. This ' + 'probably means the DOM was unexpectedly mutated (e.g., by the ' + 'browser), usually due to forgetting a <tbody> when using tables, ' + 'nesting tags like <form>, <p>, or <a>, or using non-SVG elements ' + 'in an <svg> parent. Try inspecting the child nodes of the element ' + 'with React ID `%s`.', updatedIndex, parentID) : invariant(false) : undefined;
            initialChildren = initialChildren || {};
            initialChildren[parentID] = initialChildren[parentID] || [];
            initialChildren[parentID][updatedIndex] = updatedChild;
            updatedChildren = updatedChildren || [];
            updatedChildren.push(updatedChild);
          }
        }
        var renderedMarkup;
        if (markupList.length && typeof markupList[0] === 'string') {
          renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);
        } else {
          renderedMarkup = markupList;
        }
        if (updatedChildren) {
          for (var j = 0; j < updatedChildren.length; j++) {
            updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
          }
        }
        for (var k = 0; k < updates.length; k++) {
          update = updates[k];
          switch (update.type) {
            case ReactMultiChildUpdateTypes.INSERT_MARKUP:
              insertChildAt(update.parentNode, renderedMarkup[update.markupIndex], update.toIndex);
              break;
            case ReactMultiChildUpdateTypes.MOVE_EXISTING:
              insertChildAt(update.parentNode, initialChildren[update.parentID][update.fromIndex], update.toIndex);
              break;
            case ReactMultiChildUpdateTypes.SET_MARKUP:
              setInnerHTML(update.parentNode, update.content);
              break;
            case ReactMultiChildUpdateTypes.TEXT_CONTENT:
              setTextContent(update.parentNode, update.content);
              break;
            case ReactMultiChildUpdateTypes.REMOVE_NODE:
              break;
          }
        }
      }
    };
    ReactPerf.measureMethods(DOMChildrenOperations, 'DOMChildrenOperations', {updateTextContent: 'updateTextContent'});
    module.exports = DOMChildrenOperations;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/DragDropManager", ["npm:redux@3.0.2/lib/createStore", "npm:dnd-core@1.2.1/lib/reducers/index", "npm:dnd-core@1.2.1/lib/actions/dragDrop", "npm:dnd-core@1.2.1/lib/DragDropMonitor", "npm:dnd-core@1.2.1/lib/HandlerRegistry"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var _reduxLibCreateStore = require("npm:redux@3.0.2/lib/createStore");
  var _reduxLibCreateStore2 = _interopRequireDefault(_reduxLibCreateStore);
  var _reducers = require("npm:dnd-core@1.2.1/lib/reducers/index");
  var _reducers2 = _interopRequireDefault(_reducers);
  var _actionsDragDrop = require("npm:dnd-core@1.2.1/lib/actions/dragDrop");
  var dragDropActions = _interopRequireWildcard(_actionsDragDrop);
  var _DragDropMonitor = require("npm:dnd-core@1.2.1/lib/DragDropMonitor");
  var _DragDropMonitor2 = _interopRequireDefault(_DragDropMonitor);
  var _HandlerRegistry = require("npm:dnd-core@1.2.1/lib/HandlerRegistry");
  var _HandlerRegistry2 = _interopRequireDefault(_HandlerRegistry);
  var DragDropManager = (function() {
    function DragDropManager(createBackend) {
      _classCallCheck(this, DragDropManager);
      var store = _reduxLibCreateStore2['default'](_reducers2['default']);
      this.store = store;
      this.monitor = new _DragDropMonitor2['default'](store);
      this.registry = this.monitor.registry;
      this.backend = createBackend(this);
      store.subscribe(this.handleRefCountChange.bind(this));
    }
    DragDropManager.prototype.handleRefCountChange = function handleRefCountChange() {
      var shouldSetUp = this.store.getState().refCount > 0;
      if (shouldSetUp && !this.isSetUp) {
        this.backend.setup();
        this.isSetUp = true;
      } else if (!shouldSetUp && this.isSetUp) {
        this.backend.teardown();
        this.isSetUp = false;
      }
    };
    DragDropManager.prototype.getMonitor = function getMonitor() {
      return this.monitor;
    };
    DragDropManager.prototype.getBackend = function getBackend() {
      return this.backend;
    };
    DragDropManager.prototype.getRegistry = function getRegistry() {
      return this.registry;
    };
    DragDropManager.prototype.getActions = function getActions() {
      var manager = this;
      var dispatch = this.store.dispatch;
      function bindActionCreator(actionCreator) {
        return function() {
          var action = actionCreator.apply(manager, arguments);
          if (typeof action !== 'undefined') {
            dispatch(action);
          }
        };
      }
      return Object.keys(dragDropActions).filter(function(key) {
        return typeof dragDropActions[key] === 'function';
      }).reduce(function(boundActions, key) {
        boundActions[key] = bindActionCreator(dragDropActions[key]);
        return boundActions;
      }, {});
    };
    return DragDropManager;
  })();
  exports['default'] = DragDropManager;
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOMTextComponent", ["npm:react@0.14.0/lib/DOMChildrenOperations", "npm:react@0.14.0/lib/DOMPropertyOperations", "npm:react@0.14.0/lib/ReactComponentBrowserEnvironment", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/escapeTextContentForBrowser", "npm:react@0.14.0/lib/setTextContent", "npm:react@0.14.0/lib/validateDOMNesting", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var DOMChildrenOperations = require("npm:react@0.14.0/lib/DOMChildrenOperations");
    var DOMPropertyOperations = require("npm:react@0.14.0/lib/DOMPropertyOperations");
    var ReactComponentBrowserEnvironment = require("npm:react@0.14.0/lib/ReactComponentBrowserEnvironment");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var assign = require("npm:react@0.14.0/lib/Object.assign");
    var escapeTextContentForBrowser = require("npm:react@0.14.0/lib/escapeTextContentForBrowser");
    var setTextContent = require("npm:react@0.14.0/lib/setTextContent");
    var validateDOMNesting = require("npm:react@0.14.0/lib/validateDOMNesting");
    var ReactDOMTextComponent = function(props) {};
    assign(ReactDOMTextComponent.prototype, {
      construct: function(text) {
        this._currentElement = text;
        this._stringText = '' + text;
        this._rootNodeID = null;
        this._mountIndex = 0;
      },
      mountComponent: function(rootID, transaction, context) {
        if (process.env.NODE_ENV !== 'production') {
          if (context[validateDOMNesting.ancestorInfoContextKey]) {
            validateDOMNesting('span', null, context[validateDOMNesting.ancestorInfoContextKey]);
          }
        }
        this._rootNodeID = rootID;
        if (transaction.useCreateElement) {
          var ownerDocument = context[ReactMount.ownerDocumentContextKey];
          var el = ownerDocument.createElement('span');
          DOMPropertyOperations.setAttributeForID(el, rootID);
          ReactMount.getID(el);
          setTextContent(el, this._stringText);
          return el;
        } else {
          var escapedText = escapeTextContentForBrowser(this._stringText);
          if (transaction.renderToStaticMarkup) {
            return escapedText;
          }
          return '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' + escapedText + '</span>';
        }
      },
      receiveComponent: function(nextText, transaction) {
        if (nextText !== this._currentElement) {
          this._currentElement = nextText;
          var nextStringText = '' + nextText;
          if (nextStringText !== this._stringText) {
            this._stringText = nextStringText;
            var node = ReactMount.getNode(this._rootNodeID);
            DOMChildrenOperations.updateTextContent(node, nextStringText);
          }
        }
      },
      unmountComponent: function() {
        ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
      }
    });
    module.exports = ReactDOMTextComponent;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1/lib/index", ["npm:dnd-core@1.2.1/lib/DragDropManager", "npm:dnd-core@1.2.1/lib/DragSource", "npm:dnd-core@1.2.1/lib/DropTarget", "npm:dnd-core@1.2.1/lib/backends/createTestBackend"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  function _interopRequire(obj) {
    return obj && obj.__esModule ? obj['default'] : obj;
  }
  var _DragDropManager = require("npm:dnd-core@1.2.1/lib/DragDropManager");
  exports.DragDropManager = _interopRequire(_DragDropManager);
  var _DragSource = require("npm:dnd-core@1.2.1/lib/DragSource");
  exports.DragSource = _interopRequire(_DragSource);
  var _DropTarget = require("npm:dnd-core@1.2.1/lib/DropTarget");
  exports.DropTarget = _interopRequire(_DropTarget);
  var _backendsCreateTestBackend = require("npm:dnd-core@1.2.1/lib/backends/createTestBackend");
  exports.createTestBackend = _interopRequire(_backendsCreateTestBackend);
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/ReactDOM", ["npm:react@0.14.0/lib/ReactCurrentOwner", "npm:react@0.14.0/lib/ReactDOMTextComponent", "npm:react@0.14.0/lib/ReactDefaultInjection", "npm:react@0.14.0/lib/ReactInstanceHandles", "npm:react@0.14.0/lib/ReactMount", "npm:react@0.14.0/lib/ReactPerf", "npm:react@0.14.0/lib/ReactReconciler", "npm:react@0.14.0/lib/ReactUpdates", "npm:react@0.14.0/lib/ReactVersion", "npm:react@0.14.0/lib/findDOMNode", "npm:react@0.14.0/lib/renderSubtreeIntoContainer", "npm:fbjs@0.3.1/lib/warning", "npm:fbjs@0.3.1/lib/ExecutionEnvironment", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var ReactCurrentOwner = require("npm:react@0.14.0/lib/ReactCurrentOwner");
    var ReactDOMTextComponent = require("npm:react@0.14.0/lib/ReactDOMTextComponent");
    var ReactDefaultInjection = require("npm:react@0.14.0/lib/ReactDefaultInjection");
    var ReactInstanceHandles = require("npm:react@0.14.0/lib/ReactInstanceHandles");
    var ReactMount = require("npm:react@0.14.0/lib/ReactMount");
    var ReactPerf = require("npm:react@0.14.0/lib/ReactPerf");
    var ReactReconciler = require("npm:react@0.14.0/lib/ReactReconciler");
    var ReactUpdates = require("npm:react@0.14.0/lib/ReactUpdates");
    var ReactVersion = require("npm:react@0.14.0/lib/ReactVersion");
    var findDOMNode = require("npm:react@0.14.0/lib/findDOMNode");
    var renderSubtreeIntoContainer = require("npm:react@0.14.0/lib/renderSubtreeIntoContainer");
    var warning = require("npm:fbjs@0.3.1/lib/warning");
    ReactDefaultInjection.inject();
    var render = ReactPerf.measure('React', 'render', ReactMount.render);
    var React = {
      findDOMNode: findDOMNode,
      render: render,
      unmountComponentAtNode: ReactMount.unmountComponentAtNode,
      version: ReactVersion,
      unstable_batchedUpdates: ReactUpdates.batchedUpdates,
      unstable_renderSubtreeIntoContainer: renderSubtreeIntoContainer
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function') {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
        CurrentOwner: ReactCurrentOwner,
        InstanceHandles: ReactInstanceHandles,
        Mount: ReactMount,
        Reconciler: ReactReconciler,
        TextComponent: ReactDOMTextComponent
      });
    }
    if (process.env.NODE_ENV !== 'production') {
      var ExecutionEnvironment = require("npm:fbjs@0.3.1/lib/ExecutionEnvironment");
      if (ExecutionEnvironment.canUseDOM && window.top === window.self) {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
          if (navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Edge') === -1 || navigator.userAgent.indexOf('Firefox') > -1) {
            console.debug('Download the React DevTools for a better development experience: ' + 'https://fb.me/react-devtools');
          }
        }
        var ieCompatibilityMode = document.documentMode && document.documentMode < 8;
        process.env.NODE_ENV !== 'production' ? warning(!ieCompatibilityMode, 'Internet Explorer is running in compatibility mode; please add the ' + 'following tag to your HTML to prevent this from happening: ' + '<meta http-equiv="X-UA-Compatible" content="IE=edge" />') : undefined;
        var expectedFeatures = [Array.isArray, Array.prototype.every, Array.prototype.forEach, Array.prototype.indexOf, Array.prototype.map, Date.now, Function.prototype.bind, Object.keys, String.prototype.split, String.prototype.trim, Object.create, Object.freeze];
        for (var i = 0; i < expectedFeatures.length; i++) {
          if (!expectedFeatures[i]) {
            console.error('One or more ES5 shim/shams expected by React are not available: ' + 'https://fb.me/react-warning-polyfills');
            break;
          }
        }
      }
    }
    module.exports = React;
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:dnd-core@1.2.1", ["npm:dnd-core@1.2.1/lib/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:dnd-core@1.2.1/lib/index");
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/lib/React", ["npm:react@0.14.0/lib/ReactDOM", "npm:react@0.14.0/lib/ReactDOMServer", "npm:react@0.14.0/lib/ReactIsomorphic", "npm:react@0.14.0/lib/Object.assign", "npm:react@0.14.0/lib/deprecated"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var ReactDOM = require("npm:react@0.14.0/lib/ReactDOM");
  var ReactDOMServer = require("npm:react@0.14.0/lib/ReactDOMServer");
  var ReactIsomorphic = require("npm:react@0.14.0/lib/ReactIsomorphic");
  var assign = require("npm:react@0.14.0/lib/Object.assign");
  var deprecated = require("npm:react@0.14.0/lib/deprecated");
  var React = {};
  assign(React, ReactIsomorphic);
  assign(React, {
    findDOMNode: deprecated('findDOMNode', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.findDOMNode),
    render: deprecated('render', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.render),
    unmountComponentAtNode: deprecated('unmountComponentAtNode', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.unmountComponentAtNode),
    renderToString: deprecated('renderToString', 'ReactDOMServer', 'react-dom/server', ReactDOMServer, ReactDOMServer.renderToString),
    renderToStaticMarkup: deprecated('renderToStaticMarkup', 'ReactDOMServer', 'react-dom/server', ReactDOMServer, ReactDOMServer.renderToStaticMarkup)
  });
  React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactDOM;
  module.exports = React;
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/DragDropContext", ["npm:react@0.14.0", "npm:dnd-core@1.2.1", "npm:invariant@2.1.1", "npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  exports.__esModule = true;
  var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  var _slice = Array.prototype.slice;
  var _createClass = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ('value' in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports['default'] = DragDropContext;
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
  var _react = require("npm:react@0.14.0");
  var _react2 = _interopRequireDefault(_react);
  var _dndCore = require("npm:dnd-core@1.2.1");
  var _invariant = require("npm:invariant@2.1.1");
  var _invariant2 = _interopRequireDefault(_invariant);
  var _utilsCheckDecoratorArguments = require("npm:react-dnd@1.1.8/modules/utils/checkDecoratorArguments");
  var _utilsCheckDecoratorArguments2 = _interopRequireDefault(_utilsCheckDecoratorArguments);
  function DragDropContext(backend) {
    _utilsCheckDecoratorArguments2['default'].apply(undefined, ['DragDropContext', 'backend'].concat(_slice.call(arguments)));
    if (typeof backend === 'object' && typeof backend['default'] === 'function') {
      backend = backend['default'];
    }
    _invariant2['default'](typeof backend === 'function', 'Expected the backend to be a function or an ES6 module exporting a default function. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-drag-drop-context.html');
    var childContext = {dragDropManager: new _dndCore.DragDropManager(backend)};
    return function decorateContext(DecoratedComponent) {
      var displayName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';
      return (function(_Component) {
        _inherits(DragDropContextContainer, _Component);
        function DragDropContextContainer() {
          _classCallCheck(this, DragDropContextContainer);
          _Component.apply(this, arguments);
        }
        DragDropContextContainer.prototype.getDecoratedComponentInstance = function getDecoratedComponentInstance() {
          return this.refs.child;
        };
        DragDropContextContainer.prototype.getManager = function getManager() {
          return childContext.dragDropManager;
        };
        DragDropContextContainer.prototype.getChildContext = function getChildContext() {
          return childContext;
        };
        DragDropContextContainer.prototype.render = function render() {
          return _react2['default'].createElement(DecoratedComponent, _extends({}, this.props, {ref: 'child'}));
        };
        _createClass(DragDropContextContainer, null, [{
          key: 'DecoratedComponent',
          value: DecoratedComponent,
          enumerable: true
        }, {
          key: 'displayName',
          value: 'DragDropContext(' + displayName + ')',
          enumerable: true
        }, {
          key: 'childContextTypes',
          value: {dragDropManager: _react.PropTypes.object.isRequired},
          enumerable: true
        }]);
        return DragDropContextContainer;
      })(_react.Component);
    };
  }
  module.exports = exports['default'];
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0/react", ["npm:react@0.14.0/lib/React"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  'use strict';
  module.exports = require("npm:react@0.14.0/lib/React");
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8/modules/index", ["npm:react-dnd@1.1.8/modules/DragDropContext", "npm:react-dnd@1.1.8/modules/DragLayer", "npm:react-dnd@1.1.8/modules/DragSource", "npm:react-dnd@1.1.8/modules/DropTarget", "github:jspm/nodelibs-process@0.1.2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    exports.__esModule = true;
    function _interopRequire(obj) {
      return obj && obj.__esModule ? obj['default'] : obj;
    }
    var _DragDropContext = require("npm:react-dnd@1.1.8/modules/DragDropContext");
    exports.DragDropContext = _interopRequire(_DragDropContext);
    var _DragLayer = require("npm:react-dnd@1.1.8/modules/DragLayer");
    exports.DragLayer = _interopRequire(_DragLayer);
    var _DragSource = require("npm:react-dnd@1.1.8/modules/DragSource");
    exports.DragSource = _interopRequire(_DragSource);
    var _DropTarget = require("npm:react-dnd@1.1.8/modules/DropTarget");
    exports.DropTarget = _interopRequire(_DropTarget);
    if (process.env.NODE_ENV !== 'production') {
      Object.defineProperty(exports, 'default', {get: function get() {
          console.error('React DnD does not provide a default export. ' + 'You are probably missing the curly braces in the import statement. ' + 'Read more: http://gaearon.github.io/react-dnd/docs-troubleshooting.html#react-dnd-does-not-provide-a-default-export');
        }});
    }
  })(require("github:jspm/nodelibs-process@0.1.2"));
  global.define = __define;
  return module.exports;
});

System.register("npm:react@0.14.0", ["npm:react@0.14.0/react"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:react@0.14.0/react");
  global.define = __define;
  return module.exports;
});

System.register("npm:react-dnd@1.1.8", ["npm:react-dnd@1.1.8/modules/index"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:react-dnd@1.1.8/modules/index");
  global.define = __define;
  return module.exports;
});

System.register('src/app/boat-lineup-planner/constants/attendeePositions', [], function (_export) {
	'use strict';

	return {
		setters: [],
		execute: function () {
			_export('default', {
				ROWER: 'rower',
				COXSWAIN: 'coxswain'
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/components/BoatSeat', ['npm:babel-runtime@5.8.25/helpers/get', 'npm:babel-runtime@5.8.25/helpers/inherits', 'npm:babel-runtime@5.8.25/helpers/create-class', 'npm:babel-runtime@5.8.25/helpers/class-call-check', 'npm:react@0.14.0', 'npm:react-dnd@1.1.8', 'src/app/boat-lineup-planner/components/Attendee', 'src/app/boat-lineup-planner/constants/dndTypes'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, DropTarget, Attendee, dndTypes, spec, collect, _default;

	return {
		setters: [function (_npmBabelRuntime5825HelpersGet) {
			_get = _npmBabelRuntime5825HelpersGet['default'];
		}, function (_npmBabelRuntime5825HelpersInherits) {
			_inherits = _npmBabelRuntime5825HelpersInherits['default'];
		}, function (_npmBabelRuntime5825HelpersCreateClass) {
			_createClass = _npmBabelRuntime5825HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5825HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5825HelpersClassCallCheck['default'];
		}, function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_npmReactDnd118) {
			DropTarget = _npmReactDnd118.DropTarget;
		}, function (_srcAppBoatLineupPlannerComponentsAttendee) {
			Attendee = _srcAppBoatLineupPlannerComponentsAttendee['default'];
		}, function (_srcAppBoatLineupPlannerConstantsDndTypes) {
			dndTypes = _srcAppBoatLineupPlannerConstantsDndTypes['default'];
		}],
		execute: function () {
			'use strict';

			spec = {
				drop: function drop(props, monitor) {
					var _monitor$getItem = monitor.getItem();

					var attendeeId = _monitor$getItem.attendeeId;
					var onAssignAttendee = props.onAssignAttendee;
					var boatKey = props.boatKey;
					var seatPosition = props.seatPosition;

					onAssignAttendee(attendeeId, boatKey, seatPosition);
				},
				canDrop: function canDrop(props) {
					return !props.teamMember;
				}
			};

			collect = function collect(connect, monitor) {
				return {
					connectDropTarget: connect.dropTarget()
				};
			};

			_default = (function (_React$Component) {
				_inherits(_default, _React$Component);

				function _default() {
					_classCallCheck(this, _default2);

					_get(Object.getPrototypeOf(_default2.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(_default, [{
					key: 'render',
					value: function render() {
						var _props = this.props;
						var teamMember = _props.teamMember;
						var connectDropTarget = _props.connectDropTarget;

						var content = teamMember && React.createElement(Attendee, { teamMember: teamMember });

						return connectDropTarget(React.createElement(
							'div',
							{ className: 'boat-seat' },
							content
						));
					}
				}]);

				var _default2 = _default;
				_default = DropTarget(dndTypes.ATTENDEE, spec, collect)(_default) || _default;
				return _default;
			})(React.Component);

			_export('default', _default);
		}
	};
});
System.register('src/app/boat-lineup-planner/actions/actionTypes', [], function (_export) {
	'use strict';

	return {
		setters: [],
		execute: function () {
			_export('default', {
				ASSIGN_ATTENDEE: 'assign_attendee',
				UNASSIGN_ATTENDEE: 'unassign_attendee',
				MOVE_ATTENDEE: 'move_attendee'
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/createBoatSeats', ['npm:immutable@3.7.5'], function (_export) {
	'use strict';

	var Immutable;
	return {
		setters: [function (_npmImmutable375) {
			Immutable = _npmImmutable375['default'];
		}],
		execute: function () {
			_export('default', function (boatType) {
				var seats = {};

				if (boatType.get('coxswain')) {
					seats.coxswain = null;
				}

				for (var i = 1; i <= boatType.get('rowers'); i++) {
					seats[String(i)] = null;
				}

				return Immutable.fromJS(seats);
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/constants/emptyAttendeePlacement', ['npm:immutable@3.7.5'], function (_export) {
	'use strict';

	var Immutable;
	return {
		setters: [function (_npmImmutable375) {
			Immutable = _npmImmutable375['default'];
		}],
		execute: function () {
			_export('default', Immutable.fromJS({
				boatKey: '',
				seat: ''
			}));
		}
	};
});
System.register('src/app/boat-lineup-planner/constants/boatTypes', [], function (_export) {
	'use strict';

	return {
		setters: [],
		execute: function () {
			_export('default', {
				SINGLE: {
					rowers: 1,
					coxswain: false,
					shortTitle: '1x',
					longTitle: 'single'
				},
				DOUBLE: {
					rowers: 2,
					coxswain: false,
					shortTitle: '2x',
					longTitle: 'double'
				},
				QUAD: {
					rowers: 4,
					coxswain: false,
					shortTitle: '4x',
					longTitle: 'quad'
				},
				FOUR: {
					rowers: 4,
					coxswain: true,
					shortTitle: '4+',
					longTitle: 'four'
				},
				EIGHT: {
					rowers: 8,
					coxswain: true,
					shortTitle: '8+',
					longTitle: 'eight'
				}
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/components/Boat', ['npm:babel-runtime@5.8.25/helpers/get', 'npm:babel-runtime@5.8.25/helpers/inherits', 'npm:babel-runtime@5.8.25/helpers/create-class', 'npm:babel-runtime@5.8.25/helpers/class-call-check', 'npm:react@0.14.0', 'src/app/boat-lineup-planner/components/BoatSeat'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, BoatSeat, _default;

	return {
		setters: [function (_npmBabelRuntime5825HelpersGet) {
			_get = _npmBabelRuntime5825HelpersGet['default'];
		}, function (_npmBabelRuntime5825HelpersInherits) {
			_inherits = _npmBabelRuntime5825HelpersInherits['default'];
		}, function (_npmBabelRuntime5825HelpersCreateClass) {
			_createClass = _npmBabelRuntime5825HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5825HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5825HelpersClassCallCheck['default'];
		}, function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_srcAppBoatLineupPlannerComponentsBoatSeat) {
			BoatSeat = _srcAppBoatLineupPlannerComponentsBoatSeat['default'];
		}],
		execute: function () {
			'use strict';

			_default = (function (_React$Component) {
				_inherits(_default, _React$Component);

				function _default() {
					_classCallCheck(this, _default);

					_get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(_default, [{
					key: 'render',
					value: function render() {
						var _props = this.props;
						var boat = _props.boat;
						var boatKey = _props.boatKey;
						var onAssignAttendee = _props.onAssignAttendee;

						return React.createElement(
							'div',
							{ className: 'boat' },
							React.createElement(
								'div',
								null,
								React.createElement(
									'div',
									null,
									boat.get('title')
								),
								React.createElement(
									'div',
									null,
									boat.get('seats').map(function (teamMember, seatPosition) {
										return React.createElement(BoatSeat, { key: seatPosition,
											seatPosition: seatPosition,
											teamMember: teamMember,
											boatKey: boatKey,
											onAssignAttendee: onAssignAttendee });
									})
								)
							)
						);
					}
				}]);

				return _default;
			})(React.Component);

			_export('default', _default);
		}
	};
});
System.register('src/app/boat-lineup-planner/actions/bindAttendeeActionCreators', ['src/app/boat-lineup-planner/actions/actionTypes'], function (_export) {
	'use strict';

	var actionTypes;
	return {
		setters: [function (_srcAppBoatLineupPlannerActionsActionTypes) {
			actionTypes = _srcAppBoatLineupPlannerActionsActionTypes['default'];
		}],
		execute: function () {
			_export('default', function (dispatch) {
				return {
					onAssignAttendee: function onAssignAttendee(attendeeId, boatKey, seatPosition) {
						return dispatch({
							type: actionTypes.ASSIGN_ATTENDEE,
							attendeeId: attendeeId,
							boatKey: boatKey,
							seatPosition: seatPosition
						});
					},
					onUnassignAttendee: function onUnassignAttendee(attendeeId) {
						return dispatch({
							type: actionTypes.UNASSIGN_ATTENDEE,
							attendeeId: attendeeId
						});
					}
				};
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/stateConnector', ['src/app/boat-lineup-planner/createBoatSeats', 'src/app/boat-lineup-planner/constants/emptyAttendeePlacement'], function (_export) {
	'use strict';

	var createBoatSeats, emptyAttendeePlacement;
	return {
		setters: [function (_srcAppBoatLineupPlannerCreateBoatSeats) {
			createBoatSeats = _srcAppBoatLineupPlannerCreateBoatSeats['default'];
		}, function (_srcAppBoatLineupPlannerConstantsEmptyAttendeePlacement) {
			emptyAttendeePlacement = _srcAppBoatLineupPlannerConstantsEmptyAttendeePlacement['default'];
		}],
		execute: function () {
			_export('default', function (state) {
				return {
					unassignedAttendees: state.get('attendees').filter(function (attendee) {
						return attendee.get('placement').equals(emptyAttendeePlacement);
					}).map(function (attendee) {
						return attendee.get('teamMember');
					}),
					boats: state.get('boats').map(function (boat, boatKey) {
						var attendees = state.get('attendees').filter(function (attendee) {
							return attendee.getIn(['placement', 'boatKey']) === boatKey;
						});

						var boatSeats = createBoatSeats(boat.get('type')).map(function (seat, seatPosition) {
							var seatAttendee = attendees.find(function (attendee) {
								return attendee.getIn(['placement', 'seat']) === seatPosition;
							});

							if (seatAttendee) {
								return seatAttendee.get('teamMember');
							}

							return null;
						});

						return boat.set('seats', boatSeats);
					})
				};
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/fakeInitialState', ['npm:immutable@3.7.5', 'src/app/boat-lineup-planner/constants/boatTypes', 'src/app/boat-lineup-planner/constants/attendeePositions', 'src/app/boat-lineup-planner/constants/emptyAttendeePlacement'], function (_export) {
	'use strict';

	var Immutable, boatTypes, attendeePositions, emptyAttendeePlacement;
	return {
		setters: [function (_npmImmutable375) {
			Immutable = _npmImmutable375['default'];
		}, function (_srcAppBoatLineupPlannerConstantsBoatTypes) {
			boatTypes = _srcAppBoatLineupPlannerConstantsBoatTypes['default'];
		}, function (_srcAppBoatLineupPlannerConstantsAttendeePositions) {
			attendeePositions = _srcAppBoatLineupPlannerConstantsAttendeePositions['default'];
		}, function (_srcAppBoatLineupPlannerConstantsEmptyAttendeePlacement) {
			emptyAttendeePlacement = _srcAppBoatLineupPlannerConstantsEmptyAttendeePlacement['default'];
		}],
		execute: function () {
			_export('default', Immutable.fromJS({
				attendees: {
					'TeamMembers/103': {
						teamMember: {
							id: 'TeamMembers/103',
							sortName: 'Yealsalot, George',
							displayName: 'George Yealsalot',
							position: attendeePositions.COXSWAIN
						},
						placement: emptyAttendeePlacement
					},
					'TeamMembers/77': {
						teamMember: {
							id: 'TeamMembers/77',
							sortName: 'Earges, Jimmy',
							displayName: 'Jimmy Earges',
							position: attendeePositions.ROWER
						},
						placement: emptyAttendeePlacement
					},
					'TeamMembers/31': {
						teamMember: {
							id: 'TeamMembers/31',
							sortName: 'Crabbs, Bill',
							displayName: 'Bill Crabbs',
							position: attendeePositions.ROWER
						},
						placement: emptyAttendeePlacement
					},
					'TeamMembers/6': {
						teamMember: {
							id: 'TeamMembers/6',
							sortName: 'Whaker, Brig',
							displayName: 'Brig Whaker',
							position: attendeePositions.COXSWAIN
						},
						placement: emptyAttendeePlacement
					},
					'TeamMembers/17': {
						teamMember: {
							id: 'TeamMembers/17',
							sortName: 'Passem, Henry',
							displayName: 'Henry Passem',
							position: attendeePositions.ROWER
						},
						placement: {
							boatKey: 'boat-1',
							seat: 'coxswain'
						}
					},
					'TeamMembers/54': {
						teamMember: {
							id: 'TeamMembers/54',
							sortName: 'Rowerson, Mickey',
							displayName: 'Mickey Rowerson',
							position: attendeePositions.ROWER
						},
						placement: {
							boatKey: 'boat-1',
							seat: '2'
						}
					}
				},
				boats: {
					'boat-1': {
						title: 'M2',
						type: boatTypes.FOUR
					},
					'boat-2': {
						title: 'Jaws',
						type: boatTypes.DOUBLE
					}
				}
			}));
		}
	};
});
System.register('src/app/boat-lineup-planner/components/Attendee', ['npm:babel-runtime@5.8.25/helpers/get', 'npm:babel-runtime@5.8.25/helpers/inherits', 'npm:babel-runtime@5.8.25/helpers/create-class', 'npm:babel-runtime@5.8.25/helpers/class-call-check', 'npm:react@0.14.0', 'src/app/boat-lineup-planner/constants/dndTypes', 'npm:react-dnd@1.1.8', 'npm:classnames@2.1.5', 'src/app/boat-lineup-planner/constants/attendeePositions'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, dndTypes, DragSource, classNames, attendeePositions, spec, collect, _default;

	return {
		setters: [function (_npmBabelRuntime5825HelpersGet) {
			_get = _npmBabelRuntime5825HelpersGet['default'];
		}, function (_npmBabelRuntime5825HelpersInherits) {
			_inherits = _npmBabelRuntime5825HelpersInherits['default'];
		}, function (_npmBabelRuntime5825HelpersCreateClass) {
			_createClass = _npmBabelRuntime5825HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5825HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5825HelpersClassCallCheck['default'];
		}, function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_srcAppBoatLineupPlannerConstantsDndTypes) {
			dndTypes = _srcAppBoatLineupPlannerConstantsDndTypes['default'];
		}, function (_npmReactDnd118) {
			DragSource = _npmReactDnd118.DragSource;
		}, function (_npmClassnames215) {
			classNames = _npmClassnames215['default'];
		}, function (_srcAppBoatLineupPlannerConstantsAttendeePositions) {
			attendeePositions = _srcAppBoatLineupPlannerConstantsAttendeePositions['default'];
		}],
		execute: function () {
			'use strict';

			spec = {
				beginDrag: function beginDrag(props) {
					return {
						attendeeId: props.teamMember.get('id')
					};
				}
			};

			collect = function collect(connect, monitor) {
				return {
					connectDragSource: connect.dragSource()
				};
			};

			_default = (function (_React$Component) {
				_inherits(_default, _React$Component);

				function _default() {
					_classCallCheck(this, _default2);

					_get(Object.getPrototypeOf(_default2.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(_default, [{
					key: 'render',
					value: function render() {
						var _props = this.props;
						var teamMember = _props.teamMember;
						var connectDragSource = _props.connectDragSource;

						var classes = classNames('attendee', {
							'rower': teamMember.get('position') == attendeePositions.ROWER,
							'coxswain': teamMember.get('position') == attendeePositions.COXSWAIN
						});

						return connectDragSource(React.createElement(
							'div',
							{ className: classes },
							teamMember.get('displayName')
						));
					}
				}]);

				var _default2 = _default;
				_default = DragSource(dndTypes.ATTENDEE, spec, collect)(_default) || _default;
				return _default;
			})(React.Component);

			_export('default', _default);
		}
	};
});
System.register('src/app/boat-lineup-planner/components/BoatList', ['npm:babel-runtime@5.8.25/helpers/get', 'npm:babel-runtime@5.8.25/helpers/inherits', 'npm:babel-runtime@5.8.25/helpers/create-class', 'npm:babel-runtime@5.8.25/helpers/class-call-check', 'npm:react@0.14.0', 'src/app/boat-lineup-planner/components/Boat'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Boat, _default;

	return {
		setters: [function (_npmBabelRuntime5825HelpersGet) {
			_get = _npmBabelRuntime5825HelpersGet['default'];
		}, function (_npmBabelRuntime5825HelpersInherits) {
			_inherits = _npmBabelRuntime5825HelpersInherits['default'];
		}, function (_npmBabelRuntime5825HelpersCreateClass) {
			_createClass = _npmBabelRuntime5825HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5825HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5825HelpersClassCallCheck['default'];
		}, function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_srcAppBoatLineupPlannerComponentsBoat) {
			Boat = _srcAppBoatLineupPlannerComponentsBoat['default'];
		}],
		execute: function () {
			'use strict';

			_default = (function (_React$Component) {
				_inherits(_default, _React$Component);

				function _default() {
					_classCallCheck(this, _default);

					_get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(_default, [{
					key: 'render',
					value: function render() {
						var _props = this.props;
						var boats = _props.boats;
						var boatKey = _props.boatKey;
						var onAssignAttendee = _props.onAssignAttendee;
						var onMoveAttendee = _props.onMoveAttendee;

						return React.createElement(
							'div',
							{ className: 'boat-list' },
							boats.map(function (boat, boatKey) {
								return React.createElement(Boat, { key: boatKey,
									boat: boat,
									boatKey: boatKey,
									onAssignAttendee: onAssignAttendee,
									onMoveAttendee: onMoveAttendee });
							})
						);
					}
				}]);

				return _default;
			})(React.Component);

			_export('default', _default);
		}
	};
});
System.register('src/app/boat-lineup-planner/actions/attendeeReducers', ['src/app/boat-lineup-planner/actions/actionTypes', 'src/app/boat-lineup-planner/fakeInitialState', 'src/app/boat-lineup-planner/constants/emptyAttendeePlacement'], function (_export) {
	'use strict';

	var actionTypes, fakeInitialState, emptyAttendeePlacement;
	return {
		setters: [function (_srcAppBoatLineupPlannerActionsActionTypes) {
			actionTypes = _srcAppBoatLineupPlannerActionsActionTypes['default'];
		}, function (_srcAppBoatLineupPlannerFakeInitialState) {
			fakeInitialState = _srcAppBoatLineupPlannerFakeInitialState['default'];
		}, function (_srcAppBoatLineupPlannerConstantsEmptyAttendeePlacement) {
			emptyAttendeePlacement = _srcAppBoatLineupPlannerConstantsEmptyAttendeePlacement['default'];
		}],
		execute: function () {
			_export('default', function (state, action) {
				if (state === undefined) state = fakeInitialState;

				switch (action.type) {
					case actionTypes.UNASSIGN_ATTENDEE:
						return state.setIn(['attendees', action.attendeeId, 'placement'], emptyAttendeePlacement);
					case actionTypes.ASSIGN_ATTENDEE:
						return state.setIn(['attendees', action.attendeeId, 'placement', 'boatKey'], action.boatKey).setIn(['attendees', action.attendeeId, 'placement', 'seat'], action.seatPosition);
					default:
						return state;
				}
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/constants/dndTypes', ['npm:babel-runtime@5.8.25/core-js/symbol'], function (_export) {
	var _Symbol;

	return {
		setters: [function (_npmBabelRuntime5825CoreJsSymbol) {
			_Symbol = _npmBabelRuntime5825CoreJsSymbol['default'];
		}],
		execute: function () {
			'use strict';

			_export('default', {
				ATTENDEE: _Symbol('attendee')
			});
		}
	};
});
System.register('src/app/boat-lineup-planner/components/UnassignedAttendeeList', ['npm:babel-runtime@5.8.25/helpers/get', 'npm:babel-runtime@5.8.25/helpers/inherits', 'npm:babel-runtime@5.8.25/helpers/create-class', 'npm:babel-runtime@5.8.25/helpers/class-call-check', 'npm:react@0.14.0', 'npm:react-dnd@1.1.8', 'src/app/boat-lineup-planner/constants/dndTypes', 'src/app/boat-lineup-planner/components/Attendee'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, DropTarget, dndTypes, Attendee, spec, collect, _default;

	return {
		setters: [function (_npmBabelRuntime5825HelpersGet) {
			_get = _npmBabelRuntime5825HelpersGet['default'];
		}, function (_npmBabelRuntime5825HelpersInherits) {
			_inherits = _npmBabelRuntime5825HelpersInherits['default'];
		}, function (_npmBabelRuntime5825HelpersCreateClass) {
			_createClass = _npmBabelRuntime5825HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5825HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5825HelpersClassCallCheck['default'];
		}, function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_npmReactDnd118) {
			DropTarget = _npmReactDnd118.DropTarget;
		}, function (_srcAppBoatLineupPlannerConstantsDndTypes) {
			dndTypes = _srcAppBoatLineupPlannerConstantsDndTypes['default'];
		}, function (_srcAppBoatLineupPlannerComponentsAttendee) {
			Attendee = _srcAppBoatLineupPlannerComponentsAttendee['default'];
		}],
		execute: function () {
			'use strict';

			spec = {
				drop: function drop(props, monitor) {
					var _monitor$getItem = monitor.getItem();

					var attendeeId = _monitor$getItem.attendeeId;
					var onUnassignAttendee = props.onUnassignAttendee;

					onUnassignAttendee(attendeeId);
				}
			};

			collect = function collect(connect, monitor) {
				return {
					connectDropTarget: connect.dropTarget()
				};
			};

			_default = (function (_React$Component) {
				_inherits(_default, _React$Component);

				function _default() {
					_classCallCheck(this, _default2);

					_get(Object.getPrototypeOf(_default2.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(_default, [{
					key: 'render',
					value: function render() {
						var _props = this.props;
						var unassignedAttendees = _props.unassignedAttendees;
						var connectDropTarget = _props.connectDropTarget;

						return connectDropTarget(React.createElement(
							'div',
							{ className: 'unassigned-attendee-list' },
							unassignedAttendees.map(function (teamMember) {
								return React.createElement(Attendee, { teamMember: teamMember, key: teamMember.id });
							})
						));
					}
				}]);

				var _default2 = _default;
				_default = DropTarget(dndTypes.ATTENDEE, spec, collect)(_default) || _default;
				return _default;
			})(React.Component);

			_export('default', _default);
		}
	};
});
System.register('src/app/boat-lineup-planner/App', ['npm:babel-runtime@5.8.25/helpers/get', 'npm:babel-runtime@5.8.25/helpers/inherits', 'npm:babel-runtime@5.8.25/helpers/create-class', 'npm:babel-runtime@5.8.25/helpers/class-call-check', 'npm:react@0.14.0', 'npm:react-dnd@1.1.8', 'npm:immutable@3.7.5', 'src/app/boat-lineup-planner/components/UnassignedAttendeeList', 'src/app/boat-lineup-planner/components/BoatList', 'npm:react-dnd@1.1.8/modules/backends/HTML5', 'npm:react-redux@3.1.0', 'src/app/boat-lineup-planner/actions/bindAttendeeActionCreators', 'src/app/boat-lineup-planner/stateConnector'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, DragDropContext, Immutable, UnassignedAttendeeList, BoatList, HTML5Backend, connect, bindAttendeeActionCreators, stateConnector, App;

	return {
		setters: [function (_npmBabelRuntime5825HelpersGet) {
			_get = _npmBabelRuntime5825HelpersGet['default'];
		}, function (_npmBabelRuntime5825HelpersInherits) {
			_inherits = _npmBabelRuntime5825HelpersInherits['default'];
		}, function (_npmBabelRuntime5825HelpersCreateClass) {
			_createClass = _npmBabelRuntime5825HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5825HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5825HelpersClassCallCheck['default'];
		}, function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_npmReactDnd118) {
			DragDropContext = _npmReactDnd118.DragDropContext;
		}, function (_npmImmutable375) {
			Immutable = _npmImmutable375['default'];
		}, function (_srcAppBoatLineupPlannerComponentsUnassignedAttendeeList) {
			UnassignedAttendeeList = _srcAppBoatLineupPlannerComponentsUnassignedAttendeeList['default'];
		}, function (_srcAppBoatLineupPlannerComponentsBoatList) {
			BoatList = _srcAppBoatLineupPlannerComponentsBoatList['default'];
		}, function (_npmReactDnd118ModulesBackendsHTML5) {
			HTML5Backend = _npmReactDnd118ModulesBackendsHTML5['default'];
		}, function (_npmReactRedux310) {
			connect = _npmReactRedux310.connect;
		}, function (_srcAppBoatLineupPlannerActionsBindAttendeeActionCreators) {
			bindAttendeeActionCreators = _srcAppBoatLineupPlannerActionsBindAttendeeActionCreators['default'];
		}, function (_srcAppBoatLineupPlannerStateConnector) {
			stateConnector = _srcAppBoatLineupPlannerStateConnector['default'];
		}],
		execute: function () {
			'use strict';

			App = (function (_React$Component) {
				_inherits(App, _React$Component);

				function App() {
					_classCallCheck(this, _App);

					_get(Object.getPrototypeOf(_App.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(App, [{
					key: 'render',
					value: function render() {
						var _props = this.props;
						var dispatch = _props.dispatch;
						var unassignedAttendees = _props.unassignedAttendees;
						var boats = _props.boats;
						var onAssignAttendee = _props.onAssignAttendee;
						var onUnassignAttendee = _props.onUnassignAttendee;
						var onMoveAttendee = _props.onMoveAttendee;

						return React.createElement(
							'div',
							{ className: 'boat-lineup-planner' },
							React.createElement(UnassignedAttendeeList, {
								unassignedAttendees: unassignedAttendees,
								onUnassignAttendee: onUnassignAttendee }),
							React.createElement(BoatList, {
								onAssignAttendee: onAssignAttendee,
								onMoveAttendee: onMoveAttendee,
								boats: boats })
						);
					}
				}]);

				var _App = App;
				App = DragDropContext(HTML5Backend)(App) || App;
				return App;
			})(React.Component);

			_export('default', connect(stateConnector, bindAttendeeActionCreators)(App));
		}
	};
});
System.register('src/app/boat-lineup-planner/main', ['npm:react@0.14.0', 'npm:react-dom@0.14.0', 'src/app/boat-lineup-planner/App', 'npm:redux@3.0.2', 'src/app/boat-lineup-planner/actions/attendeeReducers', 'npm:react-redux@3.1.0'], function (_export) {
	'use strict';

	var React, ReactDOM, App, createStore, attendeeReducers, Provider;
	return {
		setters: [function (_npmReact0140) {
			React = _npmReact0140['default'];
		}, function (_npmReactDom0140) {
			ReactDOM = _npmReactDom0140['default'];
		}, function (_srcAppBoatLineupPlannerApp) {
			App = _srcAppBoatLineupPlannerApp['default'];
		}, function (_npmRedux302) {
			createStore = _npmRedux302.createStore;
		}, function (_srcAppBoatLineupPlannerActionsAttendeeReducers) {
			attendeeReducers = _srcAppBoatLineupPlannerActionsAttendeeReducers['default'];
		}, function (_npmReactRedux310) {
			Provider = _npmReactRedux310.Provider;
		}],
		execute: function () {

			ReactDOM.render(React.createElement(
				Provider,
				{ store: createStore(attendeeReducers) },
				React.createElement(App, null)
			), document.getElementById('app'));
		}
	};
});
});
//# sourceMappingURL=main.js.map