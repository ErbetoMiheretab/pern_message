import dotenv from "dotenv";
dotenv.config();

export const env = process.env.NODE_ENV || "development";
export const port = process.env.PORT || 4001;

export const db = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  name: process.env.DB_NAME,
  testName: process.env.DB_TEST_NAME,
};

export const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
};

// ---- ENV VALIDATION ----

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});

export default { env, port, db, redis };
