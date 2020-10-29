const userResolvers = require("./users");
const messageResolvers = require("./messages");

module.exports = {
  Message: {
    createdAt: (parent, _args, _context, _info) =>
      parent.createdAt.toISOString(),
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
};
