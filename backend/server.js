const app = require("./app");
const env = require("./src/config/environment");
const { sequelize } = require("./src/models");
const logger = require("./src/utils/logger");
const { syncDatabase } = require("./src/database/sync");
const { seedDatabase } = require("./src/database/seed");

const startServer = async () => {
  try {
    logger.info("Connecting to MySQL Database...");
    await sequelize.authenticate();
    logger.info("Successfully connected to MySQL database via Sequelize ORM.");
    syncDatabase();
    seedDatabase();
    
    app.listen(env.PORT, () => {
      logger.info(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Database connection failure. Server initialization aborted: %s", error.stack);
    process.exit(1);
  }
};

startServer();
