require("dotenv/config");

module.exports = {
  development: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: "db_messenger_chat_app",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
