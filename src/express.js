const http = require("http");
const fs = require("fs");
const mixin = require("merge-descriptors");
const path = require("path");
//
const proto = require("./app");
//
const { mimeTypes } = require("./constants/mime_types");

exports = module.exports = createApplication;

function createApplication() {
  let app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, proto, false);

  const req = Object.create(http.IncomingMessage.prototype);
  const res = Object.create(http.ServerResponse.prototype);

  res.status = function(code) {
    if (typeof code !== "number") {
      throw new Error("Status code must be a number");
    }

    if (code < 100 || code > 599) {
      throw new RangeError("Status code must be between 100 and 599");
    }

    if (this.headersSent) {
      console.warn("Headers already sent, cannot set status code");
      return this;
    }
    this.statusCode = code;
    return this;
  }

  res.send = function(body) {
    console.log("Response send body: ", body);
    if (typeof body === "object") {
      this.setHeader("Content-Type", "application/json");
      this.end(JSON.stringify(body));
    } else if (typeof body === "string") {
      this.setHeader("Content-Type", "text/plain");
      this.end(body, "utf-8");
    } else if (typeof body === "number") {
      this.statusCode = body;
      this.end(http.STATUS_CODES[body]);
    } else {
      this.end(body);
    }
    return this;
  }  

  res.json = function(obj) {
    this.setHeader("Content-Type", "application/json");
    this.end(JSON.stringify(obj));
    return this;
  };

  res.redirect = function(status, url) {
    if (arguments.length === 1) {
      console.log("Default 302 redirect!");
      url = status;
      status = 302;
    }

    // redirect status code validation
    if (![301, 302, 303, 307, 308].includes(status)) {
      throw new Error("Invalid redirect status code");
    }
    if (url === "back") {
      url = this.req.get("Referrer") || "/";
    }

    // TDOO: Perhaps Handle relative URLs like ../ amd ./settings

    this.statusCode = status;
    this.setHeader("Location", url);
    this.end();
  };

  res.sendFile = function(filePath, options) {
    // grab absolute path 
    const absolutePath = path.resolve(filePath);

    // whatever we are sending it has to exist, otherwise error
    fs.stat(absolutePath, (err, stats) => {
      if (err || !stats.isFile()) {
        this.statusCode = 404;
        this.end(`File: ${filePath} not found!`);
      }
    });

    // Resolve the Content-Type from the filename
    const ext = path.extname(absolutePath).toLowerCase().slice(1);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(absolutePath, (err, data) => {  
      if (err) {
        this.statusCode = 500;
        this.end(`Error reading file`);
        return;
      }

      this.setHeader("Content-Type", contentType);
      this.end(data);
    });
  };    

  app.response = Object.create(res, {
    app: {
      configurable: true, enumerable: true, writable: true, value: app
    }
  });

  
  app.init();
  return app;
};

exports.application = proto;


