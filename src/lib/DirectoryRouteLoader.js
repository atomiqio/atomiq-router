import debug from 'debug';
import fs from 'fs';
import path from 'path';

const log = debug('app:directoryrouter');

export default class {
  constructor(app) {
    this.app = app;
  }

  get _express() {
    return this.app.get('express');
  }

  get router() {
    if (!this._router) {
      this._router = this._express.Router();
    }
    return this._router;
  }

  load(routesDir, router = this.router, baseRoute = '/') {
    let routes = fs.readdirSync(routesDir);

    // push any sub-directories, we need to process them after
    // processing all the files at the current level, because
    // sub-routers need to be added to exising routers
    let dirs = [];

    routes.forEach(filename => {
      if (filename.startsWith('_')) {
        log(`ignoring ${path.join(routesDir, filename)}`);
      } else {
        let type = fs.statSync(path.join(routesDir, filename));

        if (type.isDirectory()) {
          dirs.push(filename);
        } else if (type.isFile()) {
          let modulePath = path.join(routesDir, filename);
          let ext = path.extname(modulePath);

          if (ext === '.js') {
            try {
              let name = path.basename(modulePath, '.js').toLowerCase();
              let route = name === 'root' || name === path.basename(routesDir).toLowerCase() || name === 'index'
                ? '/' : `/${name}`;
              log(`loading route: ${this.join(baseRoute, route)}`);

              let Resource = require(modulePath).default;
              let resource = new Resource(this.app);
              router.use(route, resource.router);
              console.log(resource.router);
            } catch (err) {
              log(err);
            }
          }
        }
      }
    });

    dirs.forEach(dir => {
      let subroute;
      let subrouter = router;
      let subdir = path.join(routesDir, dir);

      // test if dir is a route parameter
      if (/^{.*}$/.test(dir)) {
        let param = dir.replace(/^{(.*)}$/, ":$1");

        // append the route param to the route
        subroute = this.join(baseRoute, param);
        log(`dir => ${dir}, param => ${param}, $ROUTE => ${subroute}`);
      } else {
        // append the actual dir name to the route
        subroute = this.join(baseRoute, dir);

        // dir is not a route param but a true route component,
        // so create a new subrouter and attach to current router
        subrouter = this._express.Router({
          mergeParams: true
        });
        router.use(subroute, subrouter);
        log(`dir => ${dir}, $ROUTE => ${subroute}`);
      }

      log(`processing directory for: ${subroute}`);
      this.load(subdir, subrouter, subroute);
    });
  }

  join(base, route) {
    let joined = path.join(base, route);
    if (joined.length > 1 && joined.endsWith('/')) {
      joined = joined.substr(0, joined.length - 1);
    }
    return joined;
  }
}
