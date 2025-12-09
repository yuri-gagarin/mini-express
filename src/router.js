const parseUrl = require("parseurl");
const setPrototypeOf = require("setprototypeof");

const Route = require("./route");
const Layer = require("./layer");

const proto = module.exports = function(options) {
  const opts = options || {};

  function router(req, res, next) {
    router.handle(req, res, next);
  }

  setPrototypeOf(router, proto);

  /* express specific */
  router.params = {};
  router._params = [];
  router.caseSensitive = opts.caseSensitive;
  router.mergeParams = opts.mergeParams;
  router.strict = opts.strict;
  // the stack for the router
  router.stack = [];

  return router;
};

proto.route = function route(path) {
  console.log("Creating route for path: ", path);

  // Look for existing route with this path
  for (let i = 0; i < this.stack.length; i++) {
    let layer = this.stack[i];
    if (layer.route && layer.route.path === path) {
      console.log("Reusing existing route for path: ", path);
      return layer.route;
    }
  }

  // Create new route if none exists
  let route = new Route(path);
  let layer = new Layer(path, {}, route.dispatch.bind(route));

  layer.route = route;
  this.stack.push(layer);

  return route;
};

proto.handle = function handle(req, res, out) {
    let self = this;
    let stack = self.stack;
    let index = 0;
    console.log("Router handling request for URL: ", req.url);
    console.log("Stack is the following: ", stack);
    
    next();

    function next() {
      try {
      // resolve the URL path from the {req} object
      let path = getPathName(req);

      let layer;
      let match;
      let route;

      while (match !== true && index < stack.length) {
        layer = stack[index++];
        match = matchLayer(layer, path);
        route = layer.route;
        console.log("Route found: ", route);
        console.log("Method: ", req.method);

        if (match !== true) {
          continue;
        }

        if (!route) {
          // process non route handler normally
          continue;
        }

        // Let the route handle method matching
        route.dispatch(req, res, next);
        return;
      }

      console.log("Match result: ", match);
      if (match) {
        console.log("Non Layer matched");
        console.log(layer);
        layer.handle_request(req, res, next);
        return;
      }

      if (req && typeof req === "object" &&  req.method && req.url) {
        console.log("No matching route found for URL: ", req.url);
        res.statusCode = 404;
        res.end("Cannot " + req.method + " " + req.url);
      }

    } catch (error) {
      console.log("Module: Router - [proto.handle] Error");
      console.error(error);
      process.exit(1);
    }
  }
};

proto.use = function use(fn) {
  const layer = new Layer("/", {}, fn);
  layer.route = null;

  this.stack.push(layer);

  return this;
}

function getPathName(req) {
  try {
    if (req && typeof req === "object") {
      console.log("Parsing URL for request: ", req.url);
      return parseUrl(req).pathname;
    }
    if (req && typeof req === "function") {
      return "";
    }
    return null;
  } catch (error) {
    console.log("Module: Router - [getPathName] Error");
    console.error(error);
    process.exit(1);
  }
}

function matchLayer(layer, path) {
  try {
    return layer.match(path);
  } catch (error) {
    console.log("Module: Router - [matchLayer] Error");
    console.error(error);
    process.exit(1);
  }
}


