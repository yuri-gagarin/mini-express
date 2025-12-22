module.exports = Layer;

function Layer(path, options, fn) {
  if (!(this instanceof Layer)) {
    return new Layer(path, options, fn);
  }

  this.handle = fn;
  this.name = fn.name || "<anonymous>";
  this.params = null;
  this.path = path;

};

Layer.prototype.match = function match(path) {
  console.log("Match name: ", this.name);

  // matching a specific rout
  if (this.route && this.route.path === path) {
    return true;
  }

  // MIDDLEWARE matching
  if (!this.route) {
    if (this.path === "/") {
      return true;
    }

    // check for a mount path
    if (path.startsWith(this.path)) {
      return true;
    } 
  }

  return false;
};

Layer.prototype.handle_request = function handle(req, res, next) {
  console.log("Layer handling request for path: ", this.path);
  let fn = this.handle;
  
  // For middleware (no route), strip the mount path from req.url
  if (!this.route && this.path !== '/') {
    console.log("Running middleware named: ", this.name);
    const originalUrl = req.url;
    
    // Strip the mount path
    if (req.url.startsWith(this.path)) {
      req.url = req.url.slice(this.path.length) || '/';
    }
    
    // Restore after middleware completes
    const originalNext = next;
    next = function() {
      req.url = originalUrl;
      originalNext();
    };
  }
  
  try {
    fn(req, res, next);
  } catch (error) {
    console.log("Module: Layer - Error");
    console.error(error);
    process.exit(1);
  }
};


