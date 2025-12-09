const http = require("http");
const mixin = require("merge-descriptors");
const proto = require("./app");

exports = module.exports = createApplication;

function createApplication() {
  let app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, proto, false);

  const req = Object.create(http.IncomingMessage.prototype);
  const res = Object.create(http.ServerResponse.prototype);

  res.send = function(body) {
    console.log("Response send body: ", body);
  }  

  app.response = Object.create(res, {
    app: {
      configurable: true, enumerable: true, writable: true, value: app
    }
  });

  
  app.init();
  return app;
};

exports.application = proto;


