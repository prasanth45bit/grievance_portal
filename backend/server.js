const app = require("./app");
const env = require("./src/config/environment");
const { sequelize } = require("./src/models");
const logger = require("./src/utils/logger");

const { syncDatabase } = require("./src/database/sync");
const { seedDatabase } = require("./src/database/seed");

const startServer = async () => {
  try {
    logger.info("Connecting to MySQL Database...");

    // 1. Connect
    await sequelize.authenticate();

    logger.info(
      "Successfully connected to MySQL database via Sequelize ORM."
    );

    // 2. Create/update tables
    await syncDatabase();

    // 3. Insert initial data
    await seedDatabase();

    // 4. Start Express
    app.listen(env.PORT, () => {
      logger.info(
        `Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
    });

  } catch (error) {
    logger.error(
      "Database/server initialization failed: %s",
      error.stack
    );

    process.exit(1);
  }
};

startServer();
