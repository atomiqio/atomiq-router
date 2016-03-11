atomiq
======

> Microservices with Docker and Node.js (ES6/7)

`atomiq` provides very lightweight structure and support useful for Express-based microservices. It is
not a framework and doesn't get in the way of Express, but it does offer a nice convention
for directory-based routing that you can use if you choose to.

It generates a few sample routes using ES6 classes and provides
npm run script support for:

  * `npm run babel` (includes support for ES6 and async/await)
  * `npm run watch`
  * `npm run nodemon`

Features:

  * Docker support for production and development, including debugging support with [Node Inspector](https://github.com/node-inspector/node-inspector)
  * Signal handling for graceful server shutdown (including inside of Docker containers)
  * [Babel](https://babeljs.io) support
  * [ESLint](http://eslint.org/) / [esformatter](https://github.com/millermedeiros/esformatter) support


## Generating an `atomiq` microservice

Install [Yeoman](http://yeoman.io)

    npm install -g yo

Install [generator-atomiq](https://github.com/atomiqio/generator-atomiq)

    npm install -g generator-atomiq


Then generate your new microservice project:

```bash
yo atomiq [name]
```

## Routing

This will be more fully documented shortly.


Automatic routing is optional. Please see the automatically generated routes for now.

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
