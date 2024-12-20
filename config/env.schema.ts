import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('develop', 'production'),
  PORT: Joi.number().default(3000),

  REQUESTS_TTL: Joi.number().default(60),
  REQUESTS_LIMIT: Joi.number().default(10),
  THROTTLING_SKIP_ORIGINS: Joi.string().default(''),

  OPEN_WEATHER_API_KEY: Joi.string().required(),
  OPEN_CITY_WEATHER_API_URL: Joi.string().required(),
  OPEN_CITY_FORECAST_API_URL: Joi.string().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  SALT_ROUNDS: Joi.number().default(10),
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_SECRET_KEY: Joi.string().required(),
  JWT_TOKEN_EXPIRATION_IN_MINUTES: Joi.number().default(10),
  JWT_REFRESH_TOKEN_EXPIRATION_IN_MINUTES: Joi.number().default(10080),
  JWT_REFRESH_TOKEN_ROTATION_PERIOD_IN_MINUTES: Joi.number().default(1440),
});
