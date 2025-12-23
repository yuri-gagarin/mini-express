const http = require("http");
const methods = require("methods");
// const setPrototypeOf = require("setprototypeof");

const Layer = require("./layer");
const Router = require("./router");

const middleware = require("./middleware/init");

const app = exports = module.exports = {};
const slice = Array.prototype.slice;

app.init = function() {
  this.cache = {};
  this.engines = {};
  this.settings = {};

  // app router ?
  this._router = null;

  // console.log(this);
};

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    console.log("Initializing router in app.lazyrouter");
    this._router = new Router({});
    this._router.use(middleware.init(this));
  }
};

// for the static middleware? //
// to support prefixes //
app.use = function use(fn) {
  // this.lazyrouter();
  // this._router.use(fn);
  // return this;
  let offset = 0;
  let path = "/";

  // if the first argument is a string, treat it as the path
  if (typeof fn === "string") {
    path = fn;
    offset = 1;
  }

  this.lazyrouter();

  const callbacks = Array.prototype.slice.call(arguments, offset);

  for (const callback of callbacks) {
    console.log("Adding middleware for path: ", path);
    this._router.use(path, callback);
  }

  return this;
};


app.set = function set(setting, val) {
  if (arguments.length === 1) {
    return this.settings[setting];
  }
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
    console.log(`Defining app.${method} for path: `, path);
    this.lazyrouter();

    const route = this._router.route(path);

    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});






