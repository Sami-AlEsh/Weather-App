import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('develop', 'production'),
  PORT: Joi.number().default(3000),

  REQUESTS_TTL: Joi.number().default(60),
  REQUESTS_LIMIT: Joi.number().default(10),
  THROTTLING_SKIP_ORIGINS: Joi.string().default(''),

  OPEN_WEATHER_API_KEY: Joi.string().required(),
  OPEN_WEATHER_API_URL: Joi.string().required(),
});
