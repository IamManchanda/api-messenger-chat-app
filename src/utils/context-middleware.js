const jwt = require("jsonwebtoken");

module.exports = (context) => {
  if (context.req && context.req.headers.authorization) {
    const token = context.req.headers.authorization.split("Bearer ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if (error) {
        // throw new AuthenticationError("Unauthenticated");
      }
      context.user = decodedToken;
    });
  }

  return context;
};
