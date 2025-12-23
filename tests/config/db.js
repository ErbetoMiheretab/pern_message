// messaging/tests/config/database.js
import { Sequelize } from "sequelize";

export const getTestDatabase = () => {
  const useInMemory = process.env.USE_SQLITE === "true"; // opt‑in
  if (useInMemory) {
    // SQLite in-memory for fast unit tests
    return new Sequelize("sqlite::memory:", {
      dialect: "sqlite",
      logging: false,
      pool: {
        max: 1,
        min: 0,
        idle: 10000,
      },
    });
  } else {
    // Postgres for integration tests (Docker)
    return new Sequelize(
      process.env.DB_TEST_NAME || "messaging_test",
      process.env.DB_USER || "postgres",
      process.env.DB_PASS || "postgres",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
      }
    );
  }
};



