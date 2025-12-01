const methods = require("methods");
const flatten = require("flatten");

const Layer = require("./layer");

function Route(path) {
  this.path = path;
  this.stack = [];
  this.methods = {};
}

Route.prototype.dispatch = function dispatch(req, res, done) {
  let method = req.method.toLowerCase();
  
  // Find handler for this method in the route's stack
  console.log("Processing method in route.dispatch: ", method.toUpperCase());
  console.log("Requested URL: ", req.url);
  console.log("Route path: ", this.path); 
  console.log("Route defined methods: ", this.methods);

  for (let i = 0; i < this.stack.length; i++) {
    let layer = this.stack[i];
    if (layer.method === method) {
      layer.handle_request(req, res, done);
      return;
    }
  }
  
  // Method not found - return 405 if route has methods
  if (Object.keys(this.methods).length > 0) {
    res.statusCode = 405;
    res.setHeader('Allow', Object.keys(this.methods).join(', ').toUpperCase());
    res.end('Method Not Allowed');
  }
};

methods.forEach(function(method) {
  Route.prototype[method] = function() {
    let handles = flatten(Array.prototype.slice.call(arguments));
    console.log("Arguments in route.js ", arguments);
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];

      if (typeof handle !== "function") {
        const type = toString.call(handle);
        const message = `Route.${method}() requires a callback function but got a ${type}`;
        throw new Error(message);
      }

      const layer = Layer("/", {}, handle);
      layer.method = method;  

      this.methods[method] = true;
      this.stack.push(layer);
    }
  }
});

module.exports = Route;