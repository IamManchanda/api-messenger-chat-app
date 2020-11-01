const userResolvers = require("./users");
const messageResolvers = require("./messages");

const { User, Message } = require("../../../models");

module.exports = {
  Message: {
    createdAt: (parent, _args, _context, _info) =>
      parent.createdAt.toISOString(),
  },
  Reaction: {
    createdAt: (parent, _args, _context, _info) =>
      parent.createdAt.toISOString(),
    message: async (parent, _args, _context, _info) =>
      await Message.findByPk(parent.messageId),
    user: async (parent, _args, _context, _info) =>
      await User.findByPk(parent.userId, {
        attributes: ["username", "imageUrl", "createdAt"],
      }),
  },
  User: {
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
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
