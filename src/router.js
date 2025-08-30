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
  let self = this;
  let stack = self.stack;
  let layer = stack[0];
  let route = layer.route;
  console.log(route.stack[0]);
  route.stack[0].handle_request(req, res);

};


