const {
  UserInputError,
  AuthenticationError,
  PubSub,
} = require("apollo-server");
const { Op } = require("sequelize");
const { User, Message } = require("../../../models");

const pubsub = new PubSub();

module.exports = {
  Query: {
    getMessages: async (_parent, { from }, { user }, _info) => {
      try {
        if (!user) {
          throw new AuthenticationError("Unauthenticated");
        }

        const otherUser = await User.findOne({
          where: {
            username: from,
          },
        });

        if (!otherUser) {
          throw new UserInputError("User not found");
        }

        const usernames = [user.username, otherUser.username];

        const messages = await Message.findAll({
          where: {
            from: {
              [Op.in]: usernames,
            },
            to: {
              [Op.in]: usernames,
            },
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    sendMessage: async (_parent, { to, content }, { user }, _info) => {
      try {
        if (!user) {
          throw new AuthenticationError("Unauthenticated");
        }

        const recipient = await User.findOne({
          where: {
            username: to,
          },
        });

        if (!recipient) {
          throw new UserInputError("User not found");
        } else if (recipient.username === user.username) {
          throw new UserInputError("You can't message yourself");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const message = await Message.create({
          from: user.username,
          to,
          content,
        });

        pubsub.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: () => pubsub.asyncIterator(["NEW_MESSAGE"]),
    },
  },
};
