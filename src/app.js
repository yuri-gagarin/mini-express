const http = require("http");
const fs = require("fs");
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
  const viewEngine = this.get("view engine");

  if (!viewEngine) {
    const err = new Error(`No default view engine set`);
    return cb(err);
   }
  // console.log("Rendering view: ", name, " with ext: ", ext);


  // no extension ? then use the default view 
  if (!ext) {
    ext = viewEngine[0] !== "." ? `.${viewEngine}` : viewEngine;
    name += ext;
  }

  // resolve the templates directory
  const viewsDir = this.get("views") || "./views";
  const templatePath = path.resolve(viewsDir, name);

  // check for an existing template at its path
  // we could do this async but for simplicity we'll do sync here
  const stats = fs.statSync(templatePath);
  if (!stats || !stats.isFile()) {
    const err = new Error(`Template not found: ${templatePath}`);
    return cb(err);
  }

  const engine = this.engines[ext];

  if (!engine) {
    const err = new Error(`No view engine registered for extension: ${ext}`);
    return cb(err);
  }

  try {
    engine(templatePath, dataToSend, cb);
  } catch (err) {
    return cb(err);
  }
}

app.set = function set(setting, val) {
  if (arguments.length === 1) {
    return this.settings[setting];
  }
  this.settings[setting] = val;

  switch (setting) {
    case "view engine": {
      // require and register the engine
      try {
        const ext = val[0] !== "." ? "." + val : val;
        const module = require(val);
        const engine = module.__express || module.renderFile || module;
        this.engines[ext] = engine;
        console.log(`Registered view engine for extension ${ext}`);
        console.log(this.engines);
        break;
      } catch (error) {
        throw new Error(`Failed to load view engine "${val}". Did you install it? (npm install ${val})`);
      }
    }
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






