const dotenv = require("dotenv");
dotenv.config();

// Helper: trim env vars to remove PowerShell newline artifacts
const env = (key, fallback = "") => (process.env[key] || fallback).trim();

module.exports = {
  PORT: parseInt(env("PORT", "5000"), 10),
  NODE_ENV: env("NODE_ENV", "development"),
  MONGODB_URI: env("MONGODB_URI", "mongodb://localhost:27017/soc_ai_assistant"),

  JWT_SECRET: env("JWT_SECRET", "fallback_secret_not_for_production"),
  JWT_EXPIRES_IN: env("JWT_EXPIRES_IN", "8h"),
  JWT_REFRESH_EXPIRES_IN: env("JWT_REFRESH_EXPIRES_IN", "7d"),

  HUGGINGFACE_API_TOKEN: env("HUGGINGFACE_API_TOKEN"),
  HUGGINGFACE_MODEL: env("HUGGINGFACE_MODEL", "meta-llama/Llama-2-13b-chat-hf"),

  MAX_FILE_SIZE_MB: parseInt(env("MAX_FILE_SIZE_MB", "10"), 10),
  UPLOAD_DIR: env("UPLOAD_DIR", "./uploads"),

  MAX_LOGIN_ATTEMPTS: parseInt(env("MAX_LOGIN_ATTEMPTS", "5"), 10),
  LOCK_DURATION_MINUTES: parseInt(env("LOCK_DURATION_MINUTES", "30"), 10),

  CORS_ORIGIN: env("CORS_ORIGIN", "http://localhost:5173"),
};

