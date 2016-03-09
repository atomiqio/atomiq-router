import { contains } from 'Ramda';
import fs from 'fs';
import path from 'path';

const ComponentFile = Symbol('ComponentFile');
const ComponentDirectory = Symbol('ComponentDirectory');
const ComponentParam = Symbol('ComponentParam');
const ComponentIgnored = Symbol('ComponentIgnored');

export default class DirectoryRouteComponent {

  constructor(...paths) {
    let parent;
    if (paths && paths[0] instanceof DirectoryRouteComponent) {
      parent = paths.shift();
    }

    this._parent = parent;
    this._children = [];

    // initialize with file path components
    if (paths && paths.length) {
      this.filepath = path.join(...paths);
    }

    [
      'name',
      'parentName',
      'hasChildren',
      'isIndex',
      'isDirectory',
      'isFile',
      'isParam',
      'isIgnored',
      'filepath',
      'dirname',
      'filename',
      'extname',
      'basename'
    ].forEach(prop => {
      Object.defineProperty(DirectoryRouteComponent.prototype, prop, {
        enumerable: true
      });
    });
  }

  set filepath(filepath) {
    this._filepath = filepath;
    let type = fs.statSync(filepath);

    if (type.isDirectory()) {
      // check if directory is wrapped in braces {dirname} (convention for indicating a route parameter)
      this._componentType = /^{.*}$/.test(this.basename)
        ? ComponentParam
        : ComponentDirectory;
    } else if (type.isFile()) {
      this._componentType = this.extname == '.js'
        ? ComponentFile
        : ComponentIgnored;
    } else {
      this._componentType = ComponentIgnored;
    }

    // regardless of type, if it begins with an underscore, this component should be ignored
    if (this.basename.startsWith('_')) {
      this._componentType = ComponentIgnored;
    }

    // object is immutable after initialization - except for children!
    Object.freeze(this);
  }

  createResource(app, options) {
    if (!this._module) {
      this._module = require(this.filepath).default;
    }
    return new this._module(app, options);
  }

  // not enumerable so no circular refs when stringifying
  get parent() {
    return this._parent;
  }

  get parentName() {
    return this.parent ? this.parent.name : '';
  }

  get hasChildren() {
    return Boolean(this.children.length);
  }

  get children() {
    return this._children;
  }

  add(component) {
    if (!component.isIgnored) {
      this._children.push(component);
    }
  }

  get isIndex() {
    if (!this.isFile) {
      return false;
    }

    let indexFileNames = [
      'root',
      'index',
      path.basename(path.resolve(this.filepath, '..')).toLowerCase()
    ];
    return contains(this.name, indexFileNames);
  }

  // when building the route from path components, use `component`, not `name`, because this provides smart substitution
  // route components are always converted to lowercase
  // if you want the original directory basename, use `basename`
  get name() {
    return (this.isParam ? this.basename.replace(/^{(.*)}$/, ':$1') : this.basename).toLowerCase();
  }

  get componentType() {
    return this._componentType;
  }

  get isDirectory() {
    return this._componentType == ComponentDirectory;
  }

  get isFile() {
    return this._componentType == ComponentFile;
  }

  get isParam() {
    return this._componentType == ComponentParam;
  }

  get isIgnored() {
    return this._componentType == ComponentIgnored;
  }

  get filepath() {
    return this._filepath;
  }

  get dirname() {
    return path.dirname(this._filepath);
  }

  get filename() {
    return path.basename(this.filepath);
  }

  get basename() {
    return path.basename(this.filename, '.js');
  }

  get extname() {
    return path.extname(this.filepath);
  }

  inspect() {
    let props = { };
    Object.keys(Object.getPrototypeOf(this)).forEach(key => {
      props[key] = this[key];
    });
    props.children = [];
    if (this.hasChildren) {
      this.children.forEach(child => {
        props.children.push(child.inspect());
      });
    }
    return props;
  }
}
