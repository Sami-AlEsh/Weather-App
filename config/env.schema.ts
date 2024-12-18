import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('develop', 'production'),
  PORT: Joi.number().default(3000),
});
