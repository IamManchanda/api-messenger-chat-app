const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { User } = require("../../models");
const capitalize = require("../utils/capitalize");

module.exports = {
  Query: {
    getUsers: async (_parent, _args, context, _info) => {
      try {
        let user;

        if (context.req && context.req.headers.authorization) {
          const token = context.req.headers.authorization.split("Bearer ")[1];
          jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
            if (error) {
              throw new AuthenticationError("Unauthenticated");
            }
            user = decodedToken;
            console.log(user);
          });
        }

        const users = await User.findAll({
          where: {
            username: {
              [Op.ne]: user.username,
            },
          },
        });
        return users;
      } catch (error) {
        console.log(JSON.stringify(error, null, 2));
        throw error;
      }
    },
    login: async (_parent, args, _context, _info) => {
      const { username, password } = args;
      let errors = {};

      try {
        if (username.trim() === "") {
          errors.username = "Username must not be empty";
        }

        if (password === "") {
          errors.password = "Password must not be empty";
        }

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("Bad Input", { errors });
        }
        const user = await User.findOne({ where: { username } });

        if (!user) {
          errors.username = "User not found";
          throw new UserInputError("User not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = "Password is incorrect";
          throw new UserInputError("Incorrect Password", { errors });
        }

        const token = jwt.sign(
          {
            username,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: 60 * 60,
          },
        );

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          token,
        };
      } catch (error) {
        console.log(JSON.stringify(error, null, 2));
        throw error;
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
        console.log(JSON.stringify(error, null, 2));
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
