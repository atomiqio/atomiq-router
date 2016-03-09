'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Ramda = require('Ramda');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentFile = Symbol('ComponentFile');
var ComponentDirectory = Symbol('ComponentDirectory');
var ComponentParam = Symbol('ComponentParam');
var ComponentIgnored = Symbol('ComponentIgnored');

var DirectoryRouteComponent = function () {
  function DirectoryRouteComponent() {
    _classCallCheck(this, DirectoryRouteComponent);

    var parent = void 0;

    for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
      paths[_key] = arguments[_key];
    }

    if (paths && paths[0] instanceof DirectoryRouteComponent) {
      parent = paths.shift();
    }

    this._parent = parent;
    this._children = [];

    // initialize with file path components
    if (paths && paths.length) {
      this.filepath = _path2.default.join.apply(_path2.default, paths);
    }

    ['name', 'parentName', 'hasChildren', 'isIndex', 'isDirectory', 'isFile', 'isParam', 'isIgnored', 'filepath', 'dirname', 'filename', 'extname', 'basename'].forEach(function (prop) {
      Object.defineProperty(DirectoryRouteComponent.prototype, prop, {
        enumerable: true
      });
    });
  }

  _createClass(DirectoryRouteComponent, [{
    key: 'createResource',
    value: function createResource(app, options) {
      if (!this._module) {
        this._module = require(this.filepath).default;
      }
      return new this._module(app, options);
    }

    // not enumerable so no circular refs when stringifying

  }, {
    key: 'add',
    value: function add(component) {
      if (!component.isIgnored) {
        this._children.push(component);
      }
    }
  }, {
    key: 'inspect',
    value: function inspect() {
      var _this = this;

      var props = {};
      Object.keys(Object.getPrototypeOf(this)).forEach(function (key) {
        props[key] = _this[key];
      });
      props.children = [];
      if (this.hasChildren) {
        this.children.forEach(function (child) {
          props.children.push(child.inspect());
        });
      }
      return props;
    }
  }, {
    key: 'filepath',
    set: function set(filepath) {
      this._filepath = filepath;
      var type = _fs2.default.statSync(filepath);

      if (type.isDirectory()) {
        // check if directory is wrapped in braces {dirname} (convention for indicating a route parameter)
        this._componentType = /^{.*}$/.test(this.basename) ? ComponentParam : ComponentDirectory;
      } else if (type.isFile()) {
        this._componentType = this.extname == '.js' ? ComponentFile : ComponentIgnored;
      } else {
        this._componentType = ComponentIgnored;
      }

      // regardless of type, if it begins with an underscore, this component should be ignored
      if (this.basename.startsWith('_')) {
        this._componentType = ComponentIgnored;
      }

      // object is immutable after initialization - except for children!
      Object.freeze(this);
    },
    get: function get() {
      return this._filepath;
    }
  }, {
    key: 'parent',
    get: function get() {
      return this._parent;
    }
  }, {
    key: 'parentName',
    get: function get() {
      return this.parent ? this.parent.name : '';
    }
  }, {
    key: 'hasChildren',
    get: function get() {
      return Boolean(this.children.length);
    }
  }, {
    key: 'children',
    get: function get() {
      return this._children;
    }
  }, {
    key: 'isIndex',
    get: function get() {
      if (!this.isFile) {
        return false;
      }

      var indexFileNames = ['root', 'index', _path2.default.basename(_path2.default.resolve(this.filepath, '..')).toLowerCase()];
      return (0, _Ramda.contains)(this.name, indexFileNames);
    }

    // when building the route from path components, use `component`, not `name`, because this provides smart substitution
    // route components are always converted to lowercase
    // if you want the original directory basename, use `basename`

  }, {
    key: 'name',
    get: function get() {
      return (this.isParam ? this.basename.replace(/^{(.*)}$/, ':$1') : this.basename).toLowerCase();
    }
  }, {
    key: 'componentType',
    get: function get() {
      return this._componentType;
    }
  }, {
    key: 'isDirectory',
    get: function get() {
      return this._componentType == ComponentDirectory;
    }
  }, {
    key: 'isFile',
    get: function get() {
      return this._componentType == ComponentFile;
    }
  }, {
    key: 'isParam',
    get: function get() {
      return this._componentType == ComponentParam;
    }
  }, {
    key: 'isIgnored',
    get: function get() {
      return this._componentType == ComponentIgnored;
    }
  }, {
    key: 'dirname',
    get: function get() {
      return _path2.default.dirname(this._filepath);
    }
  }, {
    key: 'filename',
    get: function get() {
      return _path2.default.basename(this.filepath);
    }
  }, {
    key: 'basename',
    get: function get() {
      return _path2.default.basename(this.filename, '.js');
    }
  }, {
    key: 'extname',
    get: function get() {
      return _path2.default.extname(this.filepath);
    }
  }]);

  return DirectoryRouteComponent;
}();

exports.default = DirectoryRouteComponent;
//# sourceMappingURL=DirectoryRouteComponent.js.map