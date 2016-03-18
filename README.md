atomiq
======

> Microservices with Docker and Node.js (ES6/7)

`atomiq` provides very lightweight structure and support useful for Express-based microservices. It is
not a framework and doesn't get in the way of Express, but it does offer a nice convention
for directory-based routing that you can use if you choose to.

Atomiq uses ES6 classes and ES7 async/await. See [atomiq/generator-atomiq](https://github.com/atomiqio/generator-atomiq) (a Yeoman generator) for scaffolding microservice packages with full Babel and Docker support.

## Routing

Automatic routing is optional. Use the [generator](https://github.com/atomiqio/generator-atomiq) to see examples of automatically generated routes for now.

Routes are ES6 modules that export a default class.

If you decide to add a constructor to your class, make sure to call super(app):

    default export class MyRoute extends Route {
      constructor(app) {
        super(app);

        // you have access to the app and the express router for this route
        this.app ...
        this.router ...
      }
    }

All [Express/HTTP methods](http://expressjs.com/en/4x/api.html#app.METHOD) are supported. Any method matching a verb name is automatically
added to the router for this route. If you need to use an HTTP verb that is not a
valid JavaScript name (there is only one: 'm-search'), you will need to attach it to `this.router` in the constructor:

    this.router['m-search'](req, res) {
      ...
    }
