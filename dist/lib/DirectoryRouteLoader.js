'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DirectoryRouteComponent = require('./DirectoryRouteComponent');

var _DirectoryRouteComponent2 = _interopRequireDefault(_DirectoryRouteComponent);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _debug2.default)('app:directoryrouter');

var _class = function () {
  function _class(app) {
    _classCallCheck(this, _class);

    this.app = app;
  }

  _createClass(_class, [{
    key: 'join',
    value: function join() {
      for (var _len = arguments.length, routeComponents = Array(_len), _key = 0; _key < _len; _key++) {
        routeComponents[_key] = arguments[_key];
      }

      routeComponents = (0, _ramda.reject)(function (comp) {
        return !comp;
      }, routeComponents);
      var joined = _path2.default.join.apply(_path2.default, _toConsumableArray(routeComponents));
      if (joined.length > 1 && joined.endsWith('/')) {
        joined = joined.substr(0, joined.length - 1);
      }
      return joined;
    }
  }, {
    key: 'loadRouteComponents',
    value: function loadRouteComponents(routesPath, rootComponent) {
      var _this = this;

      if (!rootComponent) {
        rootComponent = new _DirectoryRouteComponent2.default(routesPath);
      }

      var currentRoot = rootComponent;
      var files = _fs2.default.readdirSync(routesPath);

      files.forEach(function (filename) {
        var filepath = _path2.default.join(routesPath, filename);
        var component = new _DirectoryRouteComponent2.default(currentRoot, filepath);
        if (!component.isIgnored) {
          currentRoot.add(component);
          if (component.isDirectory || component.isParam) {
            _this.loadRouteComponents(component.filepath, component);
          }
        }
      });

      return rootComponent;
    }
  }, {
    key: 'load',
    value: function load(routesPath) {
      var _this2 = this;

      var baseRoute = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];
      var baseRouter = arguments.length <= 2 || arguments[2] === undefined ? this.router : arguments[2];

      var rootComponent = this.loadRouteComponents(routesPath, rootComponent);
      log('routes: ' + JSON.stringify(rootComponent.inspect(), null, 2));

      var loadLevel = function loadLevel(component, route, router, param) {
        component.children.forEach(function (comp) {
          if (comp.isFile) {
            var Resource = require(comp.filepath).default;
            var resource = new Resource(_this2.app);
            var compRoute = comp.isIndex ? _this2.join(route, param) : _this2.join(route, param, comp.name);
            router.use(compRoute, resource.router);
          } else if (comp.isDirectory) {
            var subRouter = _this2._express.Router({ mergeParams: true });
            var subRoute = _this2.join(route, comp.name);
            router.use(subRoute, subRouter);
            loadLevel(comp, subRoute, subRouter);
          } else if (comp.isParam) {
            loadLevel(comp, route, router, comp.name);
          }
        });
      };

      loadLevel(rootComponent, baseRoute, baseRouter);
    }
  }, {
    key: '_express',
    get: function get() {
      return this.app.get('express');
    }
  }, {
    key: 'router',
    get: function get() {
      if (!this._router) {
        this._router = this._express.Router();
      }
      return this._router;
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=DirectoryRouteLoader.js.map