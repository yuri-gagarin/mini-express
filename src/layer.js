module.exports = Layer;

function Layer(path, options, fn) {
  if (!(this instanceof Layer)) {
    return new Layer(path, options, fn);
  }

  this.handle = fn;
  this.name = fn.name || "<anonymous>";
  this.params = null;
  this.path = null;

};

Layer.prototype.match = function match(path) {
  console.log("Match name: ", this.name);
  if (this.route && this.route.path === path) {
    return true;
  }
  if (this.name === "expressInit") {
    console.log("Matchig inits: ")
    return true;
  }

  return false;
};

Layer.prototype.handle_request = function handle(req, res, next) {
  let fn = this.handle;
  console.log("This context: ", this);
  console.log("Handling request in Layer: ", this.name);
  console.log("Layer method: ", this.method);
  console.log("Method: ", req.method);
  try {
    fn(req, res, next);
  } catch (error) {
    console.log("Module: Layer - Error");
    console.error(error);
    process.exit(1);
  }
};


