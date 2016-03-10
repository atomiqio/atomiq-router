atomiq
======

> Microservices with Docker and Node.js (ES6/7)

`atomiq` provides very lightweight structure and support useful for Express-based microservices. It is
not a framework and doesn't get in the way of Express, but it does offer a nice convention
for directory-based routing that you can use if you choose to.

It generates ES6 source files and provides npm run script support for `npm run babel`, `npm run watch`,
and `npm run nodemon`.

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
