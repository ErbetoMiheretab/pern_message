import { getTestDatabase } from "./db.js";

describe("Postgres integration", () => {
  it("should connect to Postgres", async () => {
    const db = getTestDatabase(false); // force Postgres
    await expect(db.authenticate()).resolves.not.toThrow();
    await db.close();
  });
});

// describe("SQLite unit tests", () => {
//   it("should connect to in-memory SQLite", async () => {
//     const db = getTestDatabase(true);
//     await expect(db.authenticate()).resolves.not.toThrow();
//     await db.close();
//   });
// });
