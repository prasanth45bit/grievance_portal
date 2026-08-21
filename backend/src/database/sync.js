const { sequelize } = require("../models");
const logger = require("../utils/logger");

const syncDatabase = async () => {
  try {
    logger.info("Initializing schema synchronization with MySQL database...");
    
    // Force true drops existing tables and builds a clean database
    await sequelize.sync({ force: true });
    
    logger.info("Database schema synchronized successfully. All tables created.");
    process.exit(0);
  } catch (error) {
    logger.error("Failed to synchronize database schema: %s", error.stack);
    process.exit(1);
  }
};

syncDatabase();
