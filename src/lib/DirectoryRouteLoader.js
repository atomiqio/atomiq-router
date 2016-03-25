import DirectoryRouteComponent from './DirectoryRouteComponent';
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { reject } from 'ramda';

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

  join(...routeComponents) {
    routeComponents = reject(comp => !comp, routeComponents);
    let joined = path.join(...routeComponents);
    if (joined.length > 1 && joined.endsWith('/')) {
      joined = joined.substr(0, joined.length - 1);
    }
    return joined;
  }

  loadRouteComponents(routesPath, rootComponent) {
    if (!rootComponent) {
      rootComponent = new DirectoryRouteComponent(routesPath);
    }

    let currentRoot = rootComponent;
    let files = fs.readdirSync(routesPath);

    files.forEach(filename => {
      let filepath = path.join(routesPath, filename);
      let component = new DirectoryRouteComponent(currentRoot, filepath);
      if (!component.isIgnored) {
        currentRoot.add(component);
        if (component.isDirectory || component.isParam) {
          this.loadRouteComponents(component.filepath, component);
        }
      }
    });

    return rootComponent;
  }

  load(routesPath, baseRoute = '/', baseRouter = this.router) {
    let rootComponent = this.loadRouteComponents(routesPath, rootComponent);
    log(`routes: ${JSON.stringify(rootComponent.inspect(), null, 2)}`);

    let loadLevel = (component, route, router, param) => {
      component.children.forEach(comp => {
        if (comp.isFile) {
          let Resource = require(comp.filepath).default;
          let resource = new Resource(this.app);
          let compRoute = comp.isIndex ? this.join(baseRoute, param) : this.join(baseRoute, param, comp.name);
          router.use(compRoute, resource.router);
        } else if (comp.isDirectory) {
          let subRouter = this._express.Router({ mergeParams: true });
          let subRoute = this.join(route, comp.name);
          router.use(subRoute, subRouter);
          loadLevel(comp, subRoute, subRouter);
        } else if (comp.isParam) {
          loadLevel(comp, route, router, comp.name);
        }
      });
    };

    loadLevel(rootComponent, baseRoute, baseRouter);
  }

}
