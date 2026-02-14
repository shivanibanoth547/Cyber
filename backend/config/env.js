const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/soc_ai_assistant",

  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret_not_for_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  HUGGINGFACE_API_TOKEN: process.env.HUGGINGFACE_API_TOKEN || "",
  HUGGINGFACE_MODEL:
    process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-2-13b-chat-hf",

  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",

  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
  LOCK_DURATION_MINUTES:
    parseInt(process.env.LOCK_DURATION_MINUTES, 10) || 30,

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
