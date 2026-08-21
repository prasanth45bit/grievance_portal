const { Sequelize } = require("sequelize");
const env = require("./environment");
const logger = require("../utils/logger");

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
  host: env.DB.HOST,
  port: env.DB.PORT,
  dialect: "mysql",
  logging: env.NODE_ENV === "development" ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

module.exports = sequelize;
