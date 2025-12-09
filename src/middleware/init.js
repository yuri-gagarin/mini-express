const setPrototypeOf = require("setprototypeof");

exports.init = function(app) {
  return function expressInit(req, res, next) {
    console.log("Inside expressInit middleware");
    setPrototypeOf(res, app.response);
    next();
  }
}