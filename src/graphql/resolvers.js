const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");

const { User } = require("../../models");
const capitalize = require("../utils/capitalize");

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
      let errors = {};

      try {
        if (username.trim() === "") {
          errors.username = "Username must not be empty";
        }

        if (email.trim() === "") {
          errors.email = "Email must not be empty";
        }

        if (password.trim() === "") {
          errors.password = "Password must not be empty";
        }

        if (confirmPassword.trim() === "") {
          errors.confirmPassword = "Confirm Password must not be empty";
        }

        if (password !== confirmPassword) {
          errors.confirmPassword = "Password and Confirm Password must match";
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        const user = await User.create({
          username,
          email,
          password: hashedPassword,
        });
        return user;
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          error.errors.forEach((err) => {
            errors[err.path] = `${capitalize(err.path)} is already taken`;
          });
        } else if (error.name === "SequelizeValidationError") {
          error.errors.forEach((err) => {
            errors[err.path] = err.message;
          });
        }
        throw new UserInputError("Bad Input", { errors });
      }
    },
  },
};
