# atomiq

[![c][npm-image]][npm-url] [![Join the chat at https://gitter.im/atomiqio/atomiq](https://badges.gitter.im/atomiqio/atomiq.svg)](https://gitter.im/atomiqio/atomiq?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Microservices with Docker and Node.js (ES6/7)

`atomiq` provides very lightweight structure and support useful for Express-based microservices. It is
not a framework and doesn't get in the way of Express, but it does offer a nice convention
for directory-based routing that you can use if you choose to.

Atomiq uses ES6 classes and ES7 async/await. See [atomiq-cli](https://github.com/atomiqio/atomiq-cli) for scaffolding microservice packages with full Babel and Docker support.

## Routing

Automatic routing is optional. Use the [atomiq-cli](https://github.com/atomiqio/atomiq-cli) to generate new projects and examine the sample routes.

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


[npm-image]: https://badge.fury.io/js/atomiq.svg
[npm-url]: https://npmjs.org/package/atomiq
