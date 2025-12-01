const methods = require("methods");
const flatten = require("flatten");

const Layer = require("./layer");

function Route(path) {
  this.path = path;
  this.stack = [];
  this.methods = {};
}

Route.prototype.dispatch = function dispatch(req, res, done) {

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