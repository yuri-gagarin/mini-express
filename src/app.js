const http = require("http");
const methods = require("methods");
const path = require("path");
// const setPrototypeOf = require("setprototypeof");

const Layer = require("./layer");
const Router = require("./router");

const middleware = require("./middleware/init");

const app = exports = module.exports = {};
const slice = Array.prototype.slice;

// main initialization function
app.init = function() {
  this.cache = {};
  this.engines = {};
  this.settings = {};

  // app router ?
  this._router = null;

  // console.log(this);
  defineHttpMethods(this);
};

app.enabled = function enabled(setting) {
  return Boolean(this.set(setting));  
};

app.engine = function engine(ext, fn) {
  // 
  const extension = ext[0] !== "." ? `.${ext}` : ext;
  this.engines[extension] = fn;

  return this;
};

app.handle = function handle(req, res, next) {
  const router = this._router;
  router.handle(req, res);
};

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    console.log("Initializing router in app.lazyrouter");
    this._router = new Router({});
    this._router.use(middleware.init(this));
  }
};

app.render = function render(name, data, cb) {
  const dataToSend = data || {};

  // callback may optionally be the second argument?
  if (typeof data === "function") {
    cb = data;
    dataToSend = {};
  }

  let ext = path.extname(name);
  // console.log("Rendering view: ", name, " with ext: ", ext);

  res.end(`Rendering view: ${name} with data: ${JSON.stringify(dataToSend)}`);
  // no extension ? then use the default view 
  if (!ext) {
    const viewEngine = this.get("view engine");
  }
}

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
};

// for the static middleware? //
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

app.listen = function listen() {
  const server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

function defineHttpMethods(app) {
  methods.forEach(function(method) {
    if (method === "get") {
      app[method] = function(pathOrSetting) {
        // Special handling for [app.get()] tpo support both routes and app.get("whatever setting") //
        if (arguments.length > 1) {
          console.log(`Defining app.${method} for path: `, pathOrSetting);
          this.lazyrouter();

          const route = this._router.route(pathOrSetting);
          route[method].apply(route, slice.call(arguments, 1));
          return this;
        };

        // single arg, a getter for settings
        return this.settings[pathOrSetting];
      }
    } else {
      // This handles all other HTTP methods normally
      app[method] = function(urlPath) {
        console.log(`Defining app.${method} for path: `, urlPath);
        this.lazyrouter();
        const route = this._router.route(urlPath);
        route[method].apply(route, slice.call(arguments, 1));
        return this;
      };
    }
  });
};






