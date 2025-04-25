// authProcessor.js
module.exports = {
    config: {},
    beforeRequest: function (req, context, ee, next) {
      if (req.headers && context.vars.authToken) {
        req.headers.Authorization = `Bearer ${context.vars.authToken}`;
      }
      return next();
    }
  };
  