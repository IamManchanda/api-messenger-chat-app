const { User } = require("../../models");

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    register: async (_parent, args, _context, _info) => {
      const { username, email, password, confirmPassword } = args;

      try {
        const user = await User.create({
          username,
          email,
          password,
        });
        return user;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
