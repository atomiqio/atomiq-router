import R from 'ramda';
import debug from 'debug';

const defaultOptions = {
  mergeParams: true
};

// http://expressjs.com/en/4x/api.html#app.METHOD
// verbs in roughly descending priority order (common verbs first)
// TODO: wrap in a set
const verbs = [
  'get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace',
  'checkout', 'connect', 'copy', 'lock',
  'merge', 'mkactivity', 'mkcol', 'move', 'm-search',
  'notify', 'propfind', 'proppatch', 'purge', 'report',
  'search', 'subscribe', 'unlock', 'unsubscribe'
];

export default class {
  constructor(app, options = {}) {
    this._log = debug(`app:route:${this.constructor.name.toLowerCase()}`);
    this._app = app;
    this._options = R.merge(defaultOptions, options);

    this._updateRouter(this);
  }

  get log() {
    return this._log;
  }

  get app() {
    return this._app;
  }

  get options() {
    return this._options;
  }

  get router() {
    if (!this._router) {
      this._router = this._express.Router({
        mergeParams: this.options.mergeParams
      });
    }
    return this._router;
  }

  get _express() {
    return this.app.get('express');
  }

  /**
   * Update the route instance's router by matching methods
   * named for HTTP verbs and assigning them to the router
   */
  _updateRouter(route) {

    /*
    (R.intersection(getMetods(route), verbs)).forEach(routeVerb => {
      route.log(`found route handler for '${routeVerb}' method`);
      route.router[routeVerb]('/', route[routeVerb].bind(route));
    });
    */

    this._getMethods(route).forEach(method => {
      let verb = this._startsWithVerb(method);
      if (verb) {
        let spec = this._routeify(method);
        if (spec) {
          route.log(`found route handler for '${spec.verb}' method`);
          route.router[spec.verb](spec.route, route[method].bind(route));
        }
      }
    });
  }

  /**
   * Get the methods defined on the instance's class
   */
  _getMethods(instance) {
    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
    return methods.filter(prop => {
      return typeof instance[prop] === 'function';
    });
  }

  /**
   * If methods starts with a recognized verb, return the verb, otherwise undefined
   */
  _startsWithVerb(method) {
    for (let i = 0; i < verbs.length; i++) {
      if (method.startsWith(verbs[i])) {
        return verbs[i];
      }
    }
  }

  _routeify(method) {
    method = method.replace(/\$/, ':');

    let result = {};
    let parts = method.split('_');

    result.verb = parts.shift();
    result.route = `/${parts.join('/')}`;

    if (!R.contains(result.verb, verbs)) {
      return;
    }
    return result;
  }
}
