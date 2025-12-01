const http = require("http");
const methods = require("methods");
const setPrototypeOf = require("setprototypeof");

const Layer = require("./layer");
const Router = require("./router");

const app = exports = module.exports = {};
const slice = Array.prototype.slice;

app.init = function() {
  this.cache = {};
  this.engines = {};
  this.settings = {};

  // app router ?
  this._router = null;
};

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({});
  }
};

app.set = function set(setting, val) {
  this.settings[setting] = val;

  switch (setting) {
    case "etag": {
      this.set("etag fn", "");
      break;
    }
    case "query parser": {
      this.set("query parser fn", "");
      break;
    }
    case "trust proxy": {
      this.set("trust proxy fn", "");
      break;
    } 
  }

  return this;
}

app.enabled = function enabled(setting) {
  return Boolean(this.set(setting));  
}

app.listen = function listen() {
  const server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

app.handle = function handle(req, res, next) {
  const router = this._router;
  router.handle(req, res);
};

methods.forEach(function(method) {
  app[method] = function(path) {

    this.lazyrouter();

    const route = this._router.route(path);

    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});






