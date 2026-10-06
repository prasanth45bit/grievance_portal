const { sequelize } = require("../models");
const logger = require("../utils/logger");

const syncDatabase = async () => {
  try {
    logger.info("Initializing schema synchronization with MySQL database...");

    await sequelize.sync({ force: false });

    logger.info("Database schema synchronized successfully. All tables created.");
  } catch (error) {
    logger.error("Failed to synchronize database schema: %s", error.stack);
    throw error;
  }
};

module.exports = { syncDatabase };
