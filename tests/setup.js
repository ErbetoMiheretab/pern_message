import { getTestDatabase } from "../src/config/db.js";
const db = getTestDatabase(false); // use SQLite in-memory by default

beforeAll(async () => {
  // Connect and sync all models
  await db.authenticate();
  await db.sync({ force: true }); // drop & recreate tables
});

beforeEach(async () => {
  // Reset tables before each test
  await db.sync({ force: true });
});

afterAll(async () => {
  // Close connection after tests
  await db.close();
});

export default db;