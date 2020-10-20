const { ApolloServer } = require("apollo-server");
const { sequelize } = require("../models");

const typeDefs = require("./graphql/type-defs");
const resolvers = require("./graphql/resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
});
