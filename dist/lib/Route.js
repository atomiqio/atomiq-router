'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  mergeParams: true
};

// http://expressjs.com/en/4x/api.html#app.METHOD
// verbs in roughly descending priority order (common verbs first)
// TODO: wrap in a set
var verbs = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace', 'checkout', 'connect', 'copy', 'lock', 'merge', 'mkactivity', 'mkcol', 'move', 'm-search', 'notify', 'propfind', 'proppatch', 'purge', 'report', 'search', 'subscribe', 'unlock', 'unsubscribe'];

var _class = function () {
  function _class(app) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, _class);

    this._log = (0, _debug2.default)('app:route:' + this.constructor.name.toLowerCase());
    this._app = app;
    this._options = _ramda2.default.merge(defaultOptions, options);

    this._updateRouter(this);
  }

  _createClass(_class, [{
    key: '_updateRouter',


    /**
     * Update the route instance's router by matching methods
     * named for HTTP verbs and assigning them to the router
     */
    value: function _updateRouter(route) {
      var _this = this;

      /*
      (R.intersection(getMetods(route), verbs)).forEach(routeVerb => {
        route.log(`found route handler for '${routeVerb}' method`);
        route.router[routeVerb]('/', route[routeVerb].bind(route));
      });
      */

      this._getMethods(route).forEach(function (method) {
        var verb = _this._startsWithVerb(method);
        if (verb) {
          var spec = _this._routeify(method);
          if (spec) {
            route.log('found route handler for \'' + spec.verb + '\' method');
            route.router[spec.verb](spec.route, route[method].bind(route));
          }
        }
      });
    }

    /**
     * Get the methods defined on the instance's class
     */

  }, {
    key: '_getMethods',
    value: function _getMethods(instance) {
      var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
      return methods.filter(function (prop) {
        return typeof instance[prop] === 'function';
      });
    }

    /**
     * If methods starts with a recognized verb, return the verb, otherwise undefined
     */

  }, {
    key: '_startsWithVerb',
    value: function _startsWithVerb(method) {
      for (var i = 0; i < verbs.length; i++) {
        if (method.startsWith(verbs[i])) {
          return verbs[i];
        }
      }
    }
  }, {
    key: '_routeify',
    value: function _routeify(method) {
      method = method.replace(/\$/, ':');

      var result = {};
      var parts = method.split('_');

      result.verb = parts.shift();
      result.route = '/' + parts.join('/');

      if (!_ramda2.default.contains(result.verb, verbs)) {
        return;
      }
      return result;
    }
  }, {
    key: 'log',
    get: function get() {
      return this._log;
    }
  }, {
    key: 'app',
    get: function get() {
      return this._app;
    }
  }, {
    key: 'options',
    get: function get() {
      return this._options;
    }
  }, {
    key: 'router',
    get: function get() {
      if (!this._router) {
        this._router = this._express.Router({
          mergeParams: this.options.mergeParams
        });
      }
      return this._router;
    }
  }, {
    key: '_express',
    get: function get() {
      return this.app.get('express');
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=Route.js.map