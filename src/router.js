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
  let route = new Route(path);
  let layer = new Layer(path, {}, route.dispatch.bind(route));

  layer.route = route;
  this.stack.push(layer);

  return route;
};

proto.handle = function handle(req, res, out) {
  try {
    let self = this;
    let stack = self.stack;
    let path = getPathName(req);


    let layer;
    let match;
    let route;
    let index = 0;

    while (match !== true && index < stack.length) {
      layer = stack[index++];
      match = matchLayer(layer, path);
      route = layer.route;

      if (match !== true) {
        continue;
      }

      if (!route) {
        // process non route handler normally
        continue;
      }

      route.stack[0].handle_request(req, res);
    }
  } catch (error) {
    console.log("Module: Router - [proto.handle] Error");
    console.error(error);
    process.exit(1);
  }
};

function getPathName(req) {
  try {
    return parseUrl(req).pathname;
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


