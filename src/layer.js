module.exports = Layer;

function Layer(path, options, fn) {
  if (!(this instanceof Layer)) {
    return new Layer(path, options, fn);
  }

  this.handle = fn;
  this.name = fn.name || "<anonymous>";
  this.params = null;
  this.path = path;
  this.params = {};

};

Layer.prototype.match = function match(path) {
  // console.log("Match name: ", this.name);
  
  // matching a specific rout
  if (this.route) {
    console.log(`MATCHING: Requested path >>> ${path} to Route >>> ${this.route.path}`);
    // const routePath = this.route.path;
    // console.log("Working");
    // console.log("Path: ", path);
    // console.log("Route: ", routePath);
    const routePath = this.route.path;

    // split to compare 
    const routeSegments = routePath.split("/");
    const pathSegments = path.split("/");

    // path and routePath have to have same number of segments
    if (routeSegments.length !== pathSegments.length) {
      return false;
    }

    // compare the segments
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSeg = routeSegments[i];
      const pathSeg = pathSegments[i];

      // static segment mismatch? return false immediately
      if (!routeSeg.startsWith(":") && routeSeg !== pathSeg) {
        return false;
      }

      // If we find a parameter, extract it
      if (routeSeg.startsWith(":")) {
        const paramName = routeSeg.slice(1);
        this.params[paramName] = pathSeg;
      }
    }
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


